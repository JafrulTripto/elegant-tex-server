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

    final params = <String, dynamic>{'page': q.page};
    if (q.status != null) params['status'] = q.status.toString();

    final term = q.search.trim();
    if (term.isNotEmpty) {
      // Numeric → order id; otherwise search the party name (matches web).
      if (int.tryParse(term) != null) {
        params['id'] = term;
      } else {
        params['orderedBy'] = term;
      }
    }

    if (q.dateFilter != 'all') {
      final days = int.tryParse(q.dateFilter) ?? 0;
      final fmt = DateFormat('yyyy-MM-dd');
      params['orderDateStart'] =
          fmt.format(DateTime.now().subtract(Duration(days: days)));
      params['orderDateEnd'] = fmt.format(DateTime.now());
    }

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

  Future<OrderStatsModel> getStats(int userId) async {
    final res = await _dio.get(ApiConstants.stats(userId));
    return OrderStatsModel.fromJson(res.data as Map<String, dynamic>);
  }
}
