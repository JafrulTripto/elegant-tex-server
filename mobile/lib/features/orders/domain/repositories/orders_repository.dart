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

/// Filters for a list query. `dateFilter` is 'all' | '7' | '30' (order-date preset).
class OrdersQuery {
  const OrdersQuery({
    required this.orderType,
    this.page = 1,
    this.search = '',
    this.status,
    this.dateFilter = 'all',
  });

  final String orderType; // 'MARKETPLACE' | 'MERCHANT'
  final int page;
  final String search;
  final int? status;
  final String dateFilter;
}

abstract interface class OrdersRepository {
  Future<Either<Failure, OrdersResult>> getOrders(OrdersQuery query, int userId);
  Future<Either<Failure, OrderStats>> getStats(int userId);
}
