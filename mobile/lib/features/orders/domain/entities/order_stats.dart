import 'package:equatable/equatable.dart';

/// Actionable triage counts shown on the Orders header, mirroring the web KPIs.
/// `overdue`/`dueToday` are open orders (committed, non-terminal) keyed off the
/// delivery date; `inProduction` is APPROVED+PRODUCTION+QA; `readyToDeliver` is
/// READY. See docs/orders-triage-stats-plan.md.
class OrderStats extends Equatable {
  const OrderStats({
    this.total = 0,
    this.overdue = 0,
    this.dueToday = 0,
    this.inProduction = 0,
    this.readyToDeliver = 0,
  });

  final int total;
  final int overdue;
  final int dueToday;
  final int inProduction;
  final int readyToDeliver;

  @override
  List<Object?> get props => [total, overdue, dueToday, inProduction, readyToDeliver];
}
