<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductKind;

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

        // Resolve the Product Kind (the identity used for stock matching).
        $product->product_kind_id = ProductKind::resolve(
            (int) $productData['productType'],
            (int) $productData['fabricType'],
            (int) $productData['fabrics'],
        )->id;

        $model->product()->save($product);
    }
}
