import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/order_list_item.dart';
import '../entities/order_stats.dart';

/// A page of orders plus the total count for pagination.
class OrdersResult {
  const OrdersResult({required this.items, required this.total, required this.page});
  final List<OrderListItem> items;
  final int total;
  final int page;
}

/// Filters for a list query, mirroring the web filter set: multi-select status,
/// a delivery-date range, a "Submitted By" text filter, and a search (order id
/// or party name).
class OrdersQuery {
  const OrdersQuery({
    required this.orderType,
    this.page = 1,
    this.search = '',
    this.statuses = const [],
    this.deliveryStart,
    this.deliveryEnd,
    this.createdBy = '',
  });

  final String orderType; // 'MARKETPLACE' | 'MERCHANT'
  final int page;
  final String search;
  final List<int> statuses;
  final DateTime? deliveryStart;
  final DateTime? deliveryEnd;
  final String createdBy;
}

abstract interface class OrdersRepository {
  Future<Either<Failure, OrdersResult>> getOrders(OrdersQuery query, int userId);
  Future<Either<Failure, OrderStats>> getStats(int userId, String orderType);
}
