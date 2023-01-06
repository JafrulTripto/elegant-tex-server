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
            'productType' => $this->type_id,
            'productColor' => $this->color_id,
            'productFabric' => $this->fabric_id,
            'description' => $this->description,
            'unit' => $this->count
        ];
    }
}
