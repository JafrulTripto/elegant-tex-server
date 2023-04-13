<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marketplace extends Model
{
    use HasFactory;

    protected $fillable = ['title'];
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
    public function order()
    {
        return $this->morphMany(Order::class, 'orderable');
    }
}
