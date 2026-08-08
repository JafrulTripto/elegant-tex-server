import 'package:dio/dio.dart';

import '../error/failures.dart';

/// Maps a DioException to a domain [Failure], preferring the API's `message`.
Failure mapDioError(DioException e) {
  final code = e.response?.statusCode;
  final data = e.response?.data;
  final serverMessage = data is Map<String, dynamic> ? data['message'] as String? : null;

  if (e.type == DioExceptionType.connectionError ||
      e.type == DioExceptionType.connectionTimeout ||
      e.type == DioExceptionType.receiveTimeout ||
      e.type == DioExceptionType.sendTimeout) {
    return const NetworkFailure();
  }
  if (code == 401) return AuthFailure(serverMessage ?? 'Your session has expired.');
  if (code == 403) return PermissionFailure(serverMessage ?? "You don't have permission to do that.");
  return ServerFailure(serverMessage ?? 'Something went wrong.', statusCode: code);
}
