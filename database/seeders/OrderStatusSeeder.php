<?php

namespace Database\Seeders;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\Status;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OrderStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // Retrieve all orders
        $orders = Order::all();

        foreach ($orders as $order) {
            // Add 1 to the status value before attaching
            $statusValue = $order->status + 1;

            // Attach statuses to the order with current timestamp and modified status data
            $order->statuses()->attach($statusValue, [
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
