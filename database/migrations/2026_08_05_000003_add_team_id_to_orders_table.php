<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * An order carries the team of its creator, snapshotted at creation (ADR 0001).
 * Existing orders are backfilled from their creator's current team.
 */
return new class extends Migration
{
    public function up(): void
    {
        $unassignedId = DB::table('teams')->where('name', 'Unassigned')->value('id');

        Schema::table('orders', function (Blueprint $table) use ($unassignedId) {
            $table->unsignedBigInteger('team_id')->default($unassignedId)->after('created_by');
            $table->foreign('team_id')->references('id')->on('teams');
        });

        // Backfill each order's team from its creator's team.
        DB::statement('UPDATE orders o JOIN users u ON o.created_by = u.id SET o.team_id = u.team_id');
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['team_id']);
            $table->dropColumn('team_id');
        });
    }
};
