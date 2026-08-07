import 'package:equatable/equatable.dart';

/// One row in the orders list (mirrors the backend OrdersResource).
class OrderListItem extends Equatable {
  const OrderListItem({
    required this.id,
    required this.orderId,
    required this.orderedBy,
    required this.createdBy,
    required this.status,
    required this.totalAmount,
    required this.createdAt,
    required this.deliveryDate,
    required this.itemsCount,
  });

  final int id;
  final String orderId;
  final String orderedBy;
  final String createdBy;
  final int status;
  final double totalAmount;
  final DateTime? createdAt;
  final DateTime? deliveryDate;
  final int itemsCount;

  @override
  List<Object?> get props => [id, status, totalAmount, deliveryDate];
}
