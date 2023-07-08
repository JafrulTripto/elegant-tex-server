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
    public function fabircs(): BelongsTo
    {
        return $this->belongsTo(Fabrics::class,'fabrics_id');
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

    protected function fabricsId(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $fabrics = Fabrics::find($value);
                $images = $fabrics->image()->get(); // Retrieve the images using the morphTo relationship
                $imagePath = $images->pluck('id')->toArray();
                $pathString = implode(', ', $imagePath);
                return [
                    'value' => $value,
                    'name' => $fabrics->name,
                    'image' => $pathString
                ];
            },
        );
    }

}
