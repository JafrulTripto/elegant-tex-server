import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Persists the JWT in the platform keychain/keystore. One user per device
/// (v1 decision), so a single token slot.
class TokenStorage {
  TokenStorage(this._storage);

  final FlutterSecureStorage _storage;
  static const _tokenKey = 'access_token';

  Future<String?> read() => _storage.read(key: _tokenKey);

  Future<void> write(String token) => _storage.write(key: _tokenKey, value: token);

  Future<void> clear() => _storage.delete(key: _tokenKey);
}
