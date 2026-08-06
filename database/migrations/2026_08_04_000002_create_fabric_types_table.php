<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fabric Type — the material/kind of a fabric (cotton, silk, ...), an axis
 * independent of Fabric Color. Curated in Product Settings. A default
 * "Unspecified" row is seeded so existing product lines can be backfilled.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fabric_types', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        DB::table('fabric_types')->insert([
            'name' => 'Unspecified',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('fabric_types');
    }
};
