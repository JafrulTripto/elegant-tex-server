<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductTypeResource;
use App\Models\Product;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProductTypeController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return ResourceCollection
     */
    public function index() : ResourceCollection
    {
        return ProductTypeResource::collection(ProductType::all());
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $name = $request->name;

        // Check if the color already exists
        $existingType = ProductType::where('name', $name)->first();
        if ($existingType) {
            return response()->json([
                "message" => "Product type already exists."
            ], 422);
        }
        $productType = new ProductType();
        $productType->name = $request->name;
        $productType->save();
        return response()->json([
            "message" => "Product fabric created successfully."
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ProductType  $productType
     * @return \Illuminate\Http\Response
     */
    public function show(ProductType $productType)
    {
        //
    }



    /**
     * Update the specified resource in storage.
     *
     * @param Request $request
     * @param  \App\Models\ProductType  $productType
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id): JsonResponse
    {
        $productType = ProductType::find($id);

        if (!$productType) {
            return response()->json([
                "message" => "Product type not found."
            ], 404);
        }

        // Update the product color record
        $productType->name = $request->input('name');
        try {
            $productType->save();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle foreign key constraint violation error
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    "message" => "Cannot update product type."
                ], 400);
            } else {
                throw $e;
            }
        }

        return response()->json([
            "message" => "Product type updated successfully.",
            "data" => $productType
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProductType  $productType
     * @return \Illuminate\Http\Response
     */
    public function destroy($id): JsonResponse
    {
        $productType = ProductType::find($id);

        if (!$productType) {
            return response()->json([
                "message" => "Product fabric not found."
            ], 404);
        }

        $referencingProducts = Product::where('type_id', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete product type because this is already in use."
            ], 400);
        }

        $productType->delete();

        return response()->json([
            "message" => "Product fabric deleted successfully."
        ]);
    }
}
