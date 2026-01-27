<?php

namespace App\Http\Resources;

use App\Enums\OrderType;
use App\Models\Marketplace;
use App\Models\Merchant;
use Illuminate\Http\Resources\Json\JsonResource;

class OrdersResource extends JsonResource
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
            'id' => $this->id,
            'orderedBy' => $this->orderable->name,
            'createdBy' => $this->createdBy->firstname ." ". $this->createdBy->lastname,
            'status' => $this->status,
            'totalAmount' => $this->total_amount,
            'createdAt' => $this->created_at,
            'deliveryDate' => $this->delivery_date,
            'itemsCount' => $this->product_count,
            'orderType'=> class_basename($this->orderable_type) === "Marketplace" ? OrderType::MARKETPLACE->value : OrderType::MERCHANT->value,
        ];
    }
}
