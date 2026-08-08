import 'package:flutter/material.dart';

/// The order lifecycle, mirroring the backend `OrderStatus` enum and the web
/// `OrderStatusEnum`. `requiredPermission` is the transition-scoped permission to
/// move an order *into* this status (ADR 0004); null means only the umbrella
/// CHANGE_STATUS applies.
enum OrderStatus {
  draft(1, 'DRAFT', Color(0xFF757575), null),
  approved(2, 'APPROVED', Color(0xFF492E87), 'ORDER_APPROVE'),
  production(3, 'PRODUCTION', Color(0xFFB8860B), 'ORDER_IN_PRODUCTION'),
  qa(4, 'QA', Color(0xFFFFA500), 'ORDER_IN_QA'),
  ready(5, 'READY', Color(0xFF2196F3), 'ORDER_READY'),
  delivered(6, 'DELIVERED', Color(0xFF008000), 'ORDER_DELIVERED'),
  returned(7, 'RETURNED', Color(0xFFFF0000), 'ORDER_RETURNED'),
  cancelled(8, 'CANCELLED', Color(0xFF696969), 'ORDER_CANCELLED'),
  booking(9, 'BOOKING', Color(0xFF800080), 'ORDER_BOOKING');

  const OrderStatus(this.value, this.label, this.color, this.requiredPermission);

  final int value;
  final String label;
  final Color color;
  final String? requiredPermission;

  static OrderStatus? fromValue(int? value) {
    for (final s in OrderStatus.values) {
      if (s.value == value) return s;
    }
    return null;
  }

  /// The production main-flow span a scan may advance along (ADR 0005). Approval
  /// (DRAFT → APPROVED) is deliberately excluded; scans only advance APPROVED+.
  static const List<OrderStatus> mainFlow = [
    approved,
    production,
    qa,
    ready,
    delivered,
  ];

  /// The status a scan would advance this order into, or null if it is terminal
  /// or off the main flow.
  OrderStatus? get scanNext {
    final i = mainFlow.indexOf(this);
    if (i == -1 || i >= mainFlow.length - 1) return null;
    return mainFlow[i + 1];
  }
}
