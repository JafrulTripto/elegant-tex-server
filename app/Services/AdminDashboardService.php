<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Models\Marketplace;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AdminDashboardService
{
  public function getDashboardData(): array
  {
    $today = Carbon::today();
    $startOfLast30Days = Carbon::now()->subDays(29)->startOfDay();

    // Total Orders and Amount Today
    $todayOrders = Order::whereDate('created_at', $today)->count();
    $totalAmountSoldToday = Order::whereDate('created_at', $today)->sum('total_amount');

    // Total Orders and Amount Last 30 Days
    $totalOrdersThisMonth = Order::whereBetween('created_at', [$startOfLast30Days, Carbon::now()])->count();
    $totalAmountSoldThisMonth = Order::whereBetween('created_at', [$startOfLast30Days, Carbon::now()])->sum('total_amount');

    // Merchant Orders and Amount Today
    $todayMerchantOrders = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereDate('created_at', $today)
      ->count();
    $totalAmountSoldMerchantToday = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereDate('created_at', $today)
      ->sum('total_amount');

    // Merchant Orders and Amount Last 30 Days
    $totalMerchantOrdersThisMonth = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->count();
    $totalAmountSoldMerchantThisMonth = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->sum('total_amount');

    // Marketplace Orders and Amount Today
    $todayMarketplaceOrders = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereDate('created_at', $today)
      ->count();
    $totalAmountSoldMarketplaceToday = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereDate('created_at', $today)
      ->sum('total_amount');

    // Marketplace Orders and Amount Last 30 Days
    $totalMarketplaceOrdersThisMonth = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->count();
    $totalAmountSoldMarketplaceThisMonth = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->sum('total_amount');

    // Delivered and Returned Orders Last 30 Days
    $deliveredStatus = OrderStatus::DELIVERED->value;
    $returnedStatus = OrderStatus::RETURNED->value;

    $totalDeliveredOrdersThisMonth = Order::where('status', $deliveredStatus)
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->count();
    $totalAmountDeliveredThisMonth = Order::where('status', $deliveredStatus)
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->sum('total_amount');

    $totalReturnedOrdersThisMonth = Order::where('status', $returnedStatus)
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->count();
    $totalAmountReturnedThisMonth = Order::where('status', $returnedStatus)
      ->whereBetween('created_at', [$startOfLast30Days, Carbon::now()])
      ->sum('total_amount');

    return [
      'total_orders_today' => [
        'total' => $todayOrders,
        'amount' => $totalAmountSoldToday,
      ],
      'total_orders_this_month' => [
        'total' => $totalOrdersThisMonth,
        'amount' => $totalAmountSoldThisMonth,
      ],
      'total_merchant_orders_today' => [
        'total' => $todayMerchantOrders,
        'amount' => $totalAmountSoldMerchantToday,
      ],
      'total_merchant_orders_this_month' => [
        'total' => $totalMerchantOrdersThisMonth,
        'amount' => $totalAmountSoldMerchantThisMonth,
      ],
      'total_marketplace_orders_today' => [
        'total' => $todayMarketplaceOrders,
        'amount' => $totalAmountSoldMarketplaceToday,
      ],
      'total_marketplace_orders_this_month' => [
        'total' => $totalMarketplaceOrdersThisMonth,
        'amount' => $totalAmountSoldMarketplaceThisMonth,
      ],
      'delivered_orders_this_month' => [
        'total' => $totalDeliveredOrdersThisMonth,
        'amount' => $totalAmountDeliveredThisMonth,
      ],
      'returned_orders_this_month' => [
        'total' => $totalReturnedOrdersThisMonth,
        'amount' => $totalAmountReturnedThisMonth,
      ],
    ];
  }

  public function getBarChartData(): array
  {
    $startDate = now()->subDays(29)->startOfDay();
    $endDate = now()->endOfDay();

    $orders = Order::whereBetween('created_at', [$startDate, $endDate])
      ->selectRaw('DATE(created_at) as date, COUNT(*) as total_count, SUM(total_amount) as total_amount')
      ->groupBy('date')
      ->orderBy('date')
      ->get();

    $result = [];

    foreach ($orders as $order) {
      $result[$order->date] = [
        'total_count' => (int)$order->total_count,
        'total_amount' => (float)$order->total_amount,
      ];
    }

    return $result;
  }

  public function getOrdersPerMarketplace(string $type): array
  {
    if ($type === 'year') {
      // Get data for the current year
      $startDate = Carbon::now()->startOfYear();
      $endDate = Carbon::now()->endOfYear();
    } else {
      // Get data for the current month (default)
      $startDate = Carbon::now()->startOfMonth();
      $endDate = Carbon::now()->endOfMonth();
    }

    $marketplaces = Marketplace::all();

    $marketplaceOrdersData = [];
    foreach ($marketplaces as $marketplace) {
      $totalOrders = $marketplace->order()
        ->whereBetween('created_at', [$startDate, $endDate])
        ->count();

      if ($totalOrders > 0) {
        $marketplaceOrdersData[] = [
          'marketplace_name' => $marketplace->name,
          'total_orders' => $totalOrders,
        ];
      }
    }

    // Sort by total_orders in descending order
    usort($marketplaceOrdersData, function ($a, $b) {
      return $b['total_orders'] <=> $a['total_orders'];
    });

    return $marketplaceOrdersData;
  }

  public function getMonthlyFulfillmentStats(): array
  {
    $month = Carbon::now()->month;
    $year  = Carbon::now()->year;

    // Promised: orders with delivery_date this month that are still active (not cancelled/returned)
    $promised = Order::whereMonth('delivery_date', $month)
      ->whereYear('delivery_date', $year)
      ->whereNotIn('status', [
        OrderStatus::CANCELLED->value,
        OrderStatus::RETURNED->value,
      ])
      ->count();

    // Delivered: orders that transitioned to DELIVERED status this month
    $delivered = \App\Models\OrderStatusChange::where('status', OrderStatus::DELIVERED->value)
      ->whereMonth('created_at', $month)
      ->whereYear('created_at', $year)
      ->count(DB::raw('DISTINCT order_id'));

    // Cancelled: orders that transitioned to CANCELLED status this month
    $cancelled = \App\Models\OrderStatusChange::where('status', OrderStatus::CANCELLED->value)
      ->whereMonth('created_at', $month)
      ->whereYear('created_at', $year)
      ->count(DB::raw('DISTINCT order_id'));

    // Returned: orders that transitioned to RETURNED status this month
    $returned = \App\Models\OrderStatusChange::where('status', OrderStatus::RETURNED->value)
      ->whereMonth('created_at', $month)
      ->whereYear('created_at', $year)
      ->count(DB::raw('DISTINCT order_id'));

    return [
      'promised'  => $promised,
      'delivered' => $delivered,
      'cancelled' => $cancelled,
      'returned'  => $returned,
    ];
  }

  public function getMonthlyOrderPerUser(): array

  {
    // Monthly stats (used for ranking)
    $monthlyStats = Order::select(
      'users.id',
      DB::raw("CONCAT(users.firstname, ' ', users.lastname) as fullname"),
      'users.email',
      DB::raw('COUNT(orders.id) as total_orders'),
      DB::raw('CAST(SUM(orders.total_amount) AS FLOAT) as total_amount'),
      'images.id as image_id'
    )
      ->join('users', 'orders.created_by', '=', 'users.id')
      ->leftJoin('images', function ($join) {
        $join->on('users.id', '=', 'images.imageable_id')
          ->where('images.imageable_type', '=', 'App\\Models\\User');
      })
      ->whereMonth('orders.created_at', Carbon::now()->month)
      ->whereYear('orders.created_at', Carbon::now()->year)
      ->groupBy('users.id', 'users.firstname', 'users.lastname', 'users.email', 'images.id')
      ->orderBy('total_amount', 'desc')
      ->get();

    // Yearly totals for the same users (current calendar year)
    $userIds = $monthlyStats->pluck('id');
    $yearlyStats = Order::select(
      'users.id',
      DB::raw('COUNT(orders.id) as yearly_orders'),
      DB::raw('CAST(SUM(orders.total_amount) AS FLOAT) as yearly_amount')
    )
      ->join('users', 'orders.created_by', '=', 'users.id')
      ->whereIn('users.id', $userIds)
      ->whereYear('orders.created_at', Carbon::now()->year)
      ->groupBy('users.id')
      ->get()
      ->keyBy('id');

    // Merge yearly data onto monthly results
    return $monthlyStats->map(function ($user) use ($yearlyStats) {
      $yearly = $yearlyStats->get($user->id);
      $user->yearly_orders = $yearly?->yearly_orders ?? 0;
      $user->yearly_amount = $yearly?->yearly_amount ?? 0;
      return $user;
    })->toArray();
  }

  public function getTopMarketplacesMonthlyStats(): array
  {
    // Rolling last 12 months: from start of the month 11 months ago through end of today
    $startDate = Carbon::now()->subMonths(11)->startOfMonth();
    $endDate   = Carbon::now()->endOfDay();

    $topMarketplaces = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereDate('created_at', '>=', $startDate)
      ->whereDate('created_at', '<=', $endDate)
      ->selectRaw('orderable_id, SUM(total_amount) as total_amount')
      ->groupBy('orderable_id')
      ->orderBy('total_amount', 'desc')
      ->limit(5)
      ->pluck('orderable_id');

    $monthlyStats = Order::whereIn('orderable_id', $topMarketplaces)
      ->whereDate('created_at', '>=', $startDate)
      ->whereDate('created_at', '<=', $endDate)
      ->selectRaw('orderable_id, YEAR(created_at) as year, MONTH(created_at) as month, COUNT(*) as order_count, SUM(total_amount) as total_amount')
      ->groupBy('orderable_id', 'year', 'month')
      ->orderBy('orderable_id')
      ->get()
      ->groupBy('orderable_id');

    // Build the ordered list of 12 month slots
    $monthSlots = [];
    for ($i = 11; $i >= 0; $i--) {
      $date = Carbon::now()->subMonths($i);
      $monthSlots[] = [
        'year'  => (int) $date->year,
        'month' => (int) $date->month,
        'label' => $date->format('M Y'),
      ];
    }

    $result = [];

    foreach ($monthlyStats as $marketplaceId => $stats) {
      $marketplace = Marketplace::find($marketplaceId);
      if (!$marketplace) continue;
      $marketplaceName = $marketplace->name;

      $monthlyData = [];
      foreach ($monthSlots as $slot) {
        $monthData = $stats->first(fn($s) => (int)$s->year === $slot['year'] && (int)$s->month === $slot['month']);

        $monthlyData[] = [
          'label'       => $slot['label'],
          'order_count' => $monthData->order_count ?? 0,
          'total_amount' => $monthData->total_amount ?? 0,
        ];
      }

      $result[] = [
        'marketplace_name' => $marketplaceName,
        'monthly_stats'    => $monthlyData,
      ];
    }

    return $result;
  }

}
