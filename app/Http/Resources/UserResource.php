<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $roles = $this->whenLoaded('roles', function () {
            return $this->roles->pluck('name');
        });
        return [
            'firstName' => $this->firstname,
            'lastName' => $this->lastname,
            'email' => $this->email,
            'address' => $this->address,
            'nid' => $this->nid,
            'image' => $this->image,
            'roles' => $roles
        ];
    }
}
