<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductKind extends Model
{
    use HasFactory;

    protected $fillable = ['product_type_id', 'fabric_type_id', 'fabric_color_id', 'on_hand'];

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function fabricType(): BelongsTo
    {
        return $this->belongsTo(FabricType::class);
    }

    public function fabricColor(): BelongsTo
    {
        return $this->belongsTo(FabricColor::class);
    }

    public function movements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /**
     * Find (or create) the Kind for a (product type, fabric type, fabric color) triple.
     */
    public static function resolve(int $productTypeId, int $fabricTypeId, int $fabricColorId): self
    {
        return static::firstOrCreate([
            'product_type_id' => $productTypeId,
            'fabric_type_id' => $fabricTypeId,
            'fabric_color_id' => $fabricColorId,
        ]);
    }
}
