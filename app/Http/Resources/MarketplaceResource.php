<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class MarketplaceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $userNames = $this->whenLoaded('users', function () {
            return $this->users->pluck('firstname');
        });
        return [
            'id' => $this->id,
            'key' =>$this->id,
            'name' => $this->name,
            'pageLink' => $this->page_link,
            'users' => $userNames
        ];
    }
}
