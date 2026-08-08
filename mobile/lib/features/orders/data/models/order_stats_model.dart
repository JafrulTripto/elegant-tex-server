import '../../../../core/utils/json_parse.dart';
import '../../domain/entities/order_stats.dart';

class OrderStatsModel extends OrderStats {
  const OrderStatsModel({
    super.total,
    super.overdue,
    super.dueToday,
    super.inProduction,
    super.readyToDeliver,
  });

  factory OrderStatsModel.fromJson(Map<String, dynamic> j) => OrderStatsModel(
        total: asInt(j['total']),
        overdue: asInt(j['overdue']),
        dueToday: asInt(j['dueToday']),
        inProduction: asInt(j['inProduction']),
        readyToDeliver: asInt(j['readyToDeliver']),
      );
}
