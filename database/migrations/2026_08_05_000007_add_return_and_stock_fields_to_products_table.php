<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Per-line return state (with condition) and the pull-from-stock flag. Returns
 * are per line at full quantity; only SELLABLE lines feed Ready Stock.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('is_returned')->default(false)->after('price');
            $table->string('return_condition')->nullable()->after('is_returned'); // SELLABLE | DAMAGED
            $table->timestamp('returned_at')->nullable()->after('return_condition');
            $table->boolean('fulfilled_from_stock')->default(false)->after('returned_at');
            $table->timestamp('fulfilled_from_stock_at')->nullable()->after('fulfilled_from_stock');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'is_returned',
                'return_condition',
                'returned_at',
                'fulfilled_from_stock',
                'fulfilled_from_stock_at',
            ]);
        });
    }
};
