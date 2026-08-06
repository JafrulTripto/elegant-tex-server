<?php

namespace App\Models;

use App\Enums\StockMovementType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_kind_id', 'quantity', 'type', 'reason', 'user_id', 'order_id', 'product_id',
    ];

    protected $casts = [
        'type' => StockMovementType::class,
    ];

    public function productKind(): BelongsTo
    {
        return $this->belongsTo(ProductKind::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
