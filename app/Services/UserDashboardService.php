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
