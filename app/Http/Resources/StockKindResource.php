<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockKindResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'productType' => optional($this->productType)->name,
            'fabricType' => optional($this->fabricType)->name,
            'fabricColor' => optional($this->fabricColor)->name,
            'onHand' => $this->on_hand,
        ];
    }
}
