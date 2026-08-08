import '../../../../core/utils/json_parse.dart';
import '../../domain/entities/order_detail.dart';

/// Parses the backend OrderResource. Numeric fields go through the tolerant
/// helpers because the API serializes decimals (and some ids) as strings. Product
/// type/fabric come through as ids today, so `_name` only yields a label when the
/// field is an object — otherwise the UI falls back to the description.
class OrderDetailModel {
  static OrderDetail fromJson(Map<String, dynamic> j) {
    final customerJson = j['customer'] as Map<String, dynamic>?;
    final payment = (j['payment'] as Map<String, dynamic>?) ?? const {};

    return OrderDetail(
      id: asInt(j['id']),
      orderId: asStr(j['orderId']),
      orderType: asInt(j['orderType'], 1),
      status: asInt(j['status'], 1),
      orderableName: _name(j['orderable']) ?? '',
      merchantRef: j['merchantRef']?.toString(),
      createdAt: asDate(j['createdAt']),
      deliveryDate: asDate(j['deliveryDate']),
      deliveryChannel: _name(j['deliveryChannel']) ?? '—',
      subtotal: asDouble(payment['amount']),
      deliveryCharge: asDouble(payment['deliveryCharge']),
      total: asDouble(payment['totalAmount']),
      products: (j['products'] as List? ?? const [])
          .map((p) => _product(p as Map<String, dynamic>))
          .toList(),
      customer: customerJson == null ? null : _customer(customerJson),
      timeline: (j['orderStatusChanges'] as List? ?? const [])
          .map((c) => _statusChange(c as Map<String, dynamic>))
          .toList(),
      imageIds: (j['images'] as List? ?? const [])
          .map((img) => img is Map ? asInt(img['id'], -1) : asInt(img, -1))
          .where((id) => id > 0)
          .toList(),
    );
  }

  static OrderProduct _product(Map<String, dynamic> p) => OrderProduct(
        productType: _name(p['productType']) ?? '',
        fabric: _name(p['fabrics']),
        fabricType: _name(p['fabricType']),
        description: p['description']?.toString(),
        price: asDouble(p['price']),
        unit: asInt(p['unit'], 1),
        imageId: null, // product image not exposed by ProductResource
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
      name: asStr(c['name']),
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
      status: asInt(c['status']),
      comment: c['comment']?.toString(),
      createdAt: asDate(c['created_at'] ?? c['createdAt']),
      userName: (userName?.isEmpty ?? true) ? null : userName,
    );
  }

  static String? _name(dynamic v) => v is Map ? (v['name'] as String?) : null;
}
