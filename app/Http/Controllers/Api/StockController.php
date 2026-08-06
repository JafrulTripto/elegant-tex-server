<?php

namespace App\Http\Controllers\Api;

use App\Enums\StockMovementType;
use App\Http\Controllers\Controller;
use App\Http\Resources\StockKindResource;
use App\Http\Resources\StockMovementResource;
use App\Models\ProductKind;
use App\Models\StockMovement;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StockController extends Controller
{
    private StockService $stockService;

    public function __construct(StockService $stockService)
    {
        $this->stockService = $stockService;
    }

    /** Ready Stock levels, one row per Product Kind. */
    public function index(Request $request): JsonResponse
    {
        $query = ProductKind::with(['productType:id,name', 'fabricType:id,name', 'fabricColor:id,name']);

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('productType', fn ($p) => $p->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('fabricType', fn ($p) => $p->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('fabricColor', fn ($p) => $p->where('name', 'like', "%{$search}%"));
            });
        }

        if ($request->boolean('inStockOnly')) {
            $query->where('on_hand', '>', 0);
        }

        $kinds = $query->orderByDesc('on_hand')->get();

        return response()->json(['data' => StockKindResource::collection($kinds)]);
    }

    /** Movement history (ledger) for a single Product Kind. */
    public function movements($productKindId): JsonResponse
    {
        $movements = StockMovement::with('user:id,firstname,lastname')
            ->where('product_kind_id', $productKindId)
            ->orderByDesc('id')
            ->get();

        return response()->json(['data' => StockMovementResource::collection($movements)]);
    }

    /** Manual addition or adjustment. */
    public function storeMovement(Request $request): JsonResponse
    {
        $request->validate([
            'productKindId' => ['required', 'integer', 'exists:product_kinds,id'],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', Rule::in([StockMovementType::MANUAL_IN->value, StockMovementType::ADJUSTMENT->value])],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $kind = $this->stockService->manualEntry(
                (int) $request->input('productKindId'),
                (int) $request->input('quantity'),
                StockMovementType::from($request->input('type')),
                $request->input('reason'),
                optional(auth()->user())->id,
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        return response()->json(['message' => 'Stock updated.', 'onHand' => $kind->on_hand]);
    }
}
