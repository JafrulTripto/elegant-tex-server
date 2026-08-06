<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\StockMovementType;
use App\Models\Order;
use App\Models\OrderStatusChange;
use App\Models\Product;
use App\Models\ProductKind;
use App\Models\StockMovement;
use Exception;
use Illuminate\Support\Facades\DB;

class StockService
{
    /** Order statuses eligible to match against and pull from Ready Stock (ADR 0003). */
    public const ELIGIBLE_STATUSES = [
        OrderStatus::DRAFT->value,
        OrderStatus::BOOKING->value,
        OrderStatus::APPROVED->value,
    ];

    /**
     * Mark order lines as returned (with condition). Sellable lines feed Ready Stock.
     *
     * @param array $lines list of ['productId' => int, 'condition' => 'SELLABLE'|'DAMAGED']
     * @throws Exception
     */
    public function recordReturn(Order $order, array $lines, ?int $userId = null): void
    {
        DB::transaction(function () use ($order, $lines, $userId) {
            $returned = [];
            foreach ($lines as $line) {
                $product = Product::where('id', $line['productId'])
                    ->where('order_id', $order->id)
                    ->firstOrFail();

                if ($product->is_returned) {
                    continue; // already returned; idempotent
                }

                $condition = strtoupper($line['condition']);
                $product->is_returned = true;
                $product->return_condition = $condition;
                $product->returned_at = now();
                $product->save();
                $returned[] = $condition;

                if ($condition === 'SELLABLE') {
                    $kindId = $product->product_kind_id;
                    if (!$kindId) {
                        // Backfill safety: resolve the kind from the line's raw triple.
                        $raw = \Illuminate\Support\Facades\DB::table('products')
                            ->where('id', $product->id)
                            ->first(['type_id', 'fabric_type_id', 'fabric_color_id']);
                        $kind = ProductKind::resolve((int) $raw->type_id, (int) $raw->fabric_type_id, (int) $raw->fabric_color_id);
                        \Illuminate\Support\Facades\DB::table('products')->where('id', $product->id)->update(['product_kind_id' => $kind->id]);
                        $kindId = $kind->id;
                    }
                    $this->applyMovement(
                        $kindId,
                        (int) $product->count,
                        StockMovementType::RETURN_IN,
                        ['reason' => 'Returned from order ' . $order->order_id, 'user_id' => $userId, 'order_id' => $order->id, 'product_id' => $product->id]
                    );
                }
            }

            if (empty($returned)) {
                return; // nothing new to record
            }

            // Reflect the return in the order: if every line is now returned, move the
            // order to RETURNED; either way, write a history entry so it isn't invisible.
            $total = $order->product()->count();
            $allReturned = $total > 0 && $order->product()->where('is_returned', true)->count() === $total;
            if ($allReturned) {
                $order->update(['status' => OrderStatus::RETURNED->value]);
            }

            $sellable = count(array_filter($returned, fn ($c) => $c === 'SELLABLE'));
            $damaged = count($returned) - $sellable;
            $parts = [];
            if ($sellable) { $parts[] = $sellable . ' sellable'; }
            if ($damaged) { $parts[] = $damaged . ' damaged'; }

            $change = new OrderStatusChange();
            $change->order_id = $order->id;
            $change->user_id = $userId ?? optional(auth()->user())->id;
            $change->status = $allReturned ? OrderStatus::RETURNED->value : $order->status;
            $change->comment = 'Returned ' . count($returned) . ' line(s)' . ($parts ? ' — ' . implode(', ', $parts) : '') . '.';
            $change->save();
        });
    }

    /**
     * Cancel an order. If it was cancelled from a produced status (PRODUCTION/QA/
     * READY), the sellable finished lines are added to Ready Stock (CANCEL_IN).
     * Returns the number of lines restocked.
     *
     * @param array $lines list of ['productId' => int, 'condition' => 'SELLABLE'|'DAMAGED']
     * @throws Exception
     */
    public function cancelOrder(Order $order, ?string $comment, array $lines = [], ?int $userId = null): int
    {
        return DB::transaction(function () use ($order, $comment, $lines, $userId) {
            $produced = in_array($order->status, [
                OrderStatus::PRODUCTION->value,
                OrderStatus::QA->value,
                OrderStatus::READY->value,
            ], true);

            $restocked = 0;
            if ($produced) {
                foreach ($lines as $line) {
                    if (strtoupper($line['condition']) !== 'SELLABLE') {
                        continue; // damaged goods are not restocked
                    }
                    $product = Product::where('id', $line['productId'])->where('order_id', $order->id)->first();
                    if (!$product) {
                        continue;
                    }
                    $kindId = $product->product_kind_id;
                    if (!$kindId) {
                        $raw = DB::table('products')->where('id', $product->id)->first(['type_id', 'fabric_type_id', 'fabric_color_id']);
                        $kind = ProductKind::resolve((int) $raw->type_id, (int) $raw->fabric_type_id, (int) $raw->fabric_color_id);
                        DB::table('products')->where('id', $product->id)->update(['product_kind_id' => $kind->id]);
                        $kindId = $kind->id;
                    }
                    $this->applyMovement(
                        $kindId,
                        (int) $product->count,
                        StockMovementType::CANCEL_IN,
                        ['reason' => 'Cancelled order ' . $order->order_id, 'user_id' => $userId, 'order_id' => $order->id, 'product_id' => $product->id]
                    );
                    $restocked++;
                }
            }

            $order->update([
                'status' => OrderStatus::CANCELLED->value,
                'cancellation_comment' => $comment,
            ]);

            $change = new OrderStatusChange();
            $change->order_id = $order->id;
            $change->user_id = $userId ?? optional(auth()->user())->id;
            $change->status = OrderStatus::CANCELLED->value;
            $change->comment = trim(($comment ?: 'Order cancelled') . ($restocked ? " — {$restocked} item(s) added to ready stock" : ''));
            $change->save();

            return $restocked;
        });
    }

