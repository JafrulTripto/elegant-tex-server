<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Merchant extends Model
{
    use HasFactory;

    public function address()
    {
        return $this->morphOne(Address::class, 'addressable');
    }

    public function image()
    {
        return $this->morphOne(Image::class, 'imageable');
    }
    public function order()
    {
        return $this->morphOne(Order::class, 'orderable');
    }
}
