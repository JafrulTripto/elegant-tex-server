<?php

namespace App\Services;

use App\Models\Marketplace;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class UserDashboardService
{
  public function getUserOrdersStats($userId): JsonResponse
  {
    $userId = intval($userId);
    $today = Carbon::now()->startOfDay();
    $startOfMonth = Carbon::now()->startOfMonth();
    $todayOrders = Order::where('created_by', $userId)
      ->whereDate('created_at', $today)
      ->selectRaw('COUNT(*) as count, SUM(total_amount) as total_amount')
      ->first();

    $monthlyOrders = Order::where('created_by', $userId)
      ->whereDate('created_at', '>=', $startOfMonth)
      ->selectRaw('COUNT(*) as count, SUM(total_amount) as total_amount')
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

  public function getUserFulfillmentStats($userId): JsonResponse
  {
    $userId = intval($userId);
    $month  = Carbon::now()->month;
    $year   = Carbon::now()->year;

    // Promised: active orders by this user with delivery_date in this month (not cancelled/returned)
    $promised = Order::where('created_by', $userId)
      ->whereMonth('delivery_date', $month)
      ->whereYear('delivery_date', $year)
      ->whereNotIn('status', [
        \App\Enums\OrderStatus::CANCELLED->value,
        \App\Enums\OrderStatus::RETURNED->value,
      ])
      ->count();

    // Delivered/Cancelled/Returned: status transitions this month on orders created by this user
    $statusCounts = \App\Models\OrderStatusChange::whereHas('order', function ($q) use ($userId) {
        $q->where('created_by', $userId);
      })
      ->whereIn('status', [
        \App\Enums\OrderStatus::DELIVERED->value,
        \App\Enums\OrderStatus::CANCELLED->value,
        \App\Enums\OrderStatus::RETURNED->value,
      ])
      ->whereMonth('order_status_changes.created_at', $month)
      ->whereYear('order_status_changes.created_at', $year)
      ->selectRaw('status, COUNT(DISTINCT order_id) as cnt')
      ->groupBy('status')
      ->pluck('cnt', 'status');

    return response()->json([
      'promised'  => $promised,
      'delivered' => $statusCounts[\App\Enums\OrderStatus::DELIVERED->value] ?? 0,
      'cancelled' => $statusCounts[\App\Enums\OrderStatus::CANCELLED->value] ?? 0,
      'returned'  => $statusCounts[\App\Enums\OrderStatus::RETURNED->value] ?? 0,
    ]);
  }

  /*==========Unused function - For future implementation=============
  public function getTotalMarketplaceOrderStatsByUser($userId): JsonResponse
  {
    $userId = intval($userId);
    $today = Carbon::now()->startOfDay();
    $startOfMonth = Carbon::now()->startOfMonth();
    $marketplaces = Marketplace::whereHas('users', function ($query) use ($userId) {
      $query->where('users.id', $userId);
    })->pluck('id');

    $totalTodayOrders = 0;
    $totalTodayAmount = 0;
    $totalMonthlyOrders = 0;
    $totalMonthlyAmount = 0;

    if ($marketplaces->isNotEmpty()) {
      $todayStats = Order::whereIn('orderable_id', $marketplaces)
        ->whereDate('created_at', $today)
        ->selectRaw('COUNT(*) as count, SUM(total_amount) as total_amount')
        ->first();

      $monthlyStats = Order::whereIn('orderable_id', $marketplaces)
        ->whereDate('created_at', '>=', $startOfMonth)
        ->selectRaw('COUNT(*) as count, SUM(total_amount) as total_amount')
        ->first();
      $totalTodayOrders = $todayStats->count ?? 0;
      $totalTodayAmount = $todayStats->total_amount ?? 0;
      $totalMonthlyOrders = $monthlyStats->count ?? 0;
      $totalMonthlyAmount = $monthlyStats->total_amount ?? 0;
    }
    return response()->json([
      'today' => [
        'order_count' => $totalTodayOrders,
        'total_amount' => $totalTodayAmount,
      ],
      'monthly' => [
        'order_count' => $totalMonthlyOrders,
        'total_amount' => $totalMonthlyAmount,
      ],
    ]);
  }

  ==========Unused function - For future implementation============= */

}
