<?php

namespace App\Models;

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

    public function __construct(array $attributes = [])
    {
        parent::__construct($attributes);

        $this->attributes['et_order_id'] = $this->generateOrderId(); // Set 'order_id' to generated ID
    }

    function generateOrderId(): string
    {
        // Get the latest order ID from the database
        $latestOrderId = DB::table('orders')->orderBy('id', 'desc')->value('et_order_id');

        // Extract the sequential number from the latest order ID
        $sequentialNumber = ($latestOrderId) ? intval(substr($latestOrderId, -5)) : 0;

        // Increment the sequential number
        $sequentialNumber++;

        // Generate the new order ID
        return 'ET-ORD-' . str_pad($sequentialNumber, 5, '8', STR_PAD_LEFT);
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


}
