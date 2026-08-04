<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The Ready Stock ledger. Every change is a signed movement against a Product
 * Kind (RETURN_IN, MANUAL_IN, ADJUSTMENT, PULL_OUT); on_hand is the running sum.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('product_kind_id');
            $table->integer('quantity'); // signed: positive in, negative out
            $table->string('type'); // RETURN_IN | MANUAL_IN | ADJUSTMENT | PULL_OUT
            $table->string('reason')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('order_id')->nullable();
            $table->unsignedBigInteger('product_id')->nullable();
            $table->timestamps();

            $table->foreign('product_kind_id')->references('id')->on('product_kinds');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('order_id')->references('id')->on('orders')->nullOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->nullOnDelete();
            $table->index('product_kind_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
