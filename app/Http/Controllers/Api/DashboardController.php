<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Marketplace;
use App\Models\Order;
use App\Services\AdminDashboardService;
use App\Services\UserDashboardService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\OrderStatus;
use Illuminate\Support\Facades\DB;


class DashboardController extends Controller
{

  private UserDashboardService $userDashboardService;
  private AdminDashboardService $adminDashboardService;

  public function __construct(
    UserDashboardService $userDashboardService,
    AdminDashboardService $adminDashboardService
  )
  {
    $this->userDashboardService = $userDashboardService;
    $this->adminDashboardService = $adminDashboardService;
  }

  public function getUserOrderStats(Request $request): JsonResponse
  {
    $userId =  $request->input('id');
    return $this->userDashboardService->getUserOrdersStats($userId);
  }

  public function getUserFulfillmentStats(Request $request): JsonResponse
  {
    $userId = $request->input('id');
    return $this->userDashboardService->getUserFulfillmentStats($userId);
  }
  public function getTopMarketplacesMonthlyStats(Request $request): JsonResponse
  {
    $data = $this->adminDashboardService->getTopMarketplacesMonthlyStats();
    return response()->json($data);
  }

  public function getDashboardData(): JsonResponse
  {
    $data = $this->adminDashboardService->getDashboardData();
    return response()->json($data);
  }

  public function getBarChartData(): JsonResponse
  {
    $data = $this->adminDashboardService->getBarChartData();
    return response()->json($data);
  }

  public function getOrdersPerMarketplace(Request $request): JsonResponse
  {
    $type = $request->input('type', 'month');
    $data = $this->adminDashboardService->getOrdersPerMarketplace($type);
    return response()->json($data);
  }

  public function getMonthlyOrderPerUser(): JsonResponse
  {
    $data = $this->adminDashboardService->getMonthlyOrderPerUser();
    return response()->json($data);
  }

  public function getMonthlyFulfillmentStats(): JsonResponse
  {
    $data = $this->adminDashboardService->getMonthlyFulfillmentStats();
    return response()->json($data);
  }
}
