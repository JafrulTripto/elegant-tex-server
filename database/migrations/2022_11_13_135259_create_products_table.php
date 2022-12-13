<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger("order_id");
            $table->unsignedBigInteger("type_id");
            $table->unsignedBigInteger("color_id");
            $table->unsignedBigInteger("fabric_id");
            $table->foreign('order_id')->references('id')->on('orders');
            $table->foreign('type_id')->references('id')->on('product_types');
            $table->foreign('color_id')->references('id')->on('product_colors');
            $table->foreign('fabric_id')->references('id')->on('product_fabrics');
            $table->text('description');
            $table->integer('count');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('products');
    }
};
