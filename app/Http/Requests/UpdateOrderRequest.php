<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOrderRequest extends StoreOrderRequest
{
    public function rules(): array
    {
        $rules = parent::rules();

        // Add rules for any additional fields that are required for updating an order

        return $rules;
    }
}
