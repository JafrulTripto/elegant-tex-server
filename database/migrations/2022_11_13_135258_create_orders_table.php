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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->nullable()->unique();
            $table->unsignedBigInteger('customer_id')->nullable(true);
            $table->foreign('customer_id')->references('id')->on('customers');
            $table->unsignedBigInteger('orderable_id');
            $table->string('orderable_type');
            $table->string('merchant_ref')->nullable(true);
            $table->unsignedBigInteger('created_by');
            $table->foreign('created_by')->references('id')->on('users')->onDelete("cascade");
            $table->integer('status');
            $table->unsignedBigInteger('delivery_channel');
            $table->date('delivery_date');
            $table->integer('amount');
            $table->integer('delivery_charge');
            $table->integer('total_amount');
            $table->text('cancellation_comment')->nullable();
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
        Schema::dropIfExists('orders');
    }
};
