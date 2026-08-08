import '../../../../core/utils/json_parse.dart';

/// A customer returned by /customers/searchByPhone — used to auto-fill the order
/// form (matching the web's phone-search behaviour). Geo comes as {value} objects.
class CustomerMatch {
  const CustomerMatch({
    required this.id,
    required this.name,
    required this.phone,
    this.facebook,
    this.altPhone,
    this.address,
    this.divisionId,
    this.districtId,
    this.upazilaId,
  });

  final int id;
  final String name;
  final String phone;
  final String? facebook;
  final String? altPhone;
  final String? address;
  final int? divisionId;
  final int? districtId;
  final int? upazilaId;

  factory CustomerMatch.fromJson(Map<String, dynamic> j) => CustomerMatch(
        id: asInt(j['id']),
        name: asStr(j['name']),
        phone: asStr(j['phone']),
        facebook: j['facebook']?.toString(),
        altPhone: j['altPhone']?.toString(),
        address: j['address']?.toString(),
        divisionId: _nid(j['division']),
        districtId: _nid(j['district']),
        upazilaId: _nid(j['upazila']),
      );

  static int? _nid(dynamic v) {
    final raw = v is Map ? (v['value'] ?? v['id']) : v;
    if (raw == null) return null;
    final n = asInt(raw, -1);
    return n < 0 ? null : n;
  }
}
