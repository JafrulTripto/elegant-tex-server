import 'package:dio/dio.dart';

import '../../domain/entities/customer_match.dart';
import '../../domain/entities/ref_item.dart';

class ReferenceRemoteDataSource {
  ReferenceRemoteDataSource(this._dio);
  final Dio _dio;

  Future<List<RefItem>> productTypes() => _refs('/settings/productTypes/index');
  Future<List<RefItem>> fabricTypes() => _refs('/settings/fabricTypes/index');
  Future<List<RefItem>> deliveryChannels() => _refs('/settings/deliveryChannels/index');
  Future<List<RefItem>> merchants() => _refs('/merchants/getMerchants');
  Future<List<RefItem>> marketplaces(int userId) =>
      _refs('/settings/marketplace/getUserMarketplaces', {'userID': userId});
  Future<List<RefItem>> divisions() => _refs('/getDivisions');
  Future<List<RefItem>> districts(int divisionId) =>
      _refs('/getDistrictsByDivision', {'divisionId': divisionId});
  Future<List<RefItem>> upazilas(int districtId) =>
      _refs('/getUpazilasByDistrict', {'districtId': districtId});

  Future<List<CustomerMatch>> searchCustomers(String phone) async {
    final res = await _dio.get('/customers/searchByPhone', queryParameters: {'phone': phone});
    return _listOf(res.data).map((e) => CustomerMatch.fromJson(_asMap(e))).toList();
  }

  Future<List<FabricColor>> fabrics(String search) async {
    final res = await _dio.get('/settings/fabrics/index',
        queryParameters: {if (search.isNotEmpty) 'search': search});
    return _listOf(res.data).map((e) => FabricColor.fromJson(_asMap(e))).toList();
  }

  Future<List<RefItem>> _refs(String path, [Map<String, dynamic>? query]) async {
    final res = await _dio.get(path, queryParameters: query);
    return _listOf(res.data).map((e) => RefItem.fromJson(_asMap(e))).toList();
  }

  // Endpoints variously return a bare array or a { data: [...] } envelope.
  List _listOf(dynamic body) {
    if (body is List) return body;
    if (body is Map && body['data'] is List) return body['data'] as List;
    return const [];
  }

  Map<String, dynamic> _asMap(dynamic e) =>
      e is Map<String, dynamic> ? e : <String, dynamic>{};
}
