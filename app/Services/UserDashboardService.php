<?php

namespace App\Services;

use App\Models\Order;
use Carbon\Carbon;

class UserDashboardService
{
  public function getUserOrdersStats($userId)
  {
    // Ensure the user ID is valid and properly sanitized
    $userId = intval($userId);

    // Get today's date and the start of the current month
    $today = Carbon::now()->startOfDay();
    $startOfMonth = Carbon::now()->startOfMonth();

    // Query for today's orders
    $todayOrders = Order::where('created_by', $userId)
      ->whereDate('created_at', $today)
      ->selectRaw('COUNT(*) as count, SUM(amount) as total_amount')
      ->first();

    // Query for this month's orders
    $monthlyOrders = Order::where('created_by', $userId)
      ->whereDate('created_at', '>=', $startOfMonth)
      ->selectRaw('COUNT(*) as count, SUM(amount) as total_amount')
      ->first();

    return response()->json([
      'today' => [
        'total' => $todayOrders->count ?? 0,
        'amount' => $todayOrders->total_amount ?? 0,
      ],
      'monthly' => [
        'total' => $monthlyOrders->count ?? 0,
        'amount' => $monthlyOrders->total_amount ?? 0,
      ],
    ]);
  }
}
