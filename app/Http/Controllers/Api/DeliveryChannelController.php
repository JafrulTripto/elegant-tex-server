<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DeliveryChannelResource;
use App\Models\DeliveryChannel;
use App\Models\Order;
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
        $name = $request->name;

        // Check if the color already exists
        $existingDeliveryChannel = DeliveryChannel::where('name', $name)->first();
        if ($existingDeliveryChannel) {
            return response()->json([
                "message" => "Delivery channel already exists."
            ], 422);
        }
        $deliveryChannel = new DeliveryChannel();
        $deliveryChannel->name = $request->name;
        $deliveryChannel->save();
        return response()->json([
            "message" => "Delivery channel created successfully."
        ]);

    }

    public function update(Request $request, $id): JsonResponse
    {
        $deliveryChannel = DeliveryChannel::find($id);

        if (!$deliveryChannel) {
            return response()->json([
                "message" => "Delivery channel not found."
            ], 404);
        }

        // Update the product color record
        $deliveryChannel->name = $request->input('name');
        try {
            $deliveryChannel->save();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle foreign key constraint violation error
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    "message" => "Cannot update delivery channel."
                ], 400);
            } else {
                throw $e;
            }
        }

        return response()->json([
            "message" => "Delivery channel updated successfully.",
            "data" => $deliveryChannel
        ]);
    }
    public function destroy($id): JsonResponse
    {
        $deliveryChannel = DeliveryChannel::find($id);

        if (!$deliveryChannel) {
            return response()->json([
                "message" => "Delivery channel not found."
            ], 404);
        }
        $referencingProducts = Order::where('delivery_channel', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete delivery channel because this is already in use."
            ], 400);
        }

        $deliveryChannel->delete();

        return response()->json([
            "message" => "Delivery channel deleted successfully."
        ]);
    }
}
