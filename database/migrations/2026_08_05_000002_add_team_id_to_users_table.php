<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Each user belongs to exactly one Team. Existing users are backfilled to the
 * seeded "Unassigned" team; the column defaults to it so it stays NOT NULL.
 */
return new class extends Migration
{
    public function up(): void
    {
        $unassignedId = DB::table('teams')->where('name', 'Unassigned')->value('id');

        Schema::table('users', function (Blueprint $table) use ($unassignedId) {
            $table->unsignedBigInteger('team_id')->default($unassignedId)->after('id');
            $table->foreign('team_id')->references('id')->on('teams');
        });

        DB::table('users')->whereNull('team_id')->update(['team_id' => $unassignedId]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
            $table->dropColumn('team_id');
        });
    }
};
