<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'status'
    ];

    public function product(): HasMany
    {
        return $this->hasMany(Product::class);
    }
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
    public function orderable()
    {
        return $this->morphTo();
    }
    public function image()
    {
        return $this->morphMany(Image::class, 'imageable');
    }

    protected function deliveryChannel(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $deliveryChannel = DeliveryChannel::find($value);
                return [
                    'value' => $value,
                    'name' => $deliveryChannel->name,
                ];
            },
        );
    }
}
