import 'package:dartz/dartz.dart';

import '../../../../core/error/failures.dart';
import '../entities/user_session.dart';

abstract interface class AuthRepository {
  /// Logs in and returns the resolved session (token is stored internally).
  Future<Either<Failure, UserSession>> login(String email, String password);

  /// Resolves the current session from a stored token, or an AuthFailure.
  Future<Either<Failure, UserSession>> currentSession();

  Future<void> logout();
}
