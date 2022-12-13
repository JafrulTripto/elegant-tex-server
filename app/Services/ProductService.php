<?php

namespace App\Services;

use App\Models\Product;

class ProductService
{
    public function store($productData, $model)
    {
        $product = new Product();
        $product->description = $productData['productDescription'];
        $product->count = $productData['count'];
        $product->type_id = $productData['productType'];
        $product->color_id = $productData['productColor'];
        $product->fabric_id = $productData['productFabric'];

//        $productType = ProductType::findOrFail($productData['productType']);
//        $productColor = ProductColor::findOrFail($productData['productColor']);
//        $productFabric = ProductFabric::findOrFail($productData['productFabric']);
//        $product->productType()->associate($productType);
//        $product->productColor()->associate($productColor);
//        $product->productFabric()->associate($productFabric);
        $model->product()->save($product);
    }
}
