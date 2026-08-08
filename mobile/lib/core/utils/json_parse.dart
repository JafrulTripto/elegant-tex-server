/// Tolerant JSON coercion. The Laravel API serializes decimal columns (and some
/// counts) as **strings** — e.g. total_amount "9000.00" — so plain `as num` casts
/// throw. Parse everything numeric through these.
int asInt(dynamic v, [int fallback = 0]) {
  if (v is int) return v;
  if (v is num) return v.toInt();
  return int.tryParse(v?.toString() ?? '') ?? fallback;
}

double asDouble(dynamic v, [double fallback = 0]) {
  if (v is num) return v.toDouble();
  return double.tryParse(v?.toString() ?? '') ?? fallback;
}

DateTime? asDate(dynamic v) =>
    (v == null) ? null : DateTime.tryParse(v.toString());

String asStr(dynamic v, [String fallback = '']) => v?.toString() ?? fallback;
