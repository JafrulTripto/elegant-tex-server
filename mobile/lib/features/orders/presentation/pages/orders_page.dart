import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_permissions.dart';
import '../../../../core/constants/order_status.dart';
import '../../../../core/di/injector.dart';
import '../../../../core/utils/formatters.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/entities/order_list_item.dart';
import '../cubit/orders_cubit.dart';
import 'order_detail_page.dart';
import 'order_form_page.dart';

class OrdersPage extends StatelessWidget {
  const OrdersPage({super.key});

  @override
  Widget build(BuildContext context) {
    final session = context.read<AuthCubit>().state.session!;
    return BlocProvider<OrdersCubit>(
      create: (_) => sl<OrdersCubit>()
        ..init(
          userId: session.userId,
          canViewMerchants: session.has(AppPermissions.viewMerchants),
        ),
      child: const _OrdersView(),
    );
  }
}

class _OrdersView extends StatefulWidget {
  const _OrdersView();

  @override
  State<_OrdersView> createState() => _OrdersViewState();
}

class _OrdersViewState extends State<_OrdersView> {
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 300) {
      context.read<OrdersCubit>().loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      builder: (context, state) {
        final cubit = context.read<OrdersCubit>();
        return Scaffold(
          backgroundColor: Colors.transparent,
          floatingActionButton: _buildFab(context),
          body: RefreshIndicator(
            onRefresh: cubit.refresh,
            child: CustomScrollView(
              controller: _scrollCtrl,
              slivers: [
                SliverToBoxAdapter(child: _Header(state: state)),
                ..._buildBody(context, state),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget? _buildFab(BuildContext context) {
    final session = context.read<AuthCubit>().state.session;
    if (session == null) return null;
    final canMarket = session.has(AppPermissions.createMarketplaceOrder);
    final canMerchant = session.has(AppPermissions.createMerchantOrder);
    if (!canMarket && !canMerchant) return null;
    return FloatingActionButton.extended(
      onPressed: () => _createOrder(context, canMarket, canMerchant),
      icon: const Icon(Icons.add),
      label: const Text('New order'),
    );
  }

  Future<void> _createOrder(BuildContext context, bool canMarket, bool canMerchant) async {
    int? orderType;
    if (canMarket && canMerchant) {
      orderType = await showModalBottomSheet<int>(
        context: context,
        showDragHandle: true,
        builder: (_) => SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.storefront_outlined),
                title: const Text('Marketplace order'),
                onTap: () => Navigator.pop(context, 1),
              ),
              ListTile(
                leading: const Icon(Icons.handshake_outlined),
                title: const Text('Merchant order'),
                onTap: () => Navigator.pop(context, 0),
              ),
            ],
          ),
        ),
      );
    } else {
      orderType = canMarket ? 1 : 0;
    }
    if (orderType == null || !context.mounted) return;
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => OrderFormPage.create(orderType: orderType!)),
    );
    if (created == true && context.mounted) context.read<OrdersCubit>().refresh();
  }

  List<Widget> _buildBody(BuildContext context, OrdersState state) {
    if (state.status == OrdersStatus.loading && state.orders.isEmpty) {
      return const [
        SliverFillRemaining(
          hasScrollBody: false,
          child: Center(child: CircularProgressIndicator()),
        ),
      ];
    }
    if (state.status == OrdersStatus.error && state.orders.isEmpty) {
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: _Message(
            icon: Icons.cloud_off,
            title: state.error ?? 'Could not load orders',
            actionLabel: 'Retry',
            onAction: () => context.read<OrdersCubit>().load(),
          ),
        ),
      ];
    }
    if (state.orders.isEmpty) {
      return [
        SliverFillRemaining(
          hasScrollBody: false,
          child: _Message(
            icon: Icons.inbox_outlined,
            title: 'No orders match',
            subtitle: state.hasActiveFilters ? 'Try clearing search or filters.' : null,
            actionLabel: state.hasActiveFilters ? 'Clear filters' : null,
            onAction: state.hasActiveFilters
                ? () => context.read<OrdersCubit>().clearFilters()
                : null,
          ),
        ),
      ];
    }
    return [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
        sliver: SliverList.separated(
          itemCount: state.orders.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (_, i) => _OrderCard(order: state.orders[i]),
        ),
      ),
      SliverToBoxAdapter(
        child: SizedBox(
          height: 48,
          child: Center(
            child: state.loadingMore
                ? const SizedBox(
                    height: 22, width: 22, child: CircularProgressIndicator(strokeWidth: 2))
                : null,
          ),
        ),
      ),
    ];
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.state});
  final OrdersState state;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<OrdersCubit>();
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: TextField(
                  onChanged: cubit.onSearchChanged,
                  decoration: const InputDecoration(
                    hintText: 'Search orders…',
                    prefixIcon: Icon(Icons.search, size: 20),
                    isDense: true,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Badge(
                isLabelVisible: state.hasActiveFilters,
                smallSize: 8,
                child: IconButton.filledTonal(
                  onPressed: () => _openFilterSheet(context, cubit),
                  icon: const Icon(Icons.tune),
                ),
              ),
            ],
          ),
          if (cubit.canViewMerchants) ...[
            const SizedBox(height: 12),
            SegmentedButton<String>(
              segments: const [
                ButtonSegment(value: 'MARKETPLACE', label: Text('Marketplace')),
                ButtonSegment(value: 'MERCHANT', label: Text('Merchant')),
              ],
              selected: {state.orderType},
              onSelectionChanged: (s) => cubit.setOrderType(s.first),
              showSelectedIcon: false,
            ),
          ],
          const SizedBox(height: 12),
          _StatsGrid(state: state),
          const SizedBox(height: 10),
          Text('${state.total} results',
              style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
          const SizedBox(height: 4),
        ],
      ),
    );
  }

  void _openFilterSheet(BuildContext context, OrdersCubit cubit) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      builder: (_) => BlocProvider.value(value: cubit, child: const _FilterSheet()),
    );
  }
}

