<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'fabrics' => $this->fabric_color_id,
            'fabricType' => $this->fabric_type_id,
            'productType' => $this->type_id,
            'description' => $this->description,
            'unit' => $this->count,
            'price' => $this->price,
            'isReturned' => (bool) $this->is_returned,
            'returnCondition' => $this->return_condition,
            'fulfilledFromStock' => (bool) $this->fulfilled_from_stock,
            'availableInStock' => optional($this->productKind)->on_hand ?? 0,
        ];
    }
}
