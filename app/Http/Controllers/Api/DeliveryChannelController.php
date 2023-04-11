<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryChannelResource;
use App\Models\DeliveryChannel;
use App\Models\ProductColor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryChannelController extends Controller
{
    public function index()
    {
        return DeliveryChannelResource::collection(DeliveryChannel::all());
    }
    public function store(Request $request)
    {
        $deliveryChannel = new DeliveryChannel();
        $deliveryChannel->name = $request->name;
        $deliveryChannel->save();
        return response()->json([
            "message" => "Delivery channel created successfully."
        ]);

    }
    public function destroy($id): JsonResponse
    {
        $deliveryChannel = DeliveryChannel::find($id);

        if (!$deliveryChannel) {
            return response()->json([
                "message" => "Product fabric not found."
            ], 404);
        }

        $deliveryChannel->delete();

        return response()->json([
            "message" => "Product fabric deleted successfully."
        ]);
    }
}
