import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/network/dio_error_mapper.dart';
import '../../domain/entities/customer_match.dart';
import '../../domain/entities/ref_item.dart';
import '../../domain/repositories/reference_repository.dart';
import '../datasources/reference_remote_data_source.dart';

class ReferenceRepositoryImpl implements ReferenceRepository {
  ReferenceRepositoryImpl(this._remote);
  final ReferenceRemoteDataSource _remote;

  static const int _marketplace = 1;

  @override
  Future<Either<Failure, FormRefs>> loadFormRefs({
    required int orderType,
    required int userId,
  }) async {
    try {
      final results = await Future.wait([
        _remote.productTypes(),
        _remote.fabricTypes(),
        _remote.deliveryChannels(),
        _remote.divisions(),
        orderType == _marketplace ? _remote.marketplaces(userId) : _remote.merchants(),
      ]);
      return Right(FormRefs(
        productTypes: results[0],
        fabricTypes: results[1],
        deliveryChannels: results[2],
        divisions: results[3],
        parties: results[4],
      ));
    } on DioException catch (e) {
      return Left(mapDioError(e));
    } catch (e) {
      return Left(ServerFailure(e.toString()));
    }
  }

  @override
  Future<Either<Failure, List<RefItem>>> districts(int divisionId) =>
      _guard(() => _remote.districts(divisionId));

  @override
  Future<Either<Failure, List<RefItem>>> upazilas(int districtId) =>
      _guard(() => _remote.upazilas(districtId));

  @override
  Future<Either<Failure, List<FabricColor>>> fabrics(String search) =>
      _guard(() => _remote.fabrics(search));

  @override
  Future<Either<Failure, List<CustomerMatch>>> searchCustomers(String phone) =>
      _guard(() => _remote.searchCustomers(phone));

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
