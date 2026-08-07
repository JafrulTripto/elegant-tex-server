import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/user_session.dart';
import '../../domain/repositories/auth_repository.dart';

enum AuthStatus { unknown, loading, authenticated, unauthenticated }

class AuthState extends Equatable {
  const AuthState({this.status = AuthStatus.unknown, this.session, this.error});

  final AuthStatus status;
  final UserSession? session;
  final String? error;

  AuthState copyWith({AuthStatus? status, UserSession? session, String? error}) {
    return AuthState(
      status: status ?? this.status,
      session: session ?? this.session,
      error: error,
    );
  }

  @override
  List<Object?> get props => [status, session, error];
}

class AuthCubit extends Cubit<AuthState> {
  AuthCubit(this._repository) : super(const AuthState());

  final AuthRepository _repository;

  /// Called on launch: resolve a stored session or fall back to login.
  Future<void> appStarted() async {
    emit(const AuthState(status: AuthStatus.loading));
    final result = await _repository.currentSession();
    result.fold(
      (_) => emit(const AuthState(status: AuthStatus.unauthenticated)),
      (session) => emit(AuthState(status: AuthStatus.authenticated, session: session)),
    );
  }

  Future<void> login(String email, String password) async {
    emit(const AuthState(status: AuthStatus.loading));
    final result = await _repository.login(email, password);
    result.fold(
      (failure) => emit(AuthState(status: AuthStatus.unauthenticated, error: failure.message)),
      (session) => emit(AuthState(status: AuthStatus.authenticated, session: session)),
    );
  }

  /// Re-fetch permissions on resume so revocations take effect (ADR/Q6). Keeps the
  /// user signed in unless the token is now invalid.
  Future<void> refreshSession() async {
    final result = await _repository.currentSession();
    result.fold(
      (_) {},
      (session) => emit(AuthState(status: AuthStatus.authenticated, session: session)),
    );
  }

  Future<void> logout() async {
    await _repository.logout();
    emit(const AuthState(status: AuthStatus.unauthenticated));
  }

  void sessionExpired() {
    emit(const AuthState(
      status: AuthStatus.unauthenticated,
      error: 'Your session has expired. Please sign in again.',
    ));
  }
}
