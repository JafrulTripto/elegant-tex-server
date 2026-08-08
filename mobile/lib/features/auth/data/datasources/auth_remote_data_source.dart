import 'package:dio/dio.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/storage/token_storage.dart';
import '../models/user_session_model.dart';

class AuthRemoteDataSource {
  AuthRemoteDataSource(this._dio, this._storage);

  final Dio _dio;
  final TokenStorage _storage;

  /// POST /auth/login, store the token, then resolve the session via /auth/me.
  Future<UserSessionModel> login(String email, String password) async {
    final res = await _dio.post(
      ApiConstants.login,
      data: {'email': email, 'password': password},
    );
    final token = res.data['access_token'] as String?;
    if (token == null || token.isEmpty) {
      throw DioException(
        requestOptions: res.requestOptions,
        response: res,
        message: 'Login did not return a token.',
      );
    }
    await _storage.write(token);
    return me();
  }

  /// POST /auth/me — the session/permissions for the stored token.
  Future<UserSessionModel> me() async {
    final res = await _dio.post(ApiConstants.me);
    return UserSessionModel.fromMe(res.data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
    } catch (_) {
      // Best-effort; the local token is cleared regardless.
    }
    await _storage.clear();
  }
}
