import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/order_detail.dart';

abstract interface class OrderDetailRepository {
  Future<Either<Failure, OrderDetail>> getOrder(int id);

  /// POST /orders/updateOrderStatus. The backend enforces the transition-scoped
  /// permission (ADR 0004); a 403 surfaces as a PermissionFailure.
  Future<Either<Failure, Unit>> updateStatus(int orderId, int newStatus, String? comment);
}
