import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../domain/entities/order_detail.dart';
import '../../domain/repositories/order_detail_repository.dart';
import '../datasources/order_detail_remote_data_source.dart';

class OrderDetailRepositoryImpl implements OrderDetailRepository {
  OrderDetailRepositoryImpl(this._remote);
  final OrderDetailRemoteDataSource _remote;

  @override
  Future<Either<Failure, OrderDetail>> getOrder(int id) async {
    try {
      return Right(await _remote.getOrder(id));
    } on DioException catch (e) {
      return Left(mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, Unit>> updateStatus(int orderId, int newStatus, String? comment) async {
    try {
      await _remote.updateStatus(orderId, newStatus, comment);
      return const Right(unit);
    } on DioException catch (e) {
      return Left(mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }
}
