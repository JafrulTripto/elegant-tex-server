<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Every product line resolves to a Product Kind (its triple). Existing rows are
 * backfilled by find-or-creating the matching Kind. on_hand starts at 0 — stock
 * only accrues from returns/manual entry going forward, not retroactively.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('product_kind_id')->nullable()->after('type_id');
            $table->foreign('product_kind_id')->references('id')->on('product_kinds');
        });

        $rows = DB::table('products')
            ->select('id', 'type_id', 'fabric_type_id', 'fabric_color_id')
            ->get();

        foreach ($rows as $row) {
            $key = [
                'product_type_id' => $row->type_id,
                'fabric_type_id' => $row->fabric_type_id,
                'fabric_color_id' => $row->fabric_color_id,
            ];

            $kindId = DB::table('product_kinds')->where($key)->value('id');
            if (!$kindId) {
                $kindId = DB::table('product_kinds')->insertGetId($key + [
                    'on_hand' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            DB::table('products')->where('id', $row->id)->update(['product_kind_id' => $kindId]);
        }
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['product_kind_id']);
            $table->dropColumn('product_kind_id');
        });
    }
};
