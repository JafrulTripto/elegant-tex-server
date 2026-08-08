import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/error/failures.dart';
import '../../domain/entities/order_detail.dart';
import '../../domain/repositories/order_detail_repository.dart';

enum DetailStatus { loading, loaded, error }

class OrderDetailState extends Equatable {
  const OrderDetailState({
    this.status = DetailStatus.loading,
    this.order,
    this.error,
    this.updating = false,
  });

  final DetailStatus status;
  final OrderDetail? order;
  final String? error;
  final bool updating;

  OrderDetailState copyWith({
    DetailStatus? status,
    OrderDetail? order,
    String? error,
    bool? updating,
  }) =>
      OrderDetailState(
        status: status ?? this.status,
        order: order ?? this.order,
        error: error ?? this.error,
        updating: updating ?? this.updating,
      );

  @override
  List<Object?> get props => [status, order, error, updating];
}

class OrderDetailCubit extends Cubit<OrderDetailState> {
  OrderDetailCubit(this._repo, this.orderId) : super(const OrderDetailState());

  final OrderDetailRepository _repo;
  final int orderId;

  Future<void> load() async {
    emit(const OrderDetailState(status: DetailStatus.loading));
    final res = await _repo.getOrder(orderId);
    res.fold(
      (f) => emit(OrderDetailState(status: DetailStatus.error, error: f.message)),
      (order) => emit(OrderDetailState(status: DetailStatus.loaded, order: order)),
    );
  }

  /// Applies a status change; returns an error message, or null on success (after
  /// reloading the order so the stepper + history reflect it).
  Future<String?> changeStatus(int newStatus, String? comment) async {
    emit(state.copyWith(updating: true));
    final res = await _repo.updateStatus(orderId, newStatus, comment);
    Failure? failure;
    res.fold((f) => failure = f, (_) {});
    if (failure != null) {
      emit(state.copyWith(updating: false));
      return failure!.message;
    }
    await load();
    return null;
  }
}
