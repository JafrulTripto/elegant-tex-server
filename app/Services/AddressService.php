<?php

namespace App\Services;

use App\Models\Address;
use Illuminate\Database\Eloquent\Model;

class AddressService
{
    public function store(Model $model, $data)
    {
        $address = new Address();
        $address->address = $data['address'];
        $address->phone = $data['phone'];
        $address->district = $data['district'];
        $address->division = $data['division'];
        $model->address()->save($address);
        return true;
    }
}
