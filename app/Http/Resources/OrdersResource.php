<?php

namespace App\Http\Resources;

use App\Enums\OrderStatus;
use App\Models\Marketplace;
use App\Models\User;
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
            'orderedBy' => Marketplace::where('id', $this->orderable_id)->value('name'),
            'createdBy' => User::where('id', $this->created_by)->value('name'),
            'status' => OrderStatus::from($this->status)->name,
            'totalAmount' => $this->total_amount,
            'createdAt' => $this->created_at,
            'deliveryDate' => $this->delivery_date,
            'orderType'=>$this->orderable_type
        ];
    }
}
