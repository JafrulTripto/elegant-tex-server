<?php

namespace App\Services;

use App\Models\Product;

class ProductService
{
    public function store($productData, $model)
    {
        $product = new Product();
        $product->description = $productData['productDescription'];
        $product->count = $productData['quantity'];
        $product->price = $productData['price'];
        $product->fabric_color_id = $productData['fabrics'];
        $product->fabric_type_id = $productData['fabricType'];
        $product->type_id = $productData['productType'];


//        $productType = ProductType::findOrFail($productData['productType']);
//        $productColor = ProductColor::findOrFail($productData['productColor']);
//        $productFabric = ProductFabric::findOrFail($productData['productFabric']);
//        $product->productType()->associate($productType);
//        $product->productColor()->associate($productColor);
//        $product->productFabric()->associate($productFabric);
        $model->product()->save($product);
    }
}
