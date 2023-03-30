<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Http\Resources\OrderResource;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;


class OrderService
{
    private CustomerService $customerService;
    private ProductService $productService;
    private ImageService $imageService;
    private StorageService $storageService;

    public function __construct(
        CustomerService $customerService,
        ProductService $productService,
        ImageService $imageService,
        StorageService $storageService
    )
    {
        $this->customerService = $customerService;
        $this->productService = $productService;
        $this->imageService = $imageService;
        $this->storageService = $storageService;
    }

    /**
     * @throws Exception
     */
    public function store(array $orderData): Order
    {
        $model = null;
        $order = new Order();
        $order->status = OrderStatus::DRAFT;
        $this->extracted($order, $orderData);

        if ($orderData['orderType'] == OrderType::MARKETPLACE->value) {
            $customer = $this->extractCustomerData($orderData);
            $marketplace = Marketplace::findOrFail($orderData['marketplace']);
            $this->customerService->store($customer, $order);
            $model = $marketplace;
        } else {
            $merchant = Merchant::findOrFail($orderData['merchant']);
            $model = $merchant;
        }

        $model->order()->save($order);

        foreach ($orderData['products'] as $product) {
            $this->productService->store($product, $order);
        }
        if (array_key_exists('images', $orderData) && !empty($orderData['images'])) {
            foreach ($orderData['images'] as $image){
                $this->imageService->store($order, $image);
            }
        }

        return $order;
    }

    private function extractCustomerData($orderData)
    {
        return [
            'name' => $orderData['name'],
            'phone' => $orderData['phone'],
            'facebookId' => $orderData['facebookId'],
            'address' => $orderData['address'],
            'altPhone' => $orderData['altPhone'],
            'upazila' => $orderData['upazila'],
            'district' => $orderData['district'],
            'division' => $orderData['division'],
        ];

    }

    public function changeOrderStatus($id, $status)
    {
        $order = Order::findOrFail($id);
        if ($order){
            $order->update(['status' => $status]);
        }

        return $order;
    }

    public function getOrder($orderID)
    {
        try {
            $order = Order::with(['customer.address','image', 'product'])->where('id', $orderID)->firstOrFail();
            return OrderResource::make($order);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Order not found'], 404);
        }
    }

    /**
     * @throws Exception
     */
    public function deleteOrder(Order $order): void
    {
        try {
            $images = $order->image;
            foreach ($images as $image) {
                $filePath = $image->path;
                $this->storageService->destroy($filePath);
                $image->delete();
            }

            $products = $order->product;
            foreach ($products as $product) {
                $product->delete();
            }

            $order->delete();
        } catch (\Exception $e) {
            Log::error($e->getMessage());
            throw new Exception('An error occurred while deleting the order');
        }
    }


    public function update(Order $order, array $orderData,): Order
    {
        $this->extracted($order, $orderData);
        $temp = Order::findOrFail(4);
        if ($orderData['orderType'] == OrderType::MARKETPLACE->value) {
            $customerData = $this->extractCustomerData($orderData);
            $marketplace = Marketplace::findOrFail($orderData['marketplace']);
            $customer = $order->customer()->getResults();
            $this->customerService->update($customerData, $customer);
            $model = $marketplace;
        } else {
            $merchant = Merchant::findOrFail($orderData['merchant']);
            $model = $merchant;
        }

        $model->order()->save($order);

        // First, delete all existing products of the order
        $order->product()->delete();

        // Then, add the updated products
        foreach ($orderData['products'] as $productData) {
            $this->productService->store($productData, $order);
        }

        // First, delete all existing images of the order
        $order->image()->delete();

        // Then, add the updated images
        if (array_key_exists('images', $orderData) && !empty($orderData['images'])) {
            foreach ($orderData['images'] as $imageData){
                $this->imageService->store($order, $imageData,);
            }
        }

        return $order;
    }

    /**
     * @param Order $order
     * @param array $orderData
     * @return void
     */
    public function extracted(Order $order, array $orderData): void
    {

        $order->created_by = $orderData['createdBy'];
        $order->delivery_channel = $orderData['deliveryChannel'];
        $order->delivery_date = date('Y-m-d H:i:s', strtotime($orderData['deliveryDate']));
        $order->delivery_charge = $orderData['deliveryCharge'];
        $order->amount = $orderData['amount'];
        $order->total_amount = $orderData['amount'] + $orderData['deliveryCharge'];
    }


}
