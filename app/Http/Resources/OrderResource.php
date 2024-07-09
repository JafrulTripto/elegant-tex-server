<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Marketplace;
use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param \Illuminate\Http\Request $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'orderType' => class_basename($this->orderable_type) === "Marketplace" ? OrderType::MARKETPLACE->value : OrderType::MERCHANT->value,
            'orderable' => $this->orderable,
            'id' => $this->id,
            'status' => $this->status,
            'orderStatusChanges' => $this->orderStatusChanges,
            'customer' => CustomerResource::make($this->customer),
            'products' => ProductResource::collection($this->product),
            'merchantRef' => $this->merchant_ref,
            'payment' => [
                'deliveryCharge' => $this->delivery_charge,
                'amount' => $this->amount,
                'totalAmount' => $this->total_amount
            ],
            'createdAt' => $this->created_at,
            'createdBy' => $this->created_by,
            'updatedBy' => $this->updatedBy,
            'images' => $this->image,
            'deliveryChannel' => $this->delivery_channel,
            'deliveryDate' => $this->delivery_date
        ];
    }
}
