<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Product Kind — the identity that decides whether two products are "the same
 * kind" for stock matching: the triple (Product Type + Fabric Type + Fabric
 * Color). `on_hand` caches the running sum of the Kind's stock movements.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_kinds', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_type_id');
            $table->unsignedBigInteger('fabric_type_id');
            $table->unsignedBigInteger('fabric_color_id');
            $table->integer('on_hand')->default(0);
            $table->timestamps();

            $table->unique(['product_type_id', 'fabric_type_id', 'fabric_color_id'], 'product_kinds_triple_unique');
            $table->foreign('product_type_id')->references('id')->on('product_types');
            $table->foreign('fabric_type_id')->references('id')->on('fabric_types');
            $table->foreign('fabric_color_id')->references('id')->on('fabric_colors');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_kinds');
    }
};
