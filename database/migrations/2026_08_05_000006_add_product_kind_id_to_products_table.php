<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Every product line resolves to a Product Kind (its triple). Existing rows are
 * backfilled by find-or-creating the matching Kind. on_hand starts at 0 — stock
 * only accrues from returns/manual entry going forward, not retroactively.
 *
 * Backfill is done with two set-based statements (not a per-row loop) so it stays
 * fast on large tables, and every step is guarded so the migration is safe to
 * re-run if a previous attempt was interrupted (e.g. a deploy timeout).
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1) Add the column (nullable, no FK yet) if a previous run didn't get here.
        if (!Schema::hasColumn('products', 'product_kind_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->unsignedBigInteger('product_kind_id')->nullable()->after('type_id');
            });
        }

        // 2) Create any missing Kinds for the distinct triples in one statement.
        //    (product_kinds has a unique index on the triple, so this can't dupe.)
        DB::statement('
            INSERT INTO product_kinds (product_type_id, fabric_type_id, fabric_color_id, on_hand, created_at, updated_at)
            SELECT DISTINCT p.type_id, p.fabric_type_id, p.fabric_color_id, 0, NOW(), NOW()
            FROM products p
            WHERE NOT EXISTS (
                SELECT 1 FROM product_kinds k
                WHERE k.product_type_id = p.type_id
                  AND k.fabric_type_id = p.fabric_type_id
                  AND k.fabric_color_id = p.fabric_color_id
            )
        ');

        // 3) Point every still-unlinked product at its Kind in one statement.
        //    The IS NULL filter makes this incremental after a partial run.
        DB::statement('
            UPDATE products p
            JOIN product_kinds k
              ON k.product_type_id = p.type_id
             AND k.fabric_type_id  = p.fabric_type_id
             AND k.fabric_color_id = p.fabric_color_id
            SET p.product_kind_id = k.id
            WHERE p.product_kind_id IS NULL
        ');

        // 4) Add the FK once, after the column is populated.
        if (!$this->foreignKeyExists('products', 'products_product_kind_id_foreign')) {
            Schema::table('products', function (Blueprint $table) {
                $table->foreign('product_kind_id')->references('id')->on('product_kinds');
            });
        }
    }

    public function down(): void
    {
        if ($this->foreignKeyExists('products', 'products_product_kind_id_foreign')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropForeign(['product_kind_id']);
            });
        }
        if (Schema::hasColumn('products', 'product_kind_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('product_kind_id');
            });
        }
    }

    private function foreignKeyExists(string $table, string $constraint): bool
    {
        return DB::table('information_schema.TABLE_CONSTRAINTS')
            ->where('CONSTRAINT_SCHEMA', DB::getDatabaseName())
            ->where('TABLE_NAME', $table)
            ->where('CONSTRAINT_NAME', $constraint)
            ->where('CONSTRAINT_TYPE', 'FOREIGN KEY')
            ->exists();
    }
};
