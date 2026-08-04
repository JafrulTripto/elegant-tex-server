<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FabricTypeResource;
use App\Models\FabricType;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class FabricTypeController extends Controller
{
    public function index(): ResourceCollection
    {
        return FabricTypeResource::collection(FabricType::all());
    }

    public function store(Request $request): JsonResponse
    {
        $name = $request->input('name');

        if (FabricType::where('name', $name)->exists()) {
            return response()->json([
                "message" => "Fabric type already exists."
            ], 422);
        }

        $fabricType = new FabricType();
        $fabricType->name = $name;
        $fabricType->save();

        return response()->json([
            "message" => "Fabric type created successfully."
        ]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $fabricType = FabricType::find($id);

        if (!$fabricType) {
            return response()->json([
                "message" => "Fabric type not found."
            ], 404);
        }

        $fabricType->name = $request->input('name');
        $fabricType->save();

        return response()->json([
            "message" => "Fabric type updated successfully.",
            "data" => $fabricType
        ]);
    }

    public function destroy($id): JsonResponse
    {
        $fabricType = FabricType::find($id);

        if (!$fabricType) {
            return response()->json([
                "message" => "Fabric type not found."
            ], 404);
        }

        if (Product::where('fabric_type_id', $id)->exists()) {
            return response()->json([
                "message" => "Cannot delete fabric type because it is already in use."
            ], 400);
        }

        $fabricType->delete();

        return response()->json([
            "message" => "Fabric type deleted successfully."
        ]);
    }
}
