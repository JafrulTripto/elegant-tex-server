import 'package:equatable/equatable.dart';

/// The signed-in user plus their effective permissions and roles. `has` is the
/// single client-side permission gate used across the app.
class UserSession extends Equatable {
  const UserSession({
    required this.userId,
    required this.name,
    required this.email,
    required this.permissions,
    required this.roles,
  });

  final int userId;
  final String name;
  final String email;
  final List<String> permissions;
  final List<String> roles;

  bool has(String permission) => permissions.contains(permission);

  bool hasAny(Iterable<String> perms) => perms.any(permissions.contains);

  @override
  List<Object?> get props => [userId, name, email, permissions, roles];
}