class _StatsGrid extends StatelessWidget {
  const _StatsGrid({required this.state});
  final OrdersState state;

  @override
  Widget build(BuildContext context) {
    final s = state.stats;
    final pills = [
      _StatPill('Total', s.total, Icons.receipt_long, const Color(0xFF3B82F6)),
      _StatPill('Pending', s.pending, Icons.schedule, const Color(0xFFF59E0B)),
      _StatPill('Processing', s.processing, Icons.sync, const Color(0xFF06B6D4)),
      _StatPill('Delivered', s.delivered, Icons.check_circle, const Color(0xFF10B981)),
    ];
    return Column(
      children: [
        Row(children: [Expanded(child: pills[0]), const SizedBox(width: 8), Expanded(child: pills[1])]),
        const SizedBox(height: 8),
        Row(children: [Expanded(child: pills[2]), const SizedBox(width: 8), Expanded(child: pills[3])]),
      ],
    );
  }
}

class _StatPill extends StatelessWidget {
  const _StatPill(this.label, this.value, this.icon, this.color);
  final String label;
  final int value;
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 11),
      decoration: BoxDecoration(
        color: theme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 18, height: 18,
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.14),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: Icon(icon, size: 11, color: color),
              ),
              const SizedBox(width: 6),
              Text(label.toUpperCase(),
                  style: theme.textTheme.labelSmall
                      ?.copyWith(color: theme.hintColor, fontWeight: FontWeight.w700)),
            ],
          ),
          const SizedBox(height: 4),
          Text('$value',
              style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  const _OrderCard({required this.order});
  final OrderListItem order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = OrderStatus.fromValue(order.status);
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () async {
          await Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => OrderDetailPage(orderId: order.id)),
          );
          // Reflect any status change made on the detail screen.
          if (context.mounted) context.read<OrdersCubit>().refresh();
        },
        child: Padding(
          padding: const EdgeInsets.all(13),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('#${order.id}',
                            style: theme.textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('${order.orderedBy} · ${fmtDate(order.createdAt)}',
                            style: theme.textTheme.bodySmall
                                ?.copyWith(color: theme.hintColor),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  _StatusPill(status: status),
                ],
              ),
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Divider(height: 1),
              ),
              Row(
                children: [
                  Expanded(
                    child: Text(
                      '${order.itemsCount} ${order.itemsCount == 1 ? 'item' : 'items'} · ${fmtDate(order.deliveryDate)}',
                      style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor),
                    ),
                  ),
                  Text(fmtBDT(order.totalAmount),
                      style: theme.textTheme.titleSmall
                          ?.copyWith(fontWeight: FontWeight.bold)),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({required this.status});
  final OrderStatus? status;

  @override
  Widget build(BuildContext context) {
    final s = status;
    final color = s?.color ?? Colors.grey;
    final label = s?.label ?? 'UNKNOWN';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.14),
        borderRadius: BorderRadius.circular(11),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 5, height: 5, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 5),
          Text(label,
              style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 10.5)),
        ],
      ),
    );
  }
}

class _FilterSheet extends StatelessWidget {
  const _FilterSheet();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<OrdersCubit, OrdersState>(
      builder: (context, state) {
        final cubit = context.read<OrdersCubit>();
        return SafeArea(
          top: false,
          child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Filters', style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 16),
              const Text('Status'),
              const SizedBox(height: 6),
              DropdownButtonFormField<int?>(
                initialValue: state.statusFilter,
                isExpanded: true,
                items: [
                  const DropdownMenuItem<int?>(value: null, child: Text('All statuses')),
                  ...OrderStatus.values.map((s) =>
                      DropdownMenuItem<int?>(value: s.value, child: Text(s.label))),
                ],
                onChanged: cubit.setStatusFilter,
              ),
              const SizedBox(height: 14),
              const Text('Date range'),
              const SizedBox(height: 6),
              DropdownButtonFormField<String>(
                initialValue: state.dateFilter,
                isExpanded: true,
                items: const [
                  DropdownMenuItem(value: 'all', child: Text('All time')),
                  DropdownMenuItem(value: '7', child: Text('Last 7 days')),
                  DropdownMenuItem(value: '30', child: Text('Last 30 days')),
                ],
                onChanged: (v) => cubit.setDateFilter(v ?? 'all'),
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        cubit.clearFilters();
                        Navigator.pop(context);
                      },
                      child: const Text('Clear'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    flex: 2,
                    child: FilledButton(
                      onPressed: () => Navigator.pop(context),
                      child: const Text('Done'),
                    ),
                  ),
                ],
              ),
            ],
          ),
          ),
        );
      },
    );
  }
}

class _Message extends StatelessWidget {
  const _Message({
    required this.icon,
    required this.title,
    this.subtitle,
    this.actionLabel,
    this.onAction,
  });
  final IconData icon;
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).hintColor;
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 44, color: muted),
            const SizedBox(height: 12),
            Text(title, textAlign: TextAlign.center),
            if (subtitle != null) ...[
              const SizedBox(height: 4),
              Text(subtitle!,
                  textAlign: TextAlign.center,
                  style: TextStyle(color: muted, fontSize: 13)),
            ],
            if (actionLabel != null) ...[
              const SizedBox(height: 16),
              OutlinedButton(onPressed: onAction, child: Text(actionLabel!)),
            ],
          ],
        ),
      ),
    );
  }
}
