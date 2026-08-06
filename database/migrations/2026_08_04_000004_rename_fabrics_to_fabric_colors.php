<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * The `fabrics` catalog actually holds Fabric Colors (each a swatch). Rename the
 * table, the `products` FK column, and the polymorphic image type to match the
 * domain language. The external API contract (JSON key `fabrics`, the
 * `settings/fabrics` routes) is intentionally left unchanged.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('fabrics', 'fabric_colors');

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['fabrics_id']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('fabrics_id', 'fabric_color_id');
        });
        Schema::table('products', function (Blueprint $table) {
            $table->foreign('fabric_color_id')->references('id')->on('fabric_colors');
        });

        DB::table('images')
            ->where('imageable_type', 'App\\Models\\Fabrics')
            ->update(['imageable_type' => 'App\\Models\\FabricColor']);
    }

    public function down(): void
    {
        DB::table('images')
            ->where('imageable_type', 'App\\Models\\FabricColor')
            ->update(['imageable_type' => 'App\\Models\\Fabrics']);

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['fabric_color_id']);
        });
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('fabric_color_id', 'fabrics_id');
        });

        Schema::rename('fabric_colors', 'fabrics');

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('fabrics_id')->references('id')->on('fabrics');
        });
    }
};
