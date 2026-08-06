<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StockMovementResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'type' => $this->type?->value,
            'quantity' => $this->quantity,
            'reason' => $this->reason,
            'user' => $this->user ? trim($this->user->firstname . ' ' . $this->user->lastname) : null,
            'orderId' => $this->order_id,
            'createdAt' => $this->created_at,
        ];
    }
}
