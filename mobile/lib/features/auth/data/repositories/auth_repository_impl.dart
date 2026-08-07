import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/storage/token_storage.dart';
import '../../domain/entities/user_session.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_data_source.dart';

class AuthRepositoryImpl implements AuthRepository {
  AuthRepositoryImpl(this._remote, this._storage);

  final AuthRemoteDataSource _remote;
  final TokenStorage _storage;

  @override
  Future<Either<Failure, UserSession>> login(String email, String password) async {
    try {
      final session = await _remote.login(email, password);
      return Right(session);
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, UserSession>> currentSession() async {
    final token = await _storage.read();
    if (token == null || token.isEmpty) {
      return const Left(AuthFailure('Not signed in.'));
    }
    try {
      final session = await _remote.me();
      return Right(session);
    } on DioException catch (e) {
      return Left(_mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<void> logout() => _remote.logout();

  Failure _mapDioError(DioException e) {
    final code = e.response?.statusCode;
    final serverMessage = e.response?.data is Map<String, dynamic>
        ? e.response?.data['message'] as String?
        : null;
    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.connectionTimeout ||
        e.type == DioExceptionType.receiveTimeout) {
      return const NetworkFailure();
    }
    if (code == 401) return AuthFailure(serverMessage ?? 'Invalid credentials.');
    if (code == 403) return PermissionFailure(serverMessage ?? 'Access denied.');
    return ServerFailure(serverMessage ?? 'Something went wrong.', statusCode: code);
  }
}
