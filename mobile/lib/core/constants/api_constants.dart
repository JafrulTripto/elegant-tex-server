/// API configuration. Base URL is provided at build time via
/// `--dart-define=API_BASE_URL=...` per flavor; the default targets the Android
/// emulator's host loopback for local dev.
class ApiConstants {
  ApiConstants._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api',
  );

  // Auth
  static const String login = '/auth/login';
  static const String me = '/auth/me';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // Orders
  static String marketplaceOrders(int userId) =>
      '/orders/getMarketplaceOrders/$userId';
  static const String merchantOrders = '/orders/getMerchantOrders';
  static String stats(int userId) => '/orders/getStats/$userId';
  static String order(int id) => '/orders/getOrder/$id';
  static const String updateStatus = '/orders/updateOrderStatus';
  static const String store = '/orders/store';
  static String update(int id) => '/orders/update/$id';
  static String delete(int id) => '/orders/delete/$id';
}
