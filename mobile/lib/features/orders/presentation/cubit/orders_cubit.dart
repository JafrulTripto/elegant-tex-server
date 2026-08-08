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
    this.statusFilter,
    this.dateFilter = 'all',
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
  final int? statusFilter;
  final String dateFilter;
  final int page;
  final int total;
  final bool loadingMore;
  final String? error;

  bool get hasMore => orders.length < total;
  bool get hasActiveFilters =>
      search.isNotEmpty || statusFilter != null || dateFilter != 'all';

  OrdersState copyWith({
    OrdersStatus? status,
    List<OrderListItem>? orders,
    OrderStats? stats,
    String? orderType,
    String? search,
    int? statusFilter,
    bool clearStatusFilter = false,
    String? dateFilter,
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
      statusFilter: clearStatusFilter ? null : (statusFilter ?? this.statusFilter),
      dateFilter: dateFilter ?? this.dateFilter,
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
        statusFilter,
        dateFilter,
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
        status: state.statusFilter,
        dateFilter: state.dateFilter,
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
    final res = await _repo.getStats(_userId);
    res.fold((_) {}, (s) => emit(state.copyWith(stats: s)));
  }

  void setOrderType(String type) {
    if (type == state.orderType) return;
    emit(state.copyWith(orderType: type));
    load();
  }

  void onSearchChanged(String text) {
    emit(state.copyWith(search: text));
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), load);
  }

  void setStatusFilter(int? status) {
    emit(status == null
        ? state.copyWith(clearStatusFilter: true)
        : state.copyWith(statusFilter: status));
    load();
  }

  void setDateFilter(String value) {
    emit(state.copyWith(dateFilter: value));
    load();
  }

  void clearFilters() {
    emit(state.copyWith(search: '', clearStatusFilter: true, dateFilter: 'all'));
    load();
  }

  @override
  Future<void> close() {
    _debounce?.cancel();
    return super.close();
  }
}
