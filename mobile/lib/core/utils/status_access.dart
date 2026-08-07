import '../constants/app_permissions.dart';
import '../constants/order_status.dart';

/// Transition-scoped status permissions (ADR 0004), mirroring the backend
/// StatusChangeAuthorizer: a user may move an order into a status if they hold the
/// umbrella CHANGE_STATUS, or that status's own permission. Takes the plain
/// permission list so it stays in core with no feature dependency.
bool canSetStatus(List<String> permissions, OrderStatus status) =>
    permissions.contains(AppPermissions.changeStatus) ||
    (status.requiredPermission != null &&
        permissions.contains(status.requiredPermission));

List<OrderStatus> settableStatuses(List<String> permissions) =>
    OrderStatus.values.where((s) => canSetStatus(permissions, s)).toList();

bool canChangeAnyStatus(List<String> permissions) =>
    settableStatuses(permissions).isNotEmpty;
