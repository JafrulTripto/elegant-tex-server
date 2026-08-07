import '../../../../core/utils/json_parse.dart';
import '../../domain/entities/order_stats.dart';

class OrderStatsModel extends OrderStats {
  const OrderStatsModel({
    super.total,
    super.pending,
    super.processing,
    super.delivered,
  });

  factory OrderStatsModel.fromJson(Map<String, dynamic> j) => OrderStatsModel(
        total: asInt(j['total']),
        pending: asInt(j['pending']),
        processing: asInt(j['processing']),
        delivered: asInt(j['delivered']),
      );
}
