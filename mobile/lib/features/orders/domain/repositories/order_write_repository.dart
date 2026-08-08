import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';

abstract interface class OrderWriteRepository {
  Future<Either<Failure, Map<String, dynamic>>> getOrderRaw(int id);
  Future<Either<Failure, List<dynamic>>> uploadImages(List<String> paths);
  Future<Either<Failure, Unit>> create(Map<String, dynamic> data);
  Future<Either<Failure, Unit>> update(int id, Map<String, dynamic> data);
}
