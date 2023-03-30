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
            get: function ($value) {
                $district = District::find($value);
                return [
                    'value' => $value,
                    'name' => $district->name,
                ];
            },
        );
    }
    protected function upazila(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $upazila = Upazila::find($value);
                return [
                    'value' => $value,
                    'name' => $upazila->name,
                ];
            },
        );
    }
    protected function division(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                $division = Division::find($value);
                return [
                    'value' => $value,
                    'name' => $division->name,
                ];
            },
        );
    }
}
