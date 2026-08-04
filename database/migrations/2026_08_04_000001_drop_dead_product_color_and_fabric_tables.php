<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drops the unused `product_colors` and `product_fabrics` tables. These were
 * never wired into orders (their associations were commented out in
 * ProductService) and their names collide with the new Fabric Color / Fabric
 * Type model. See docs/adr and CONTEXT.md.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('product_colors');
        Schema::dropIfExists('product_fabrics');
    }

    public function down(): void
    {
        Schema::create('product_colors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });

        Schema::create('product_fabrics', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->timestamps();
        });
    }
};
