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
    public function material(): BelongsTo
    {
        return $this->belongsTo(Material::class,'material_id');
    }

    protected function typeId(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $productType = ProductType::find($value);
                return [
                    'value' => $value,
                    'name' => $productType->name,
                ];
            },
        );
    }

    protected function materialId(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $material = Material::find($value);
                $images = $material->image()->get(); // Retrieve the images using the morphTo relationship
                $imagePath = $images->pluck('id')->toArray();
                $pathString = implode(', ', $imagePath);
                return [
                    'value' => $value,
                    'name' => $material->name,
                    'image' => $pathString
                ];
            },
        );
    }

}
