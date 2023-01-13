<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    use HasFactory;

    protected $table = 'address';
    protected $hidden =['user_id','created_at', 'updated_at'];


    public function addressable()
    {
        return $this->morphTo();
    }

    protected function district(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => District::find($value)->name,
        );
    }
    protected function upazila(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Upazila::find($value)->name,
        );
    }
    protected function division(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => Division::find($value)->name,
        );
    }
}
