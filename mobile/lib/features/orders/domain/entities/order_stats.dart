import 'package:equatable/equatable.dart';

class OrderStats extends Equatable {
  const OrderStats({
    this.total = 0,
    this.pending = 0,
    this.processing = 0,
    this.delivered = 0,
  });

  final int total;
  final int pending;
  final int processing;
  final int delivered;

  @override
  List<Object?> get props => [total, pending, processing, delivered];
}
