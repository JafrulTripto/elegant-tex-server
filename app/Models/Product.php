<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Product extends Model
{
    use HasFactory;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class,'type_id');
    }
    public function productColor(): BelongsTo
    {
        return $this->belongsTo(ProductColor::class, 'color_id');
    }
    public function productFabric(): BelongsTo
    {
        return $this->belongsTo(ProductFabric::class, 'fabric_id');
    }

    protected function typeId(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ProductType::find($value)->name,
        );
    }
    protected function colorId(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ProductColor::find($value)->name,
        );
    }
    protected function fabricId(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => ProductFabric::find($value)->name,
        );
    }
}
