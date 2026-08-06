<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Adds the required Fabric Type to each product line. Existing rows are
 * backfilled to the seeded "Unspecified" type; new lines must supply one
 * (enforced at the request layer). The column defaults to "Unspecified" so it
 * can stay NOT NULL without needing doctrine/dbal for a column change.
 */
return new class extends Migration
{
    public function up(): void
    {
        $unspecifiedId = DB::table('fabric_types')->where('name', 'Unspecified')->value('id');

        Schema::table('products', function (Blueprint $table) use ($unspecifiedId) {
            $table->unsignedBigInteger('fabric_type_id')->default($unspecifiedId)->after('type_id');
            $table->foreign('fabric_type_id')->references('id')->on('fabric_types');
        });

        // Backfill any pre-existing rows (belt-and-braces alongside the default).
        DB::table('products')->whereNull('fabric_type_id')->update(['fabric_type_id' => $unspecifiedId]);
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['fabric_type_id']);
            $table->dropColumn('fabric_type_id');
        });
    }
};
