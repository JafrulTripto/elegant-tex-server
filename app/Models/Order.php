<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Staudenmeir\EloquentEagerLimit\HasEagerLimit;

class Order extends Model
{
    use HasFactory, HasEagerLimit;


    protected $fillable = [
        'status'
    ];

    public static function boot(): void
    {
        parent::boot();

        static::creating(function ($order) {
            $order->order_id = 'ET-ORD-' . static::generateNextOrderNumber();
        });
    }

    private static function generateNextOrderNumber(): string
    {
        $lastOrder = static::orderByDesc('id')->first();

        if ($lastOrder) {
            $lastOrderNumber = (int) substr($lastOrder->order_id, -4);
            return str_pad($lastOrderNumber + 1, 4, '0', STR_PAD_LEFT);
        }

        return '1000';
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

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

    public function statuses(): BelongsToMany
    {
        return $this->belongsToMany(Status::class)->withTimestamps();
    }

    public function latestStatuses()
    {
        return $this->belongsToMany(Status::class)
            ->orderByPivot('created_at', 'desc')->limit(1);
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
