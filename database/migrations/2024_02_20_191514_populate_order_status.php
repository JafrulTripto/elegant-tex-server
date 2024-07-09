<?php

//TODO: Remove this migration after migrate.

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        DB::statement('
            UPDATE orders o
            INNER JOIN (
                SELECT os.order_id, s.id AS latest_status
                FROM order_status os
                JOIN (
                    SELECT order_id, MAX(created_at) AS max_date
                    FROM order_status
                    GROUP BY order_id
                ) latest ON os.order_id = latest.order_id AND os.created_at = latest.max_date
                JOIN statuses s ON os.status_id = s.id
            ) latest_status ON o.id = latest_status.order_id
            SET o.status = latest_status.latest_status
        ');
    }

    public function down()
    {
        // No need to revert the data population
    }
};
