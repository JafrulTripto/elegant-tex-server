<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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

    public function getMarketplaceOrders($userID, Request $request) : ResourceCollection
    {
        $search = '';
        if ($request->has('search')) {
            $search = $request->input('search');
        }

        $orders = Order::when($search, function ($query, $search) {
            return $query->where('id', $search);
        })->whereHasMorph(
            'orderable', [Marketplace::class], function (Builder $query) use ($userID) {
            $query->whereHas('users', function ($q) use ($userID) {
                $q->where("marketplace_user.user_id", $userID);
            });
        })->orderBy('id', 'DESC')->paginate(10);

        return OrdersResource::collection($orders);
    }

    public function getMerchantOrders(Request $request)
    {
        $search = '';
        if ($request->has('search')) {
            $search = $request->input('search');
        }

        $orders = Order::when($search, function ($query, $search) {
            return $query->where('id', $search);
        })->whereHasMorph(
            'orderable', [Merchant::class], function (Builder $query) {
            return $query;
        })->paginate(10);

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
     */
    public function store(Request $request)
    {
        $orderData = [
            'orderType' => $request->orderType,
            'marketplaceId' => $request->marketplace,
            'merchantId' => $request->merchant,
            'createdBy' => $request->createdBy,
            'deliveryChannel' => $request->deliveryChannel,
            'deliveryCharge' => $request->deliveryCharge,
            'amount' => $request->amount,
            'images' => $request->images,
            'deliveryDate' => $request->deliveryDate,
            'name' => $request->name,
            'phone' => $request->phone,
            'facebookId' => $request->facebookId,
            'address' => $request->address,
            'altPhone' => $request->altPhone,
            'upazila' => $request->upazila,
            'district' => $request->district,
            'division' => $request->division,
            'products' => $request->products,

        ];
        try {
            $this->orderService->store($orderData);
        } catch (\Exception $e) {
            throw new \Exception($e->getMessage(), 500 );
        }

        return response()->json([
            "message" => "Order Created Successfully."
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
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Order $order)
    {
        //
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
