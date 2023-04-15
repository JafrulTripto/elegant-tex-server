<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductColorResource;
use App\Models\Product;
use App\Models\ProductColor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductColorController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        return ProductColorResource::collection(ProductColor::all());
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
    public function store(Request $request)
    {
        $name = $request->name;

        // Check if the color already exists
        $existingColor = ProductColor::where('name', $name)->first();
        if ($existingColor) {
            return response()->json([
                "message" => "Product color already exists."
            ], 422);
        }

        // If the color does not exist, create a new entry
        $productColor = new ProductColor();
        $productColor->name = $name;
        $productColor->save();

        return response()->json([
            "message" => "Product color created successfully."
        ]);

    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\ProductColor  $productColor
     * @return \Illuminate\Http\Response
     */
    public function show(ProductColor $productColor)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\ProductColor  $productColor
     * @return \Illuminate\Http\Response
     */
    public function edit(ProductColor $productColor)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\ProductColor  $productColor
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id): JsonResponse
    {
        $productColor = ProductColor::find($id);

        if (!$productColor) {
            return response()->json([
                "message" => "Product color not found."
            ], 404);
        }

        // Update the product color record
        $productColor->name = $request->input('name');
        try {
            $productColor->save();
        } catch (\Illuminate\Database\QueryException $e) {
            // Handle foreign key constraint violation error
            if ($e->errorInfo[1] == 1451) {
                return response()->json([
                    "message" => "Cannot update product color."
                ], 400);
            } else {
                throw $e;
            }
        }

        return response()->json([
            "message" => "Product color updated successfully.",
            "data" => $productColor
        ]);
    }


    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProductColor  $productColor
     * @return \Illuminate\Http\Response
     */
    public function destroy($id): JsonResponse
    {
        $productColor = ProductColor::find($id);

        if (!$productColor) {
            return response()->json([
                "message" => "Product color not found."
            ], 404);
        }
        $referencingProducts = Product::where('color_id', $id)->get();

        if (count($referencingProducts) > 0) {
            // If there are referencing records, return an error message
            return response()->json([
                "message" => "Cannot delete product color because this color is already in use."
            ], 400);
        }

        $productColor->delete();

        return response()->json([
            "message" => "Product color deleted successfully."
        ]);
    }

}
