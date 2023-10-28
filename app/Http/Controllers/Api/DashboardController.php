<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{

  public function getDashboardData(): JsonResponse
  {
    // Total Orders Today
    $today = Carbon::today();
    $yesterday = Carbon::yesterday();
    $todayOrders = Order::whereDate('created_at', $today)->count();
    $yesterdayOrders = Order::whereDate('created_at', $yesterday)->count();
    $percentageChangeToday = ($yesterdayOrders != 0) ? (($todayOrders - $yesterdayOrders) / $yesterdayOrders) * 100 : 0;

    // Total Marketplace Orders This Month
    $startDate = Carbon::now()->startOfMonth();
    $endDate = Carbon::now()->endOfMonth();
    $totalMarketplaceOrdersThisMonth = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereBetween('created_at', [$startDate, $endDate])
      ->count();
    $lastMonthStartDate = Carbon::now()->subMonth()->startOfMonth();
    $lastMonthEndDate = Carbon::now()->subMonth()->endOfMonth();
    $totalMarketplaceOrdersLastMonth = Order::where('orderable_type', 'App\Models\Marketplace')
      ->whereBetween('created_at', [$lastMonthStartDate, $lastMonthEndDate])
      ->count();
    $percentageChangeMarketplace = ($totalMarketplaceOrdersLastMonth != 0) ? (($totalMarketplaceOrdersThisMonth - $totalMarketplaceOrdersLastMonth) / $totalMarketplaceOrdersLastMonth) * 100 : 0;

    // Total Merchant Orders This Month
    $totalMerchantOrdersThisMonth = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereBetween('created_at', [$startDate, $endDate])
      ->count();
    $totalMerchantOrdersLastMonth = Order::where('orderable_type', 'App\Models\Merchant')
      ->whereBetween('created_at', [$lastMonthStartDate, $lastMonthEndDate])
      ->count();
    $percentageChangeMerchant = ($totalMerchantOrdersLastMonth != 0) ? (($totalMerchantOrdersThisMonth - $totalMerchantOrdersLastMonth) / $totalMerchantOrdersLastMonth) * 100 : 0;

    // Total Amount Sold Today
    $totalAmountSoldToday = Order::whereDate('created_at', $today)->sum('total_amount');
    $totalAmountSoldYesterday = Order::whereDate('created_at', $yesterday)->sum('total_amount');
    $percentageChangeAmountToday = ($totalAmountSoldYesterday != 0) ? (($totalAmountSoldToday - $totalAmountSoldYesterday) / $totalAmountSoldYesterday) * 100 : 0;

    return response()->json([
      'total_orders_today' => [
        'total' => $todayOrders,
        'change' => $percentageChangeToday,
      ],
      'total_marketplace_orders_this_month' => [
        'total' => $totalMarketplaceOrdersThisMonth,
        'change' => $percentageChangeMarketplace,
        // Add other fields as needed
      ],
      'total_merchant_orders_this_month' => [
        'total' => $totalMerchantOrdersThisMonth,
        'change' => $percentageChangeMerchant,
        // Add other fields as needed
      ],
      'total_amount_sold_today' => [
        'total' => $totalAmountSoldToday,
        'change' => $percentageChangeAmountToday,
      ],
    ]);
  }

  public function getBarChartData(): JsonResponse
  {
      $startDate = now()->startOfMonth(); // Get the start of the current month
      $endDate = now()->endOfMonth(); // Get the end of the current month

      // Retrieve the orders within the date range and group them by day
      $orders = Order::whereBetween('created_at', [$startDate, $endDate])
          ->selectRaw('DAY(created_at) as day, COUNT(*) as total')
          ->groupBy('day')
          ->get();

      // Create an array with day numbers (1 to the last day of the month) and initialize them to 0
      $result = [];
      for ($date = $startDate; $date <= $endDate; $date->addDay()) {
          $result[$date->format('j')] = 0;
      }

      // Update the array with actual order counts for each day
      foreach ($orders as $order) {
          $result[(int)$order->day] = (int)$order->total;
      }



    return response()->json($result);
  }

  public function getOrdersPerMarketplace(Request $request)
  {
    $type = $request->input('type', 'month');

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
      $marketplaceOrdersData[] = [
        'marketplace_name' => $marketplace->name,
        'total_orders' => $marketplace->order()
          ->whereBetween('created_at', [$startDate, $endDate])
          ->count(),
      ];
    }

    return response()->json($marketplaceOrdersData);
  }
}
