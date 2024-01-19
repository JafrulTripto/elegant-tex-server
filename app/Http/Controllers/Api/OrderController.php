<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\OrderException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrdersResource;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;
use App\Services\OrderService;
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
  private const PAGESIZE = 13;

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
    $search = $request->input('search', '');
    $status = $request->input('status')? array_map('intval', explode(',', $request->input('status'))) : [];
    $pageSize = OrderController::PAGESIZE;

    if ($user->hasPermissionTo("VIEW_ALL_ORDERS")) {
      $query = Order::whereHasMorph('orderable', Marketplace::class)
        ->latest('id');
    } else {
      $query = Order::whereHasMorph('orderable', [Marketplace::class], function (Builder $query) use ($userID) {
        $query->whereHas('users', function ($q) use ($userID) {
          $q->where("marketplace_user.user_id", $userID);
        });
      })
        ->latest('id');
    }
    // Apply search filter
    if (!empty($search)) {
      $query->where(function ($query) use ($search) {
        $query->where('id', 'like', '%' . $search . '%');
      });
    }
    // Apply status filter
    if (!empty($status)) {
      $query->whereIn('status', $status);
    }

    $orders = $query->paginate($pageSize);
    return OrdersResource::collection($orders);
  }


  public function getMerchantOrders(Request $request)
  {
    $search = $request->input('search', '');
    $status = $request->input('status')? array_map('intval', explode(',', $request->input('status'))) : [];
    $query = Order::whereHasMorph('orderable', [Merchant::class])->latest('id');
    if (!empty($search)) {
      $query->where('id', 'like', '%' . $search . '%');
    }
    if (!empty($status)) {
      $query->whereIn('status', $status);
    }
    $orders = $query->paginate(OrderController::PAGESIZE);

    return OrdersResource::collection($orders);
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

  public function changeOrderStatus(Request $request)
  {
    $id = $request->orderId;
    $status = $request->orderStatus;

    return OrdersResource::make($this->orderService->changeOrderStatus($id, $status));
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
}
