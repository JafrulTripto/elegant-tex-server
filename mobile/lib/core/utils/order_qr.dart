/// The Order QR scheme (ADR 0005): `eleganttex://order/{id}`. Parsing only accepts
/// this namespace so the scanner ignores unrelated QR codes on the shop floor.
const String orderQrScheme = 'eleganttex';

/// Extracts the order id from a scanned QR payload, or null if it isn't an Order QR.
int? parseOrderQr(String raw) {
  final uri = Uri.tryParse(raw.trim());
  if (uri == null || uri.scheme != orderQrScheme) return null;
  final seg = uri.pathSegments.isNotEmpty ? uri.pathSegments.last : uri.host;
  return int.tryParse(seg);
}

/// Parses a manually-typed order number — the plain database id shown on the
/// invoice/label (e.g. "123" or "#123").
int? parseManualOrderId(String raw) =>
    int.tryParse(raw.trim().replaceAll('#', ''));
