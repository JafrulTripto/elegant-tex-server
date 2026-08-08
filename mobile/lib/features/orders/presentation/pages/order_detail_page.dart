import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../../core/constants/app_permissions.dart';
import '../../../../core/constants/order_status.dart';
import '../../../../core/di/injector.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/status_access.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/entities/order_detail.dart';
import '../cubit/order_detail_cubit.dart';
import '../widgets/status_change_sheet.dart';
import 'order_form_page.dart';

class OrderDetailPage extends StatelessWidget {
  const OrderDetailPage({super.key, required this.orderId});
  final int orderId;

  @override
  Widget build(BuildContext context) {
    final permissions = context.read<AuthCubit>().state.session?.permissions ?? const [];
    return BlocProvider<OrderDetailCubit>(
      create: (_) => sl<OrderDetailCubit>(param1: orderId)..load(),
      child: _DetailView(orderId: orderId, permissions: permissions),
    );
  }
}

class _DetailView extends StatelessWidget {
  const _DetailView({required this.orderId, required this.permissions});
  final int orderId;
  final List<String> permissions;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Order #$orderId'),
        actions: [
          if (permissions.contains(AppPermissions.editOrder))
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              tooltip: 'Edit order',
              onPressed: () async {
                final updated = await Navigator.of(context).push<bool>(
                  MaterialPageRoute(builder: (_) => OrderFormPage.edit(orderId: orderId)),
                );
                if (updated == true && context.mounted) {
                  context.read<OrderDetailCubit>().load();
                }
              },
            ),
        ],
      ),
      body: BlocBuilder<OrderDetailCubit, OrderDetailState>(
        builder: (context, state) {
          switch (state.status) {
            case DetailStatus.loading:
              return const Center(child: CircularProgressIndicator());
            case DetailStatus.error:
              return _ErrorView(
                message: state.error ?? 'Could not load the order',
                onRetry: () => context.read<OrderDetailCubit>().load(),
              );
            case DetailStatus.loaded:
              return _Content(order: state.order!, permissions: permissions);
          }
        },
      ),
    );
  }
}

class _Content extends StatelessWidget {
  const _Content({required this.order, required this.permissions});
  final OrderDetail order;
  final List<String> permissions;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: [
        _HeaderCard(order: order, permissions: permissions),
        const SizedBox(height: 16),
        _SectionLabel('Items'),
        const SizedBox(height: 8),
        ...order.products.map((p) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: _ProductCard(product: p),
            )),
        const SizedBox(height: 6),
        _InfoCard(order: order),
        const SizedBox(height: 16),
        _SectionLabel('History'),
        const SizedBox(height: 8),
        _Timeline(order: order),
      ],
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.order, required this.permissions});
  final OrderDetail order;
  final List<String> permissions;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final status = OrderStatus.fromValue(order.status);
    final canChange = canChangeAnyStatus(permissions);
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(order.orderableName,
                          style: theme.textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 2),
                      Text(fmtDateTime(order.createdAt),
                          style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
                    ],
                  ),
                ),
                _StatusChip(
                  status: status,
                  onTap: canChange
                      ? () => _openStatusSheet(context, order, permissions)
                      : null,
                ),
              ],
            ),
            const SizedBox(height: 14),
            _Stepper(
              currentStatus: order.status,
              visited: _visitedStatuses(order),
            ),
          ],
        ),
      ),
    );
  }
}

/// The status values the order actually passed through — the timeline entries
/// plus the current status. Falls back to positional (every earlier status) for
/// legacy orders that have no recorded history, so the stepper still fills in.
Set<int> _visitedStatuses(OrderDetail order) {
  final visited = order.timeline.map((t) => t.status).toSet()
    ..add(order.status)
    ..add(OrderStatus.draft.value); // every order starts as a draft
  if (order.timeline.isEmpty) {
    for (final s in OrderStatus.values) {
      if (s.value <= order.status) visited.add(s.value);
    }
  }
  return visited;
}

class _Stepper extends StatelessWidget {
  const _Stepper({required this.currentStatus, required this.visited});
  final int currentStatus;
  final Set<int> visited;

  @override
  Widget build(BuildContext context) {
    final steps = OrderStatus.values.take(6).toList(); // DRAFT..DELIVERED
    final muted = Theme.of(context).hintColor;
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (var i = 0; i < steps.length; i++) ...[
            _StepNode(
              step: steps[i],
              done: visited.contains(steps[i].value) && steps[i].value != currentStatus,
              current: steps[i].value == currentStatus,
              muted: muted,
            ),
            if (i < steps.length - 1)
              Container(
                width: 22,
                height: 2,
                margin: const EdgeInsets.only(bottom: 16),
                // Green only when both endpoints were actually reached, so a
                // skipped status breaks the chain instead of looking completed.
                color: visited.contains(steps[i].value) && visited.contains(steps[i + 1].value)
                    ? const Color(0xFF10B981)
                    : muted.withValues(alpha: 0.3),
              ),
          ],
        ],
      ),
    );
  }
}

class _StepNode extends StatelessWidget {
  const _StepNode({
    required this.step,
    required this.done,
    required this.current,
    required this.muted,
  });
  final OrderStatus step;
  final bool done;
  final bool current;
  final Color muted;

