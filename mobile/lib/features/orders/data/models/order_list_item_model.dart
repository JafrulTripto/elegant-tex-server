import '../../domain/entities/order_list_item.dart';

class OrderListItemModel extends OrderListItem {
  const OrderListItemModel({
    required super.id,
    required super.orderId,
    required super.orderedBy,
    required super.createdBy,
    required super.status,
    required super.totalAmount,
    required super.createdAt,
    required super.deliveryDate,
    required super.itemsCount,
  });

  factory OrderListItemModel.fromJson(Map<String, dynamic> j) => OrderListItemModel(
        id: (j['id'] as num).toInt(),
        orderId: j['orderId']?.toString() ?? '',
        orderedBy: j['orderedBy']?.toString() ?? '',
        createdBy: j['createdBy']?.toString() ?? '',
        status: (j['status'] as num?)?.toInt() ?? 1,
        totalAmount: (j['totalAmount'] as num?)?.toDouble() ?? 0,
        createdAt: DateTime.tryParse(j['createdAt']?.toString() ?? ''),
        deliveryDate: DateTime.tryParse(j['deliveryDate']?.toString() ?? ''),
        itemsCount: (j['itemsCount'] as num?)?.toInt() ?? 0,
      );
}
