<?php

namespace App\Http\Requests;

use App\Enums\OrderType;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = [
            'orderType' => ['required', 'integer'],
            'createdBy' => ['required', 'integer', 'exists:users,id'],
            'deliveryChannel' => ['required', 'string'],
            'deliveryCharge' => ['required', 'numeric', 'min:0'],
            'amount' => ['required', 'numeric', 'min:0'],
            'images' => ['nullable', 'array'],
            'deliveryDate' => ['required', 'date'],
            'products' => ['required', 'array'],
            'products.*.productColor' => ['required', 'integer'],
            'products.*.quantity' => ['required', 'integer'],
            'products.*.productDescription' => ['required', 'string'],
            'products.*.productType' => ['required', 'integer'],
            'products.*.productFabric' => ['required', 'integer'],
            'products.*.price' => ['required', 'numeric', 'min:0'],
        ];

        if ($this->orderType == OrderType::MARKETPLACE->value) {
            $rules = array_merge($rules, [
                'marketplace' => ['required', 'integer', 'exists:marketplaces,id'],
                'name' => ['required', 'string', 'max:255'],
                'phone' => ['required', 'string', 'max:255'],
                'altPhone' => ['required', 'string', 'max:255'],
                'address' => ['required', 'string', 'max:255'],
                'upazila' => ['required', 'integer'],
                'district' => ['required', 'integer'],
                'division' => ['required', 'integer'],
                'facebookId' => ['nullable', 'string', 'max:255'],
            ]);
        } else {
            $rules = array_merge($rules, [
                'merchant' => ['required', 'integer', 'exists:merchants,id'],
            ]);
        }

        return $rules;
    }

}
