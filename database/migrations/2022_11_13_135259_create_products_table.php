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
            $table->unsignedBigInteger("fabrics_id");
            $table->unsignedBigInteger("type_id");
            $table->foreign('order_id')->references('id')->on('orders');
            $table->foreign('fabrics_id')->references('id')->on('fabrics');
            $table->foreign('type_id')->references('id')->on('product_types');
            $table->text('description');
            $table->integer('count');
            $table->decimal('price', 10, 2);
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
