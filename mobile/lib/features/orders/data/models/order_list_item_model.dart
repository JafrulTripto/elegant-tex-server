import '../../../../core/utils/json_parse.dart';
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
        id: asInt(j['id']),
        orderId: asStr(j['orderId']),
        orderedBy: asStr(j['orderedBy']),
        createdBy: asStr(j['createdBy']),
        status: asInt(j['status'], 1),
        totalAmount: asDouble(j['totalAmount']),
        createdAt: asDate(j['createdAt']),
        deliveryDate: asDate(j['deliveryDate']),
        itemsCount: asInt(j['itemsCount']),
      );
}
