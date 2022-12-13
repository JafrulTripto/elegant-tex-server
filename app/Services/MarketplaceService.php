<?php

namespace App\Services;

use App\Models\Marketplace;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;

class MarketplaceService
{
    public function createMarketplace($data): bool
    {
        try {
            $marketplace = new Marketplace();
            $marketplace->name = $data['name'];
            $marketplace->page_link = $data['pageLink'];
            $marketplace->save();
            $marketplace->users()->attach($data['users']);
            return true;
        } catch (QueryException $exception) {
            throw new HttpResponseException(response()->json([
                'message' => $exception->getMessage(),
                'status' => $exception->getCode()
            ], 500));
        }

    }

    public function userMarketplaces(string $userID)
    {
        $user = User::findOrFail($userID);
        return $user->marketplace()->get(['marketplaces.id','marketplaces.name'])->makeHidden('pivot')->toArray();
    }
}
