import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';

class OrderWriteRemoteDataSource {
  OrderWriteRemoteDataSource(this._dio);
  final Dio _dio;

  /// Raw order JSON for pre-filling the edit form (needs the id fields).
  Future<Map<String, dynamic>> getOrderRaw(int id) async {
    final res = await _dio.get(ApiConstants.order(id));
    final body = res.data as Map<String, dynamic>;
    return (body['data'] ?? body) as Map<String, dynamic>;
  }

  /// Uploads picked images and returns the image records to attach to the order.
  Future<List<dynamic>> uploadImages(List<String> paths) async {
    final form = FormData();
    for (final path in paths) {
      form.files.add(MapEntry('images[]', await MultipartFile.fromFile(path)));
    }
    final res = await _dio.post(ApiConstants.uploadProductImage, data: form);
    final data = res.data;
    if (data is List) return data;
    if (data is Map && data['data'] is List) return data['data'] as List;
    return const [];
  }

  Future<void> create(Map<String, dynamic> data) =>
      _dio.post(ApiConstants.store, data: data);

  Future<void> update(int id, Map<String, dynamic> data) =>
      _dio.put(ApiConstants.update(id), data: data);
}
