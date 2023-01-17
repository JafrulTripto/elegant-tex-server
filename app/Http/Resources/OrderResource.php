<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use App\Models\Marketplace;
use App\Models\User;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'orderType' => $this->orderable_type,
            'orderable' => $this->orderable,
            'id' => $this->id,
            'status' => OrderStatus::from($this->status)->name,
            'customer' => CustomerResource::make($this->customer    ),
            'products' => ProductResource::collection($this->product),
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
