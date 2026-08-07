import '../../domain/entities/user_session.dart';

/// Parses the `/auth/me` response: `{ user: {...}, permissions: [...], roles: [...] }`.
class UserSessionModel extends UserSession {
  const UserSessionModel({
    required super.userId,
    required super.name,
    required super.email,
    required super.permissions,
    required super.roles,
  });

  factory UserSessionModel.fromMe(Map<String, dynamic> json) {
    final user = (json['user'] as Map<String, dynamic>?) ?? const {};
    final name = (user['name'] as String?) ??
        '${user['firstname'] ?? ''} ${user['lastname'] ?? ''}'.trim();
    return UserSessionModel(
      userId: (user['id'] as num?)?.toInt() ?? 0,
      name: name.isEmpty ? (user['email'] as String? ?? 'User') : name,
      email: user['email'] as String? ?? '',
      permissions: _stringList(json['permissions']),
      roles: _stringList(json['roles']),
    );
  }

  static List<String> _stringList(dynamic raw) {
    if (raw is List) {
      return raw.map((e) => e is String ? e : e.toString()).toList();
    }
    return const [];
  }
}
