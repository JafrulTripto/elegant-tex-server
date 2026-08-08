import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../domain/repositories/order_write_repository.dart';
import '../datasources/order_write_remote_data_source.dart';

class OrderWriteRepositoryImpl implements OrderWriteRepository {
  OrderWriteRepositoryImpl(this._remote);
  final OrderWriteRemoteDataSource _remote;

  @override
  Future<Either<Failure, Map<String, dynamic>>> getOrderRaw(int id) =>
      _guard(() => _remote.getOrderRaw(id));

  @override
  Future<Either<Failure, List<dynamic>>> uploadImages(List<String> paths) =>
      _guard(() => _remote.uploadImages(paths));

  @override
  Future<Either<Failure, Unit>> create(Map<String, dynamic> data) =>
      _guard(() async {
        await _remote.create(data);
        return unit;
      });

  @override
  Future<Either<Failure, Unit>> update(int id, Map<String, dynamic> data) =>
      _guard(() async {
        await _remote.update(id, data);
        return unit;
      });

  Future<Either<Failure, T>> _guard<T>(Future<T> Function() run) async {
    try {
      return Right(await run());
    } on DioException catch (e) {
      return Left(mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
