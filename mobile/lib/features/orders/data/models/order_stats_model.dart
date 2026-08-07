import '../../domain/entities/order_stats.dart';

class OrderStatsModel extends OrderStats {
  const OrderStatsModel({
    super.total,
    super.pending,
    super.processing,
    super.delivered,
  });

  factory OrderStatsModel.fromJson(Map<String, dynamic> j) => OrderStatsModel(
        total: (j['total'] as num?)?.toInt() ?? 0,
        pending: (j['pending'] as num?)?.toInt() ?? 0,
        processing: (j['processing'] as num?)?.toInt() ?? 0,
        delivered: (j['delivered'] as num?)?.toInt() ?? 0,
      );
}
