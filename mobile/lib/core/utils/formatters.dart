import 'package:intl/intl.dart';

/// Shared display formatting. Currency uses the Bengali taka sign — the app's
/// system fonts render it (unlike the PDF, which needs a bundled font).
String fmtBDT(num? amount) {
  final n = (amount ?? 0).round();
  return '৳${NumberFormat.decimalPattern('en_US').format(n)}';
}

String fmtDate(DateTime? date) =>
    date == null ? '—' : DateFormat('MMM d, y').format(date);

String fmtDateTime(DateTime? date) =>
    date == null ? '—' : DateFormat('MMM d, y · h:mm a').format(date);
