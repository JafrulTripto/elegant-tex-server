import '../../domain/entities/order_detail.dart';

/// Parses the backend OrderResource. Product type/fabric come through as ids today
/// (ProductResource), so `_name` only yields a label when the field is an object —
/// otherwise the UI falls back to the description. Address is nested under customer.
class OrderDetailModel {
  static OrderDetail fromJson(Map<String, dynamic> j) {
    final customerJson = j['customer'] as Map<String, dynamic>?;
    final payment = (j['payment'] as Map<String, dynamic>?) ?? const {};

    return OrderDetail(
      id: (j['id'] as num).toInt(),
      orderId: j['orderId']?.toString() ?? '',
      orderType: (j['orderType'] as num?)?.toInt() ?? 1,
      status: (j['status'] as num?)?.toInt() ?? 1,
      orderableName: _name(j['orderable']) ?? '',
      merchantRef: j['merchantRef']?.toString(),
      createdAt: _date(j['createdAt']),
      deliveryDate: _date(j['deliveryDate']),
      deliveryChannel: _name(j['deliveryChannel']) ?? '—',
      subtotal: _toDouble(payment['amount']),
      deliveryCharge: _toDouble(payment['deliveryCharge']),
      total: _toDouble(payment['totalAmount']),
      products: (j['products'] as List? ?? const [])
          .map((p) => _product(p as Map<String, dynamic>))
          .toList(),
      customer: customerJson == null ? null : _customer(customerJson),
      timeline: (j['orderStatusChanges'] as List? ?? const [])
          .map((c) => _statusChange(c as Map<String, dynamic>))
          .toList(),
    );
  }

  static OrderProduct _product(Map<String, dynamic> p) => OrderProduct(
        productType: _name(p['productType']) ?? '',
        fabric: _name(p['fabrics']),
        fabricType: _name(p['fabricType']),
        description: p['description']?.toString(),
        price: _toDouble(p['price']),
        unit: (p['unit'] as num?)?.toInt() ?? 1,
        imageId: _name(p['fabrics']) == null ? null : (p['fabrics']?['image'] as num?)?.toInt(),
      );

  static OrderCustomer _customer(Map<String, dynamic> c) {
    final addr = c['address'] as Map<String, dynamic>?;
    final parts = [
      addr?['address'],
      _name(addr?['upazila']),
      _name(addr?['district']),
      _name(addr?['division']),
    ].whereType<String>().where((s) => s.isNotEmpty).toList();
    final phone = [addr?['phone'], c['altPhone']]
        .whereType<String>()
        .where((s) => s.isNotEmpty)
        .join(', ');
    return OrderCustomer(
      name: c['name']?.toString() ?? '',
      address: parts.join(', '),
      phone: phone,
    );
  }

  static OrderStatusChange _statusChange(Map<String, dynamic> c) {
    final user = c['user'] as Map<String, dynamic>?;
    final userName = user == null
        ? null
        : '${user['firstname'] ?? ''} ${user['lastname'] ?? ''}'.trim();
    return OrderStatusChange(
      status: (c['status'] as num?)?.toInt() ?? 0,
      comment: c['comment']?.toString(),
      createdAt: _date(c['created_at'] ?? c['createdAt']),
      userName: (userName?.isEmpty ?? true) ? null : userName,
    );
  }

  static String? _name(dynamic v) =>
      v is Map ? (v['name'] as String?) : null;

  static double _toDouble(dynamic v) =>
      v is num ? v.toDouble() : (double.tryParse(v?.toString() ?? '') ?? 0);

  static DateTime? _date(dynamic v) =>
      v == null ? null : DateTime.tryParse(v.toString());
}
