import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/utils/json_parse.dart';
import '../../domain/entities/customer_match.dart';
import '../../domain/entities/ref_item.dart';
import '../../domain/repositories/order_write_repository.dart';
import '../../domain/repositories/reference_repository.dart';

enum FormPhase { loading, ready, error }

class OrderFormState extends Equatable {
  const OrderFormState({
    this.phase = FormPhase.loading,
    this.error,
    this.refs,
    this.prefill,
    this.districts = const [],
    this.upazilas = const [],
    this.submitting = false,
  });

  final FormPhase phase;
  final String? error;
  final FormRefs? refs;
  final Map<String, dynamic>? prefill;
  final List<RefItem> districts;
  final List<RefItem> upazilas;
  final bool submitting;

  OrderFormState copyWith({
    FormPhase? phase,
    String? error,
    FormRefs? refs,
    Map<String, dynamic>? prefill,
    List<RefItem>? districts,
    List<RefItem>? upazilas,
    bool? submitting,
  }) =>
      OrderFormState(
        phase: phase ?? this.phase,
        error: error,
        refs: refs ?? this.refs,
        prefill: prefill ?? this.prefill,
        districts: districts ?? this.districts,
        upazilas: upazilas ?? this.upazilas,
        submitting: submitting ?? this.submitting,
      );

  @override
  List<Object?> get props => [phase, error, refs, prefill, districts, upazilas, submitting];
}

class OrderFormCubit extends Cubit<OrderFormState> {
  OrderFormCubit(this._refRepo, this._writeRepo) : super(const OrderFormState());

  final ReferenceRepository _refRepo;
  final OrderWriteRepository _writeRepo;

  late int userId;
  late int orderType;
  int? editId;

  Future<void> init({required int orderType, required int userId, int? editId}) async {
    this.orderType = orderType;
    this.userId = userId;
    this.editId = editId;
    emit(const OrderFormState(phase: FormPhase.loading));

    Map<String, dynamic>? prefill;
    if (editId != null) {
      final res = await _writeRepo.getOrderRaw(editId);
      final left = res.fold<String?>((f) => f.message, (_) => null);
      if (left != null) {
        emit(OrderFormState(phase: FormPhase.error, error: left));
        return;
      }
      prefill = res.getOrElse(() => {});
      this.orderType = asInt(prefill['orderType'], orderType);
    }

    final refsRes = await _refRepo.loadFormRefs(orderType: this.orderType, userId: userId);
    refsRes.fold(
      (f) => emit(OrderFormState(phase: FormPhase.error, error: f.message)),
      (refs) {
        emit(OrderFormState(phase: FormPhase.ready, refs: refs, prefill: prefill));
        // Pre-load the geo cascade for an edited marketplace order.
        final divId = _nestedId(prefill, ['customer', 'address', 'division']);
        final distId = _nestedId(prefill, ['customer', 'address', 'district']);
        if (divId != null) loadDistricts(divId);
        if (distId != null) loadUpazilas(distId);
      },
    );
  }

  Future<void> loadDistricts(int divisionId) async {
    final res = await _refRepo.districts(divisionId);
    res.fold((_) {}, (d) => emit(state.copyWith(districts: d, upazilas: const [])));
  }

  Future<void> loadUpazilas(int districtId) async {
    final res = await _refRepo.upazilas(districtId);
    res.fold((_) {}, (u) => emit(state.copyWith(upazilas: u)));
  }

  Future<List<FabricColor>> searchFabrics(String query) async {
    final res = await _refRepo.fabrics(query);
    return res.fold((_) => const <FabricColor>[], (list) => list);
  }

  Future<List<CustomerMatch>> searchCustomers(String phone) async {
    final res = await _refRepo.searchCustomers(phone);
    return res.fold((_) => const <CustomerMatch>[], (list) => list);
  }

  /// Uploads any new images, merges with existing (edit), submits, and returns an
  /// error message or null on success.
  Future<String?> submit({
    required Map<String, dynamic> fields,
    required List<dynamic> existingImages,
    required List<String> newImagePaths,
    required int createdBy,
  }) async {
    emit(state.copyWith(submitting: true));
    var images = [...existingImages];
    if (newImagePaths.isNotEmpty) {
      final up = await _writeRepo.uploadImages(newImagePaths);
      final err = up.fold<String?>((f) => f.message, (imgs) {
        images = [...images, ...imgs];
        return null;
      });
      if (err != null) {
        emit(state.copyWith(submitting: false));
        return err;
      }
    }

    final data = {
      ...fields,
      'images': images,
      'createdBy': createdBy,
      'orderType': orderType,
    };
    final res = editId == null
        ? await _writeRepo.create(data)
        : await _writeRepo.update(editId!, data);
    final err = res.fold<String?>((f) => f.message, (_) => null);
    emit(state.copyWith(submitting: false));
    return err;
  }

  int? _nestedId(Map<String, dynamic>? root, List<String> path) {
    dynamic cur = root;
    for (final key in path) {
      if (cur is Map && cur[key] != null) {
        cur = cur[key];
      } else {
        return null;
      }
    }
    if (cur is Map) return asInt(cur['value'] ?? cur['id'], -1) < 0 ? null : asInt(cur['value'] ?? cur['id']);
    return asInt(cur, -1) < 0 ? null : asInt(cur);
  }
}
