import 'dart:async';

import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../domain/entities/order_list_item.dart';
import '../../domain/entities/order_stats.dart';
import '../../domain/repositories/orders_repository.dart';

enum OrdersStatus { initial, loading, loaded, error }

class OrdersState extends Equatable {
  const OrdersState({
    this.status = OrdersStatus.initial,
    this.orders = const [],
    this.stats = const OrderStats(),
    this.orderType = 'MARKETPLACE',
    this.search = '',
    this.statuses = const [],
    this.deliveryStart,
    this.deliveryEnd,
    this.createdBy = '',
    this.activeBucket,
    this.page = 1,
    this.total = 0,
    this.loadingMore = false,
    this.error,
  });

  final OrdersStatus status;
  final List<OrderListItem> orders;
  final OrderStats stats;
  final String orderType;
  final String search;
  final List<int> statuses; // multi-select status filter (matches web)
  final DateTime? deliveryStart; // delivery-date range (inclusive)
  final DateTime? deliveryEnd;
  final String createdBy; // "Submitted By" text filter
  final String? activeBucket; // which KPI pill is applied, for highlight/toggle
  final int page;
  final int total;
  final bool loadingMore;
  final String? error;

  bool get hasMore => orders.length < total;
  bool get hasActiveFilters =>
      search.isNotEmpty ||
      statuses.isNotEmpty ||
      deliveryStart != null ||
      deliveryEnd != null ||
      createdBy.isNotEmpty;

  OrdersState copyWith({
    OrdersStatus? status,
    List<OrderListItem>? orders,
    OrderStats? stats,
    String? orderType,
    String? search,
    List<int>? statuses,
    DateTime? deliveryStart,
    DateTime? deliveryEnd,
    bool clearDelivery = false,
    String? createdBy,
    String? activeBucket,
    bool clearActiveBucket = false,
    int? page,
    int? total,
    bool? loadingMore,
    String? error,
  }) {
    return OrdersState(
      status: status ?? this.status,
      orders: orders ?? this.orders,
      stats: stats ?? this.stats,
      orderType: orderType ?? this.orderType,
      search: search ?? this.search,
      statuses: statuses ?? this.statuses,
      deliveryStart: clearDelivery ? null : (deliveryStart ?? this.deliveryStart),
      deliveryEnd: clearDelivery ? null : (deliveryEnd ?? this.deliveryEnd),
      createdBy: createdBy ?? this.createdBy,
      activeBucket: clearActiveBucket ? null : (activeBucket ?? this.activeBucket),
      page: page ?? this.page,
      total: total ?? this.total,
      loadingMore: loadingMore ?? this.loadingMore,
      error: error,
    );
  }

  @override
  List<Object?> get props => [
        status,
        orders,
        stats,
        orderType,
        search,
        statuses,
        deliveryStart,
        deliveryEnd,
        createdBy,
        activeBucket,
        page,
        total,
        loadingMore,
        error,
      ];
}

class OrdersCubit extends Cubit<OrdersState> {
  OrdersCubit(this._repo) : super(const OrdersState());

  final OrdersRepository _repo;
  int _userId = 0;
  bool canViewMerchants = false;
  Timer? _debounce;

  void init({required int userId, required bool canViewMerchants}) {
    _userId = userId;
    this.canViewMerchants = canViewMerchants;
    load();
    _loadStats();
  }

  OrdersQuery _query(int page) => OrdersQuery(
        orderType: state.orderType,
        page: page,
        search: state.search,
        statuses: state.statuses,
        deliveryStart: state.deliveryStart,
        deliveryEnd: state.deliveryEnd,
        createdBy: state.createdBy,
      );

  Future<void> load() async {
    emit(state.copyWith(status: OrdersStatus.loading));
    final res = await _repo.getOrders(_query(1), _userId);
    res.fold(
      (f) => emit(state.copyWith(status: OrdersStatus.error, error: f.message)),
      (r) => emit(state.copyWith(
        status: OrdersStatus.loaded,
        orders: r.items,
        total: r.total,
        page: r.page,
      )),
    );
  }

  Future<void> refresh() async {
    await load();
    await _loadStats();
  }

  Future<void> loadMore() async {
    if (state.loadingMore || !state.hasMore || state.status != OrdersStatus.loaded) {
      return;
    }
    emit(state.copyWith(loadingMore: true));
    final res = await _repo.getOrders(_query(state.page + 1), _userId);
    res.fold(
      (_) => emit(state.copyWith(loadingMore: false)),
      (r) => emit(state.copyWith(
        loadingMore: false,
        orders: [...state.orders, ...r.items],
        total: r.total,
        page: r.page,
      )),
    );
  }

  Future<void> _loadStats() async {
    final res = await _repo.getStats(_userId, state.orderType);
    res.fold((_) {}, (s) => emit(state.copyWith(stats: s)));
  }

  void setOrderType(String type) {
    if (type == state.orderType) return;
    emit(state.copyWith(orderType: type));
    load();
    _loadStats(); // stats are channel-scoped, so refresh them too
  }

  void onSearchChanged(String text) {
    // A manual search overrides any active KPI bucket.
    emit(state.copyWith(search: text, clearActiveBucket: true));
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), load);
  }

  /// Applies the filter-sheet selection in one shot (matches web semantics).
  void applyFilters({
    required List<int> statuses,
    DateTime? deliveryStart,
    DateTime? deliveryEnd,
    required String createdBy,
  }) {
    emit(state.copyWith(
      statuses: statuses,
      deliveryStart: deliveryStart,
      deliveryEnd: deliveryEnd,
      clearDelivery: deliveryStart == null && deliveryEnd == null,
      createdBy: createdBy,
      clearActiveBucket: true,
    ));
    load();
  }

  /// A KPI pill → the same status/delivery predicate the card counts.
  void applyBucket(
    String key, {
    required List<int> statuses,
    DateTime? deliveryStart,
    DateTime? deliveryEnd,
  }) {
    emit(state.copyWith(
      search: '',
      createdBy: '',
      statuses: statuses,
      deliveryStart: deliveryStart,
      deliveryEnd: deliveryEnd,
      clearDelivery: deliveryStart == null && deliveryEnd == null,
      activeBucket: key,
    ));
    load();
  }

  void clearFilters() {
    emit(state.copyWith(
      search: '',
      statuses: const [],
      clearDelivery: true,
      createdBy: '',
      clearActiveBucket: true,
    ));
    load();
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
