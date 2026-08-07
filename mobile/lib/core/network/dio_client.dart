import 'package:dio/dio.dart';

import '../constants/api_constants.dart';
import '../storage/token_storage.dart';

/// A configured Dio: attaches the bearer token, and on a 401 tries a single
/// token refresh + retry before giving up and signalling session expiry.
class DioClient {
  DioClient(this._storage) {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 15),
        receiveTimeout: const Duration(seconds: 20),
        headers: {'Accept': 'application/json'},
      ),
    );
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _storage.read();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
        onError: (err, handler) async {
          final isAuthCall = err.requestOptions.path.contains('/auth/');
          if (err.response?.statusCode == 401 && !isAuthCall && !_refreshing) {
            final newToken = await _tryRefresh();
            if (newToken != null) {
              err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
              try {
                final retried = await dio.fetch(err.requestOptions);
                return handler.resolve(retried);
              } catch (_) {
                // fall through to the error path
              }
            } else {
              await _storage.clear();
              onSessionExpired?.call();
            }
          }
          handler.next(err);
        },
      ),
    );
  }

  late final Dio dio;
  final TokenStorage _storage;

  /// Set by the auth layer so a failed refresh can bounce the user to login.
  void Function()? onSessionExpired;

  bool _refreshing = false;

  Future<String?> _tryRefresh() async {
    _refreshing = true;
    try {
      final token = await _storage.read();
      if (token == null) return null;
      final bare = Dio(
        BaseOptions(
          baseUrl: ApiConstants.baseUrl,
          headers: {'Accept': 'application/json', 'Authorization': 'Bearer $token'},
        ),
      );
      final res = await bare.post(ApiConstants.refresh);
      final newToken = res.data['access_token'] as String?;
      if (newToken != null && newToken.isNotEmpty) {
        await _storage.write(newToken);
        return newToken;
      }
      return null;
    } catch (_) {
      return null;
    } finally {
      _refreshing = false;
    }
  }
}
