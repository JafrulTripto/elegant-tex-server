/// Permission name constants — mirror the backend's seeded permissions. The app
/// hides actions the user's permission set lacks; the backend stays the source of
/// truth (ADR 0004 for the transition-scoped status permissions).
class AppPermissions {
  AppPermissions._();

  static const String viewOrders = 'VIEW_ORDERS';
  static const String viewMerchants = 'VIEW_MERCHANTS';
  static const String viewAllOrders = 'VIEW_ALL_ORDERS';
  static const String createMarketplaceOrder = 'CREATE_MARKETPLACE_ORDER';
  static const String createMerchantOrder = 'CREATE_MERCHANT_ORDER';
  static const String editOrder = 'EDIT_ORDER';
  static const String deleteOrder = 'DELETE_ORDER';
  static const String changeStatus = 'CHANGE_STATUS';
}
