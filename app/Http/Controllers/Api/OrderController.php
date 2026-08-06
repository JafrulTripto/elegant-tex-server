<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatus;
use App\Exceptions\OrderAlreadyInStatusException;
use App\Exceptions\OrderException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrdersResource;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\Status;
use App\Models\User;
use App\Services\OrderService;
use App\Services\StockService;
use Illuminate\Validation\Rule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class OrderController extends Controller
{

  private OrderService $orderService;
  private const PAGESIZE = 10;

  public function __construct(OrderService $orderService)
  {

    $this->orderService = $orderService;
  }

  /**
   * Display a listing of the resource.
   *
   * @return ResourceCollection
   */
  public function index()
  {

  }

  public function getOrder($orderID)
  {
    return $this->orderService->getOrder($orderID);
  }

  public function getMarketplaceOrders($userID, Request $request): ResourceCollection
  {
    $user = User::find($userID);
    $pageSize = OrderController::PAGESIZE;
    $paginate = $request->get('paginate', true);
    $paginateBoolean = filter_var($paginate, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    $query = Order::whereHasMorph('orderable', [Marketplace::class])
      ->withCount('product')
      ->with(['orderable' => function ($query) {
        $query->select('id', 'name');
      },
        'createdBy' => function ($query) {
          $query->select('id', 'firstname', 'lastname');
        }]);

    // Team is the visibility axis (ADR 0001): non-admins see only their team.
    $this->applyTeamScope($query, $user);

    // Apply common filters
    $query = $this->applyFiltersToQuery($query, $request);

    if ($paginateBoolean) {
      $orders = $query->paginate($pageSize);
    } else {
      $orders = $query->get(); // Get all results without pagination
    }

    return OrdersResource::collection($orders);
  }


  public function getMerchantOrders(Request $request): ResourceCollection
  {
    $pageSize = OrderController::PAGESIZE;
    $paginate = $request->get('paginate', true);
    $paginateBoolean = filter_var($paginate, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    $query = Order::whereHasMorph('orderable', [Merchant::class])
      ->withCount('product')
      ->with(['orderable' => function ($query) {
        $query->select('id', 'name');
      },
        'createdBy' => function ($query) {
          $query->select('id', 'firstname', 'lastname');
        }]);

    // Team is the visibility axis (ADR 0001): merchant orders are now scoped too.
    $this->applyTeamScope($query, auth()->user());

    // Apply common filters
    $query = $this->applyFiltersToQuery($query, $request);

    if ($paginateBoolean) {
      $orders = $query->paginate($pageSize);
    } else {
      $orders = $query->get(); // Get all results without pagination
    }

    return OrdersResource::collection($orders);
  }

  /** Mark order lines as returned, with condition; sellable lines feed Ready Stock. */
  public function markReturned(Request $request, StockService $stockService, $orderId): JsonResponse
  {
    $request->validate([
      'lines' => ['required', 'array', 'min:1'],
      'lines.*.productId' => ['required', 'integer'],
      'lines.*.condition' => ['required', Rule::in(['SELLABLE', 'DAMAGED'])],
    ]);

    $order = Order::findOrFail($orderId);
    try {
      $stockService->recordReturn($order, $request->input('lines'), optional(auth()->user())->id);
    } catch (\Throwable $e) {
      return response()->json(['message' => $e->getMessage()], 400);
    }
    return response()->json(['message' => 'Return recorded.']);
  }

  /** Cancel an order; sellable lines of a produced order are added to Ready Stock. */
  public function cancelOrder(Request $request, StockService $stockService, $orderId): JsonResponse
  {
    $request->validate([
      'comment' => ['nullable', 'string'],
      'lines' => ['array'],
      'lines.*.productId' => ['required', 'integer'],
      'lines.*.condition' => ['required', Rule::in(['SELLABLE', 'DAMAGED'])],
    ]);

    $order = Order::findOrFail($orderId);
    if (in_array($order->status, [OrderStatus::CANCELLED->value, OrderStatus::DELIVERED->value], true)) {
      return response()->json(['message' => 'This order can no longer be cancelled.'], 400);
    }

    try {
      $restocked = $stockService->cancelOrder($order, $request->input('comment'), $request->input('lines', []), optional(auth()->user())->id);
    } catch (\Throwable $e) {
      return response()->json(['message' => $e->getMessage()], 400);
    }
    return response()->json(['message' => $restocked ? "Order cancelled — {$restocked} item(s) added to ready stock." : 'Order cancelled.']);
  }

  /** Fulfil one order line from Ready Stock. */
  public function pullFromStock(StockService $stockService, $orderId, $productId): JsonResponse
  {
    $line = Product::where('id', $productId)->where('order_id', $orderId)->firstOrFail();
    try {
      $stockService->pull($line, optional(auth()->user())->id);
    } catch (\Throwable $e) {
      return response()->json(['message' => $e->getMessage()], 400);
    }
    return response()->json(['message' => 'Fulfilled from ready stock.']);
  }

  /** Admin reassignment of an order to a different team (ADR 0001). */
  public function updateTeam(Request $request, $orderId): JsonResponse
  {
    $request->validate(['teamId' => ['required', 'integer', 'exists:teams,id']]);
    $order = Order::findOrFail($orderId);
    $order->team_id = $request->input('teamId');
    $order->save();
    return response()->json(['message' => 'Order team updated successfully.']);
  }

  public function getStats($userId)
  {
      $user = User::findOrFail($userId);
      $query = Order::query();

      // Team is the visibility axis (ADR 0001): admins (VIEW_ALL_ORDERS) see all,
      // everyone else is scoped to their own team.
      $this->applyTeamScope($query, $user);

      $stats = [
          'total' => (clone $query)->count(),
          'pending' => (clone $query)->whereIn('status', [OrderStatus::DRAFT->value, OrderStatus::BOOKING->value])->count(),
          'processing' => (clone $query)->whereIn('status', [OrderStatus::APPROVED->value, OrderStatus::PRODUCTION->value, OrderStatus::QA->value, OrderStatus::READY->value])->count(),
          'delivered' => (clone $query)->where('status', OrderStatus::DELIVERED->value)->count(),
      ];

      return response()->json($stats);
  }


  /**
   * Show the form for creating a new resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function create()
  {
    //
  }

  /**
   * Store a newly created resource in storage.
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse|int
   * @throws HttpException
   * @throws \Exception
   */
  public function store(StoreOrderRequest $request, OrderService $orderService)
  {

    $validatedData = $request->validated();

    try {
      $order = $orderService->store($validatedData);
    } catch (OrderException $e) {
      throw new \Exception($e->getMessage(), 500);
    }

    return response()->json([
      'message' => 'Order created successfully',
      'order_id' => $order->id
    ]);

  }

  public function updateOrderStatus(Request $request)
  {
    try {
      $orderId = $request->orderId;
      $newStatusId = $request->newStatus;
      $statusComment = $request->statusComment;

      if (!auth()->user()->hasPermissionTo('CHANGE_STATUS')) {
        return response()->json(['message' => 'You do not have permission to change order status.'], 403);
      }

      return $this->orderService->updateOrderStatus($orderId, $newStatusId, $statusComment);
    } catch (OrderAlreadyInStatusException $e) {
      return response()->json(['message' => $e->getMessage()], 422);
    } catch (\Exception $e) {
      return response()->json(['message' => $e->getMessage()], 500);
    }
  }


  /**
   * Display the specified resource.
   *
   * @param \App\Models\Order $order
   * @return \Illuminate\Http\Response
   */
  public function show(Order $order)
  {
    //
  }

  /**
   * Show the form for editing the specified resource.
   *
   * @param \App\Models\Order $order
   * @return \Illuminate\Http\Response
   */
  public function edit(Order $order)
  {
    //
  }

  /**
   * Update the specified resource in storage.
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Models\Order $order
   * @return JsonResponse
   */
  public function update(UpdateOrderRequest $request, $orderId)
  {
    $order = Order::find($orderId);
    $validatedData = $request->validated();

    try {
      $order = $this->orderService->update($order, $validatedData);
    } catch (OrderException $e) {
      throw new \Exception($e->getMessage(), 500);
    }

    return response()->json([
      'message' => 'Order updated successfully',
      'order' => $order
    ]);
  }

  /**
   * Remove the specified resource from storage.
   *
   * @param \App\Models\Order $order
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy($id): JsonResponse
  {
    try {
      $order = Order::findOrFail($id);
      $this->orderService->deleteOrder($order);
      return response()->json(['message' => 'Order deleted successfully'], ResponseAlias::HTTP_OK);
    } catch (\Exception $e) {
      Log::error($e->getMessage());
      return response()->json(['message' => 'An error occurred while deleting the order'], ResponseAlias::HTTP_INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Restrict an order query to the user's team unless they may view all teams.
   * Team is the single order-visibility axis (ADR 0001).
   */
  private function applyTeamScope($query, ?User $user)
  {
    if ($user && !$user->hasPermissionTo('VIEW_ALL_ORDERS')) {
      $query->where('team_id', $user->team_id);
    }
    return $query;
  }

  private function applyFiltersToQuery($query, $request)
  {
    $search = $request->input('search', ''); // Generic search fallback
    $searchId = $request->input('id', '');
    $searchOrderedBy = $request->input('orderedBy', '');
    
    $deliveryDateFilterStartDate = $request->input('startDate', '');
    $deliveryDateFilterEndDate = $request->input('endDate', '');
    $orderDateFilterStartDate = $request->input('orderDateStart', '');
    $orderDateFilterEndDate = $request->input('orderDateEnd', '');
    $status = $request->input('status') ? array_map('intval', explode(',', $request->input('status'))) : [];

    $sortField = $request->input('sortField');
    $sortOrder = $request->input('sortOrder', 'asc'); // asc or desc, default asc if not spec (but for id default is desc)

    // Apply ID search
    if (!empty($searchId)) {
      $query->where('id', 'like', "%{$searchId}%");
    } elseif (!empty($search)) {
       // Fallback generic search
       $query->where('id', 'like', "%{$search}%");
    }

    // Apply OrderedBy Search (Merchant/Marketplace Name)
    // Note: orderedBy in Resource maps to orderable->name
    if (!empty($searchOrderedBy)) {
        // Since orderable is polymorphic (Marketplace or Merchant), we can query the related model.
        // We use whereHasMorph to query polymorphic relations.
        $query->whereHasMorph('orderable', [Marketplace::class, Merchant::class], function ($q) use ($searchOrderedBy) {
             $q->where('name', 'like', "%{$searchOrderedBy}%");
        });
    }

    // Apply CreatedBy Search (User Name)
    $searchCreatedBy = $request->input('createdBy', '');
    if (!empty($searchCreatedBy)) {
        $query->whereHas('createdBy', function ($q) use ($searchCreatedBy) {
            $q->where('firstname', 'like', "%{$searchCreatedBy}%")
              ->orWhere('lastname', 'like', "%{$searchCreatedBy}%");
        });
    }

    // Apply status filter
    if (!empty($status)) {
      $query->whereIn('status', $status);
    }

    // Apply delivery date filters
    if (!empty($deliveryDateFilterStartDate)) {
      $query->whereDate('delivery_date', '>=', $deliveryDateFilterStartDate);
    }

    if (!empty($deliveryDateFilterEndDate)) {
      $query->whereDate('delivery_date', '<=', $deliveryDateFilterEndDate);
    }

    if (!empty($orderDateFilterStartDate)) {
      $query->whereDate('created_at', '>=', $orderDateFilterStartDate);
    }

    if (!empty($orderDateFilterEndDate)) {
      $query->whereDate('created_at', '<=', $orderDateFilterEndDate);
    }

    // Sorting
    if ($sortField) {
        $direction = $sortOrder === 'ascend' ? 'asc' : 'desc'; // AntD sends 'ascend'/'descend'
        if ($sortOrder === 'asc') $direction = 'asc';
        if ($sortOrder === 'desc') $direction = 'desc';

        if ($sortField === 'totalAmount') {
             $query->orderBy('total_amount', $direction);
        } elseif ($sortField === 'createdAt') {
             $query->orderBy('created_at', $direction);
        } elseif ($sortField === 'deliveryDate') {
             $query->orderBy('delivery_date', $direction);
        } else {
             $query->orderBy($sortField, $direction);
        }
    } else {
        // Default Sort
        $query->latest('id');
    }

    return $query;
  }

}
