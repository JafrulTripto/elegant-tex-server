import 'package:equatable/equatable.dart';

class OrderProduct extends Equatable {
  const OrderProduct({
    required this.productType,
    required this.fabric,
    required this.fabricType,
    required this.description,
    required this.price,
    required this.unit,
    required this.imageId,
  });

  final String productType;
  final String? fabric;
  final String? fabricType;
  final String? description;
  final double price;
  final int unit;
  final int? imageId;

  @override
  List<Object?> get props => [productType, fabric, price, unit];
}

class OrderCustomer extends Equatable {
  const OrderCustomer({required this.name, required this.address, required this.phone});
  final String name;
  final String address;
  final String phone;

  @override
  List<Object?> get props => [name, address, phone];
}

class OrderStatusChange extends Equatable {
  const OrderStatusChange({
    required this.status,
    required this.comment,
    required this.createdAt,
    required this.userName,
  });

  final int status;
  final String? comment;
  final DateTime? createdAt;
  final String? userName;

  @override
  List<Object?> get props => [status, comment, createdAt];
}

class OrderDetail extends Equatable {
  const OrderDetail({
    required this.id,
    required this.orderId,
    required this.orderType,
    required this.status,
    required this.orderableName,
    required this.merchantRef,
    required this.createdAt,
    required this.deliveryDate,
    required this.deliveryChannel,
    required this.subtotal,
    required this.deliveryCharge,
    required this.total,
    required this.products,
    required this.customer,
    required this.timeline,
    required this.imageIds,
  });

  final int id;
  final String orderId;
  final int orderType; // OrderType enum value (1 = marketplace, 0 = merchant)
  final int status;
  final String orderableName;
  final String? merchantRef;
  final DateTime? createdAt;
  final DateTime? deliveryDate;
  final String deliveryChannel;
  final double subtotal;
  final double deliveryCharge;
  final double total;
  final List<OrderProduct> products;
  final OrderCustomer? customer;
  final List<OrderStatusChange> timeline;
  final List<int> imageIds;

  bool get isMarketplace => customer != null;

  OrderDetail copyWith({int? status}) => OrderDetail(
        id: id,
        orderId: orderId,
        orderType: orderType,
        status: status ?? this.status,
        orderableName: orderableName,
        merchantRef: merchantRef,
        createdAt: createdAt,
        deliveryDate: deliveryDate,
        deliveryChannel: deliveryChannel,
        subtotal: subtotal,
        deliveryCharge: deliveryCharge,
        total: total,
        products: products,
        customer: customer,
        timeline: timeline,
        imageIds: imageIds,
      );

  @override
  List<Object?> get props => [id, status, total, products, timeline];
}
