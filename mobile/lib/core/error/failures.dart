import 'package:equatable/equatable.dart';

/// Domain-level failures surfaced to the presentation layer.
sealed class Failure extends Equatable {
  const Failure(this.message);
  final String message;

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure(super.message, {this.statusCode});
  final int? statusCode;

  @override
  List<Object?> get props => [message, statusCode];
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'You appear to be offline.']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Your session has expired.']);
}

class PermissionFailure extends Failure {
  const PermissionFailure([super.message = "You don't have permission to do that."]);
}
