import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../domain/entities/order_detail.dart';
import '../models/order_detail_model.dart';

class OrderDetailRemoteDataSource {
  OrderDetailRemoteDataSource(this._dio);
  final Dio _dio;

  Future<OrderDetail> getOrder(int id) async {
    final res = await _dio.get(ApiConstants.order(id));
    final body = res.data as Map<String, dynamic>;
    final data = (body['data'] ?? body) as Map<String, dynamic>;
    return OrderDetailModel.fromJson(data);
  }

  Future<void> updateStatus(int orderId, int newStatus, String? comment) async {
    await _dio.post(
      ApiConstants.updateStatus,
      data: {
        'orderId': orderId,
        'newStatus': newStatus,
        'statusComment': comment,
      },
    );
  }
}