  @override
  Widget build(BuildContext context) {
    final bg = done
        ? const Color(0xFF10B981)
        : current
            ? step.color
            : muted.withValues(alpha: 0.25);
    return SizedBox(
      width: 56,
      child: Column(
        children: [
          Container(
            width: 20,
            height: 20,
            decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
            child: done
                ? const Icon(Icons.check, size: 12, color: Colors.white)
                : null,
          ),
          const SizedBox(height: 4),
          Text(
            step.label,
            style: TextStyle(
              fontSize: 9,
              fontWeight: FontWeight.w600,
              color: (done || current) ? null : muted,
            ),
            textAlign: TextAlign.center,
            maxLines: 1,
          ),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  const _ProductCard({required this.product});
  final OrderProduct product;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final title = product.productType.isNotEmpty
        ? product.productType
        : (product.description?.isNotEmpty == true ? product.description! : 'Item');
    final showDesc = product.productType.isNotEmpty &&
        (product.description?.isNotEmpty ?? false);
    final fabricBits = [product.fabric, product.fabricType]
        .whereType<String>()
        .where((s) => s.isNotEmpty)
        .toList();
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                title.isNotEmpty ? title[0].toUpperCase() : '?',
                style: TextStyle(
                    color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(title,
                            style: theme.textTheme.titleSmall
                                ?.copyWith(fontWeight: FontWeight.bold)),
                      ),
                      Text(fmtBDT(product.price),
                          style: theme.textTheme.titleSmall
                              ?.copyWith(fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${fabricBits.isEmpty ? '' : '${fabricBits.join(' · ')} · '}Qty ${product.unit}',
                    style: TextStyle(
                        color: theme.colorScheme.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w600),
                  ),
                  if (showDesc)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(product.description!,
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: theme.hintColor)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard({required this.order});
  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (order.isMarketplace) ...[
              _MiniLabel('Customer'),
              Text(order.customer!.name,
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
              if (order.customer!.address.isNotEmpty)
                Text(order.customer!.address,
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
              if (order.customer!.phone.isNotEmpty)
                Text(order.customer!.phone,
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
            ] else ...[
              _MiniLabel('Merchant'),
              Text(order.orderableName,
                  style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
              if ((order.merchantRef ?? '').isNotEmpty)
                Text('Ref: ${order.merchantRef}',
                    style: theme.textTheme.bodySmall?.copyWith(color: theme.hintColor)),
            ],
            const Divider(height: 20),
            _MiniLabel('Delivery'),
            Text('${order.deliveryChannel} · ${fmtDate(order.deliveryDate)}',
                style: theme.textTheme.bodyMedium),
            const Divider(height: 20),
            _MiniLabel('Payment'),
            _PayRow('Subtotal', order.subtotal),
            _PayRow('Delivery', order.deliveryCharge),
            const Divider(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total', style: theme.textTheme.titleMedium),
                Text(fmtBDT(order.total),
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _PayRow extends StatelessWidget {
  const _PayRow(this.label, this.amount);
  final String label;
  final double amount;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [Text(label), Text(fmtBDT(amount))],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.order});
  final OrderDetail order;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final entries = order.timeline.reversed.toList();
    if (entries.isEmpty) {
      return Text('No history yet.', style: TextStyle(color: theme.hintColor));
    }
    return Column(
      children: entries.map((t) {
        final s = OrderStatus.fromValue(t.status);
        final color = s?.color ?? Colors.grey;
        return Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 5, right: 10),
                child: Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                ),
              ),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(s?.label ?? 'UNKNOWN',
                            style: TextStyle(
                                color: color, fontWeight: FontWeight.w700, fontSize: 11)),
                        const SizedBox(width: 8),
                        Text(fmtDateTime(t.createdAt),
                            style: TextStyle(color: theme.hintColor, fontSize: 11)),
                      ],
                    ),
                    if ((t.comment ?? '').isNotEmpty)
                      Text(t.comment!, style: theme.textTheme.bodySmall),
                    if ((t.userName ?? '').isNotEmpty)
                      Text('by ${t.userName}',
                          style: theme.textTheme.bodySmall
                              ?.copyWith(color: theme.hintColor, fontStyle: FontStyle.italic)),
                  ],
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.status, this.onTap});
  final OrderStatus? status;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = status?.color ?? Colors.grey;
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 5),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.14),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(status?.label ?? 'UNKNOWN',
                style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 11)),
            if (onTap != null) Icon(Icons.arrow_drop_down, color: color, size: 18),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  const _SectionLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Text(text.toUpperCase(),
        style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: Theme.of(context).hintColor,
            letterSpacing: 0.4));
  }
}

class _MiniLabel extends StatelessWidget {
  const _MiniLabel(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Text(text.toUpperCase(),
          style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: Theme.of(context).hintColor)),
    );
  }
}

class _ErrorView extends StatelessWidget {
  const _ErrorView({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off, size: 44, color: Theme.of(context).hintColor),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            OutlinedButton(onPressed: onRetry, child: const Text('Retry')),
          ],
        ),
      ),
    );
  }
}

void _openStatusSheet(BuildContext context, OrderDetail order, List<String> permissions) {
  final cubit = context.read<OrderDetailCubit>();
  showStatusChangeSheet(
    context: context,
    current: order.status,
    options: settableStatuses(permissions),
    onSubmit: (newStatus, comment) => cubit.changeStatus(newStatus, comment),
  );
}
