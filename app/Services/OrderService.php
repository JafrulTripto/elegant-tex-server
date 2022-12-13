<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Models\Marketplace;
use App\Models\Merchant;
use App\Models\Order;


class OrderService
{
    private CustomerService $customerService;
    private ProductService $productService;
    private ImageService $imageService;

    public function __construct(
        CustomerService $customerService,
        ProductService $productService,
        ImageService $imageService
    )
    {
        $this->customerService = $customerService;
        $this->productService = $productService;
        $this->imageService = $imageService;
    }

    public function store(array $orderData): void
    {
        $model = null;

        $customer = $this->extractCustomerData($orderData);
        $order = new Order();
        $order->status = OrderStatus::DRAFT;
        $order->created_by = $orderData['createdBy'];
        $order->delivery_channel = $orderData['deliveryChannel'];
        $order->delivery_date = date('Y-m-d H:i:s', strtotime($orderData['deliveryDate']));
        $order->delivery_charge = $orderData['deliveryCharge'];
        $order->amount = $orderData['amount'];
        $order->total_amount = $orderData['amount'] + $orderData['deliveryCharge'];

        if ($orderData['orderType'] == OrderType::MARKETPLACE->value) {
            $marketplace = Marketplace::findOrFail($orderData['marketplaceId']);
            $this->customerService->store($customer, $order);
            $model = $marketplace;
        } else {
            $merchant = Merchant::findOrFail($orderData['merchantId']);
            $model = $merchant;
        }
        $model->order()->save($order);

        foreach ($orderData['products'] as $product){
            $this->productService->store($product, $order);
        }
        if (array_key_exists('images', $orderData) && !empty($orderData['images'])) {
            foreach ($orderData['images'] as $image){
                $this->imageService->store($order, $image);
            }
        }
    }

    private function extractCustomerData($orderData)
    {
        return [
            'name' => $orderData['name'],
            'phone' => $orderData['phone'],
            'facebookId' => $orderData['facebookId'],
            'address' => $orderData['address'],
            'altPhone' => $orderData['altPhone'],
            'district' => $orderData['district'],
            'division' => $orderData['division'],
        ];

    }

}
