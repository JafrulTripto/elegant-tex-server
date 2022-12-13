<?php

namespace App\Services;

use App\Models\Customer;

class CustomerService
{
    private AddressService $addressService;

    public function __construct(AddressService $addressService)
    {
        $this->addressService = $addressService;
    }

    public function store(array $customerData, $order)
    {
        $customerAddress = [
            'phone' => $customerData['phone'],
            'address' => $customerData['address'],
            'district' => $customerData['district'],
            'division' => $customerData['division'],
        ];

        $customer = new Customer();
        $customer->name = $customerData['name'];
        $customer->facebook_id = $customerData['facebookId'];
        $customer->alt_phone = $customerData['altPhone'];
        $customer->save();
        $this->addressService->store($customer, $customerAddress);
        $order->customer()->associate($customer);
    }
}
