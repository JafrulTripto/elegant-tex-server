import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/order_status.dart';
import '../../../../core/error/failures.dart';
import '../../../../core/utils/order_qr.dart';
import '../../../../core/utils/status_access.dart';
import '../../../orders/domain/entities/order_detail.dart';
import '../../../orders/domain/repositories/order_detail_repository.dart';

enum ScanPhase { scanning, validating, confirm, updating, success, error }

class ScanState extends Equatable {
  const ScanState({
    this.phase = ScanPhase.scanning,
    this.order,
    this.from,
    this.next,
    this.appliedTo,
    this.canApplyNext = false,
    this.error,
    this.notFound = false,
  });

  final ScanPhase phase;
  final OrderDetail? order;
  final OrderStatus? from;
  final OrderStatus? next; // suggested next (confirm phase)
  final OrderStatus? appliedTo; // applied (success phase)
  final bool canApplyNext;
  final String? error;
  final bool notFound;

  @override
  List<Object?> get props => [phase, order, from, next, appliedTo, canApplyNext, error, notFound];
}

/// Drives the scan → resolve → confirm → advance flow (ADR 0005). Reuses the order
/// detail repository for both the lookup and the status change.
class ScanCubit extends Cubit<ScanState> {
  ScanCubit(this._repo) : super(const ScanState());

  final OrderDetailRepository _repo;
  List<String> permissions = const [];
  bool _busy = false;

  void init(List<String> perms) => permissions = perms;

  /// From the camera. Ignores anything that isn't an Order QR.
  Future<void> onScanned(String raw) async {
    if (_busy || state.phase != ScanPhase.scanning) return;
    final id = parseOrderQr(raw);
    if (id == null) return;
    _busy = true;
    await _resolve(id);
    _busy = false;
  }

  Future<void> submitManual(String text) async {
    final id = parseManualOrderId(text);
    if (id == null) {
      emit(const ScanState(phase: ScanPhase.error, error: 'Enter a valid order number.'));
      return;
    }
    await _resolve(id);
  }

  Future<void> _resolve(int id) async {
    emit(const ScanState(phase: ScanPhase.validating));
    final res = await _repo.getOrder(id);
    res.fold(
      (f) => emit(ScanState(
        phase: ScanPhase.error,
        error: f.message,
        notFound: f is ServerFailure && f.statusCode == 404,
      )),
      (order) {
        final from = OrderStatus.fromValue(order.status);
        final next = from?.scanNext; // production span, APPROVED+; null otherwise
        emit(ScanState(
          phase: ScanPhase.confirm,
          order: order,
          from: from,
          next: next,
          canApplyNext: next != null && canSetStatus(permissions, next),
        ));
      },
    );
  }

  /// Confirms the one-step advance shown on the confirm card.
  Future<void> confirmAdvance() async {
    final order = state.order;
    final next = state.next;
    if (order == null || next == null) return;
    emit(ScanState(
      phase: ScanPhase.updating,
      order: order,
      from: state.from,
      next: next,
      canApplyNext: state.canApplyNext,
    ));
    final res = await _repo.updateStatus(order.id, next.value, null);
    Failure? failure;
    res.fold((f) => failure = f, (_) {});
    if (failure != null) {
      emit(ScanState(phase: ScanPhase.error, error: failure!.message));
      return;
    }
    emit(ScanState(phase: ScanPhase.success, order: order, from: state.from, appliedTo: next));
  }

  /// Applies a manually-picked status from the confirm card. Returns an error
  /// message, or null on success (and moves to the success phase).
  Future<String?> applyManual(int newStatus, String? comment) async {
    final order = state.order;
    if (order == null) return 'No order selected.';
    final res = await _repo.updateStatus(order.id, newStatus, comment);
    Failure? failure;
    res.fold((f) => failure = f, (_) {});
    if (failure != null) return failure!.message;
    emit(ScanState(
      phase: ScanPhase.success,
      order: order,
      from: state.from,
      appliedTo: OrderStatus.fromValue(newStatus),
    ));
    return null;
  }

  void reset() {
    _busy = false;
    emit(const ScanState(phase: ScanPhase.scanning));
  }
}
