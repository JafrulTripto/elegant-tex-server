<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductFabricResource;
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
    public function update(Request $request, ProductFabric $productFabric)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\ProductFabric  $productFabric
     * @return \Illuminate\Http\Response
     */
    public function destroy(ProductFabric $productFabric)
    {
        //
    }
}
