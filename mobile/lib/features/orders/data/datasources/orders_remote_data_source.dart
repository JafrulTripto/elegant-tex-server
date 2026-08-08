import 'package:dio/dio.dart';
import 'package:intl/intl.dart';

import '../../../../core/constants/api_constants.dart';
import '../../domain/repositories/orders_repository.dart';
import '../models/order_list_item_model.dart';
import '../models/order_stats_model.dart';

class OrdersRemoteDataSource {
  OrdersRemoteDataSource(this._dio);
  final Dio _dio;

  Future<OrdersResult> getOrders(OrdersQuery q, int userId) async {
    final path = q.orderType == 'MARKETPLACE'
        ? ApiConstants.marketplaceOrders(userId)
        : ApiConstants.merchantOrders;

    final fmt = DateFormat('yyyy-MM-dd');
    final params = <String, dynamic>{'page': q.page};
    if (q.statuses.isNotEmpty) params['status'] = q.statuses.join(',');
    if (q.createdBy.trim().isNotEmpty) params['createdBy'] = q.createdBy.trim();

    final term = q.search.trim();
    if (term.isNotEmpty) {
      // Numeric → order id; otherwise search the party name (matches web).
      if (int.tryParse(term) != null) {
        params['id'] = term;
      } else {
        params['orderedBy'] = term;
      }
    }

    // Delivery-date range (matches web's delivery filter). Either bound optional.
    if (q.deliveryStart != null) params['startDate'] = fmt.format(q.deliveryStart!);
    if (q.deliveryEnd != null) params['endDate'] = fmt.format(q.deliveryEnd!);

    final res = await _dio.get(path, queryParameters: params);
    final body = res.data as Map<String, dynamic>;
    final list = (body['data'] as List? ?? const [])
        .map((e) => OrderListItemModel.fromJson(e as Map<String, dynamic>))
        .toList();
    final meta = body['meta'] as Map<String, dynamic>?;
    return OrdersResult(
      items: list,
      total: (meta?['total'] as num?)?.toInt() ?? list.length,
      page: (meta?['current_page'] as num?)?.toInt() ?? q.page,
    );
  }

  Future<OrderStatsModel> getStats(int userId, String orderType) async {
    // Scope to the active channel so the numbers match the list.
    final res = await _dio.get(
      ApiConstants.stats(userId),
      queryParameters: {'orderType': orderType},
    );
    return OrderStatsModel.fromJson(res.data as Map<String, dynamic>);
  }
}
