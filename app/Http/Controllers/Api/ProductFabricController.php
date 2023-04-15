<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductFabricResource;
use App\Models\Product;
use App\Models\ProductFabric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductFabricController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        return ProductFabricResource::collection(ProductFabric::all());
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $name = $request->name;

        // Check if the color already exists
        $existingFabric = ProductFabric::where('name', $name)->first();
        if ($existingFabric) {
            return response()->json([
                "message" => "Product fabric already exists."
            ], 422);
        }
        $productFabric = new ProductFabric();
        $productFabric->name = $request->name;
        $productFabric->save();
        return response()->json([
            "message" => "Product fabric created successfully."
        ]);
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ProductFabric  $productFabric
     * @return \Illuminate\Http\Response
     */
    public function show(ProductFabric $productFabric)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ProductFabric  $productFabric
     * @return \Illuminate\Http\Response
     */
    public function edit(ProductFabric $productFabric)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProductFabric  $productFabric
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id): JsonResponse
    {
        $productFabric = ProductFabric::find($id);

        if (!$productFabric) {
            return response()->json([
                "message" => "Product fabric not found."
            ], 404);
        }

        // Update the product color record
        $productFabric->name = $request->input('name');
        try {
            $productFabric->save();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle foreign key constraint violation error
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    "message" => "Cannot update product fabric."
                ], 400);
            } else {
                throw $e;
            }
        }

        return response()->json([
            "message" => "Product fabric updated successfully.",
            "data" => $productFabric
        ]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProductFabric  $productFabric
     * @return \Illuminate\Http\Response
     */
    public function destroy($id): JsonResponse
    {
        $productFabric = ProductFabric::find($id);

        if (!$productFabric) {
            return response()->json([
                "message" => "Product fabric not found."
            ], 404);
        }

        $referencingProducts = Product::where('fabric_id', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete product color because this color is already in use."
            ], 400);
        }

        $productFabric->delete();

        return response()->json([
            "message" => "Product fabric deleted successfully."
        ]);
    }
}
