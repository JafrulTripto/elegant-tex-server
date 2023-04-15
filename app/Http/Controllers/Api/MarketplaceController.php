<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMarketplaceRequest;
use App\Http\Requests\UpdateMarketplaceRequest;
use App\Http\Resources\MarketplaceResource;
use App\Models\Marketplace;
use App\Models\User;
use App\Services\MarketplaceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MarketplaceController extends Controller
{
    private MarketplaceService $marketplaceService;

    public function __construct(MarketplaceService $marketplaceService)
    {
        $this->marketplaceService = $marketplaceService;
    }

    public function index()
    {
        $user = User::find(Auth::id());
        if ($user->hasPermissionTo("VIEW_ALL_MARKETPLACES")){
            $marketplaces = Marketplace::with('users')->paginate(15);
            return MarketplaceResource::collection($marketplaces);
        }

        $marketplaces = $user->marketplace()->with('users')->paginate(10);
        return MarketplaceResource::collection($marketplaces);

    }
    public function store(StoreMarketplaceRequest $request)
    {
        $data = [
            'name' => $request->name,
            'pageLink' => $request->pageLink,
            'users' => $request->users
        ];

        if ($this->marketplaceService->createMarketplace($data)){
            return response()->json([
                "message" => "Marketplace created successfully."
            ]);
        }
        return response()->json([
            "message" => "Error creating marketplace."
        ]);
    }

    public function update(UpdateMarketplaceRequest $request, $id): JsonResponse
    {
        $marketplace = Marketplace::find($id);

        if (!$marketplace) {
            return response()->json([
                "message" => "Marketplace not found."
            ], 404);
        }

        $data = [
            'name' => $request->name,
            'pageLink' => $request->pageLink,
            'users' => $request->users
        ];

        if ($this->marketplaceService->updateMarketplace($marketplace, $data)) {
            return response()->json([
                "message" => "Marketplace updated successfully."
            ]);
        }

        return response()->json([
            "message" => "Error updating marketplace."
        ]);
    }


    public function getUserMarketplaces(Request $request)
    {
        if ($request->has('userID')) {
           $userID = $request->input('userID');
           $userMarketplaces = $this->marketplaceService->userMarketplaces($userID);
           return response()->json($userMarketplaces);
        }

        return response()->json([
            "message" => "No valid user id!!!"
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $marketplace = Marketplace::findOrFail($id);

        if ($marketplace->delete()) {
            return response()->json([
                "message" => "Marketplace deleted successfully."
            ]);
        }

        return response()->json([
            "message" => "Error deleting marketplace."
        ]);
    }
}
