<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function getOrderCountToday()
    {
        $today = Carbon::today();
        $yesterday = Carbon::yesterday();

        $todayOrders = Order::whereDate('created_at', $today)->count();
        $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
        $percentageChange = 0;
        if ($yesterdayOrders != 0) {
            $percentageChange = (($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100;
        }

        return response()->json([
            "total" => $todayOrders,
            "change" => $percentageChange,
        ]);
    }
}
