<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * An order carries the team of its creator, snapshotted at creation (ADR 0001).
 * Existing orders are backfilled from their creator's current team.
 * Defensive/idempotent so it re-runs cleanly over a partial restore.
 */
return new class extends Migration
{
    public function up(): void
    {
        $unassignedId = $this->ensureUnassignedTeam();

        if (!Schema::hasColumn('orders', 'team_id')) {
            Schema::table('orders', function (Blueprint $table) use ($unassignedId) {
                $table->unsignedBigInteger('team_id')->default($unassignedId)->after('created_by');
                $table->foreign('team_id')->references('id')->on('teams');
            });
        }

        // Backfill each order's team from its creator's team (fallback to Unassigned).
        DB::statement('UPDATE orders o JOIN users u ON o.created_by = u.id SET o.team_id = u.team_id WHERE u.team_id IS NOT NULL');
        DB::table('orders')->whereNull('team_id')->update(['team_id' => $unassignedId]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('orders', 'team_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->dropForeign(['team_id']);
                $table->dropColumn('team_id');
            });
        }
    }

    private function ensureUnassignedTeam(): int
    {
        $id = DB::table('teams')->where('name', 'Unassigned')->value('id');
        if (!$id) {
            $id = DB::table('teams')->insertGetId([
                'name' => 'Unassigned',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        return (int) $id;
    }
};
