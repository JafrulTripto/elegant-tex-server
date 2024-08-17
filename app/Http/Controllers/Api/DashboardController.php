<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\OrderStatus;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{

	public function getDashboardData(): JsonResponse
	{
		$today = Carbon::today();
		$startOfMonth = Carbon::now()->startOfMonth();

		// Total Orders and Amount Today
		$todayOrders = Order::whereDate('created_at', $today)->count();
		$totalAmountSoldToday = Order::whereDate('created_at', $today)->sum('total_amount');

		// Total Orders and Amount This Month
		$totalOrdersThisMonth = Order::whereBetween('created_at', [$startOfMonth, Carbon::now()])->count();
		$totalAmountSoldThisMonth = Order::whereBetween('created_at', [$startOfMonth, Carbon::now()])->sum('total_amount');

		// Merchant Orders and Amount Today
		$todayMerchantOrders = Order::where('orderable_type', 'App\Models\Merchant')
			->whereDate('created_at', $today)
			->count();
		$totalAmountSoldMerchantToday = Order::where('orderable_type', 'App\Models\Merchant')
			->whereDate('created_at', $today)
			->sum('total_amount');

		// Merchant Orders and Amount This Month
		$totalMerchantOrdersThisMonth = Order::where('orderable_type', 'App\Models\Merchant')
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->count();
		$totalAmountSoldMerchantThisMonth = Order::where('orderable_type', 'App\Models\Merchant')
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->sum('total_amount');

		// Marketplace Orders and Amount Today
		$todayMarketplaceOrders = Order::where('orderable_type', 'App\Models\Marketplace')
			->whereDate('created_at', $today)
			->count();
		$totalAmountSoldMarketplaceToday = Order::where('orderable_type', 'App\Models\Marketplace')
			->whereDate('created_at', $today)
			->sum('total_amount');

		// Marketplace Orders and Amount This Month
		$totalMarketplaceOrdersThisMonth = Order::where('orderable_type', 'App\Models\Marketplace')
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->count();
		$totalAmountSoldMarketplaceThisMonth = Order::where('orderable_type', 'App\Models\Marketplace')
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->sum('total_amount');

		// Delivered and Returned Orders This Month
		$deliveredStatus = OrderStatus::DELIVERED->value;
		$returnedStatus = OrderStatus::RETURNED->value;

		$totalDeliveredOrdersThisMonth = Order::where('status', $deliveredStatus)
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->count();
		$totalAmountDeliveredThisMonth = Order::where('status', $deliveredStatus)
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->sum('total_amount');

		$totalReturnedOrdersThisMonth = Order::where('status', $returnedStatus)
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->count();
		$totalAmountReturnedThisMonth = Order::where('status', $returnedStatus)
			->whereBetween('created_at', [$startOfMonth, Carbon::now()])
			->sum('total_amount');

		return response()->json([
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