    /**
     * Add stock manually (MANUAL_IN) or correct it (ADJUSTMENT, may be negative).
     *
     * @throws Exception
     */
    public function manualEntry(int $productKindId, int $quantity, StockMovementType $type, ?string $reason, ?int $userId = null): ProductKind
    {
        if (!in_array($type, [StockMovementType::MANUAL_IN, StockMovementType::ADJUSTMENT], true)) {
            throw new Exception('Manual entry must be MANUAL_IN or ADJUSTMENT.');
        }
        if ($type === StockMovementType::MANUAL_IN && $quantity <= 0) {
            throw new Exception('A manual addition must be a positive quantity.');
        }
        if ($quantity === 0) {
            throw new Exception('Quantity cannot be zero.');
        }

        return DB::transaction(function () use ($productKindId, $quantity, $type, $reason, $userId) {
            $kind = ProductKind::whereKey($productKindId)->lockForUpdate()->firstOrFail();

            if ($kind->on_hand + $quantity < 0) {
                throw new Exception('Adjustment would take stock below zero.');
            }

            $this->applyMovement($kind, $quantity, $type, ['reason' => $reason, 'user_id' => $userId]);
            return $kind->refresh();
        });
    }

    /**
     * Fulfil a single order line from Ready Stock. When every line of the order is
     * fulfilled from stock, the order jumps straight to READY (ADR 0003).
     *
     * @throws Exception
     */
    public function pull(Product $line, ?int $userId = null): void
    {
        DB::transaction(function () use ($line, $userId) {
            $order = $line->order()->firstOrFail();

            if (!in_array($order->status, self::ELIGIBLE_STATUSES, true)) {
                throw new Exception('Only draft, booking, or approved orders can be fulfilled from stock.');
            }
            if ($line->fulfilled_from_stock) {
                throw new Exception('This line is already fulfilled from stock.');
            }

            $kind = ProductKind::whereKey($line->product_kind_id)->lockForUpdate()->firstOrFail();
            if ($kind->on_hand < $line->count) {
                throw new Exception('Not enough stock for this product kind.');
            }

            $this->applyMovement(
                $kind,
                -1 * (int) $line->count,
                StockMovementType::PULL_OUT,
                ['reason' => 'Fulfilled order ' . $order->order_id, 'user_id' => $userId, 'order_id' => $order->id, 'product_id' => $line->id]
            );

            $line->fulfilled_from_stock = true;
            $line->fulfilled_from_stock_at = now();
            $line->save();

            $this->maybeAdvanceOrder($order, $userId);
        });
    }

    /** If every line of the order is now fulfilled from stock, advance it to READY. */
    private function maybeAdvanceOrder(Order $order, ?int $userId): void
    {
        $total = $order->product()->count();
        $fulfilled = $order->product()->where('fulfilled_from_stock', true)->count();

        if ($total > 0 && $total === $fulfilled && $order->status != OrderStatus::READY->value) {
            $order->update(['status' => OrderStatus::READY->value]);

            $change = new OrderStatusChange();
            $change->order_id = $order->id;
            $change->user_id = $userId ?? optional(auth()->user())->id;
            $change->status = OrderStatus::READY->value;
            $change->comment = 'Auto-advanced to READY: fully fulfilled from ready stock.';
            $change->save();
        }
    }

    /**
     * Record a signed movement and update the Kind's cached on_hand.
     * Must be called inside a transaction; the caller locks the Kind when needed.
     */
    private function applyMovement($kind, int $quantity, StockMovementType $type, array $meta = []): StockMovement
    {
        $kind = $kind instanceof ProductKind ? $kind : ProductKind::findOrFail($kind);

        $movement = StockMovement::create([
            'product_kind_id' => $kind->id,
            'quantity' => $quantity,
            'type' => $type,
            'reason' => $meta['reason'] ?? null,
            'user_id' => $meta['user_id'] ?? null,
            'order_id' => $meta['order_id'] ?? null,
            'product_id' => $meta['product_id'] ?? null,
        ]);

        $kind->on_hand += $quantity;
        $kind->save();

        return $movement;
    }
}
