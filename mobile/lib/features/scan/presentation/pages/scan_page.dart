import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../../../core/constants/order_status.dart';
import '../../../../core/di/injector.dart';
import '../../../../core/utils/status_access.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../../orders/presentation/pages/order_detail_page.dart';
import '../../../orders/presentation/widgets/status_change_sheet.dart';
import '../cubit/scan_cubit.dart';

class ScanPage extends StatelessWidget {
  const ScanPage({super.key});

  @override
  Widget build(BuildContext context) {
    final perms = context.read<AuthCubit>().state.session?.permissions ?? const <String>[];
    return BlocProvider<ScanCubit>(
      create: (_) => sl<ScanCubit>()..init(perms),
      child: const _ScanView(),
    );
  }
}

class _ScanView extends StatefulWidget {
  const _ScanView();

  @override
  State<_ScanView> createState() => _ScanViewState();
}

class _ScanViewState extends State<_ScanView> {
  final _controller = MobileScannerController(
    detectionSpeed: DetectionSpeed.noDuplicates,
    formats: const [BarcodeFormat.qrCode],
  );

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ScanCubit, ScanState>(
      listenWhen: (p, c) =>
          (p.phase == ScanPhase.scanning) != (c.phase == ScanPhase.scanning),
      listener: (context, state) {
        if (state.phase == ScanPhase.scanning) {
          _controller.start();
        } else {
          _controller.stop();
        }
      },
      builder: (context, state) {
        return ColoredBox(
          color: const Color(0xFF0D1420),
          child: Stack(
            fit: StackFit.expand,
            children: [
              MobileScanner(
                controller: _controller,
                fit: BoxFit.cover,
                onDetect: (capture) {
                  for (final b in capture.barcodes) {
                    final raw = b.rawValue;
                    if (raw != null && raw.isNotEmpty) {
                      context.read<ScanCubit>().onScanned(raw);
                      break;
                    }
                  }
                },
              ),
              _overlay(context, state),
            ],
          ),
        );
      },
    );
  }

  Widget _overlay(BuildContext context, ScanState state) {
    switch (state.phase) {
      case ScanPhase.scanning:
        return _ScanningOverlay(onManual: () => _openManual(context));
      case ScanPhase.validating:
        return const _Busy(label: 'Validating scan…');
      case ScanPhase.updating:
        return const _Busy(label: 'Updating status…');
      case ScanPhase.confirm:
        return _ConfirmCard(state: state, onManual: () => _openManual(context));
      case ScanPhase.success:
        return _SuccessCard(state: state);
      case ScanPhase.error:
        return _ErrorCard(state: state, onManual: () => _openManual(context));
    }
  }

  void _openManual(BuildContext context) {
    final cubit = context.read<ScanCubit>();
    final ctrl = TextEditingController();
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.only(
          left: 16, right: 16, bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 16,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text('Enter Order ID', style: Theme.of(sheetContext).textTheme.titleMedium),
            const SizedBox(height: 12),
            TextField(
              controller: ctrl,
              autofocus: true,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(hintText: 'e.g. 1042'),
              onSubmitted: (_) {
                Navigator.pop(sheetContext);
                cubit.submitManual(ctrl.text);
              },
            ),
            const SizedBox(height: 12),
            FilledButton(
              style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
              onPressed: () {
                Navigator.pop(sheetContext);
                cubit.submitManual(ctrl.text);
              },
              child: const Text('Look up order'),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Scanning frame ─────────────────────────────────────────────────────────

class _ScanningOverlay extends StatelessWidget {
  const _ScanningOverlay({required this.onManual});
  final VoidCallback onManual;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Spacer(),
        Center(
          child: Container(
            width: 230,
            height: 230,
            decoration: BoxDecoration(
              border: Border.all(color: const Color(0xFF60A5FA), width: 3),
              borderRadius: BorderRadius.circular(16),
            ),
          ),
        ),
        const SizedBox(height: 20),
        const Text("Align the order's QR code within the frame",
            style: TextStyle(color: Colors.white70, fontSize: 13),
            textAlign: TextAlign.center),
        const Spacer(),
        Padding(
          padding: const EdgeInsets.all(20),
          child: OutlinedButton.icon(
            onPressed: onManual,
            icon: const Icon(Icons.keyboard, color: Colors.white),
            label: const Text('Enter Order ID manually', style: TextStyle(color: Colors.white)),
            style: OutlinedButton.styleFrom(
              side: const BorderSide(color: Colors.white38),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Busy (validating / updating) ───────────────────────────────────────────

class _Busy extends StatelessWidget {
  const _Busy({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Colors.black54,
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const CircularProgressIndicator(color: Colors.white),
            const SizedBox(height: 14),
            Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}

// ── Confirm ────────────────────────────────────────────────────────────────

class _ConfirmCard extends StatelessWidget {
  const _ConfirmCard({required this.state, required this.onManual});
  final ScanState state;
  final VoidCallback onManual;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ScanCubit>();
    final order = state.order!;
    final next = state.next;
    final canAdvance = next != null && state.canApplyNext;

    String note;
    if (next == null) {
      note = "This order can't be auto-advanced from ${state.from?.label ?? 'its status'}.";
    } else if (!state.canApplyNext) {
      note = "You don't have permission to move this order into ${next.label}.";
    } else {
      note = 'Advance this order one step.';
    }

    return _OverlayCard(
      children: [
        Text('#${order.id}',
            style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        Text(order.orderableName,
            style: const TextStyle(color: Colors.white70), overflow: TextOverflow.ellipsis),
        const SizedBox(height: 14),
        _FromTo(from: state.from, to: next ?? state.from),
        const SizedBox(height: 12),
        Text(note, style: const TextStyle(color: Colors.white60, fontSize: 13), textAlign: TextAlign.center),
        const SizedBox(height: 18),
        if (canAdvance)
          _FullButton(
            label: 'Confirm · ${next.label}',
            onPressed: cubit.confirmAdvance,
          ),
        _FullButton(
          label: 'Change status manually',
          filled: false,
          onPressed: () => _manual(context, order.id, order.status),
        ),
        _ViewOrderButton(orderId: order.id),
        TextButton(onPressed: cubit.reset, child: const Text('Scan again')),
      ],
    );
  }

  void _manual(BuildContext context, int orderId, int current) {
    final cubit = context.read<ScanCubit>();
    showStatusChangeSheet(
      context: context,
      current: current,
      options: settableStatuses(cubit.permissions),
      onSubmit: cubit.applyManual,
    );
  }
}

// ── Success ────────────────────────────────────────────────────────────────

class _SuccessCard extends StatelessWidget {
  const _SuccessCard({required this.state});
  final ScanState state;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ScanCubit>();
    final order = state.order;
    return _OverlayCard(
      children: [
        const CircleAvatar(
          radius: 28,
          backgroundColor: Color(0xFF16A34A),
          child: Icon(Icons.check, color: Colors.white, size: 30),
        ),
        const SizedBox(height: 12),
        const Text('Scan successful',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
        if (order != null) ...[
          const SizedBox(height: 8),
          Text('#${order.id} · ${order.orderableName}',
              style: const TextStyle(color: Colors.white70), overflow: TextOverflow.ellipsis),
        ],
        const SizedBox(height: 14),
        _FromTo(from: state.from, to: state.appliedTo),
        const SizedBox(height: 18),
        _FullButton(label: 'Continue scanning', onPressed: cubit.reset),
        if (order != null) _ViewOrderButton(orderId: order.id),
      ],
    );
  }
}

// ── Error ──────────────────────────────────────────────────────────────────

class _ErrorCard extends StatelessWidget {
  const _ErrorCard({required this.state, required this.onManual});
  final ScanState state;
  final VoidCallback onManual;

  @override
  Widget build(BuildContext context) {
    final cubit = context.read<ScanCubit>();
    return _OverlayCard(
      children: [
        const CircleAvatar(
          radius: 28,
          backgroundColor: Color(0x33F87171),
          child: Icon(Icons.close, color: Color(0xFFF87171), size: 30),
        ),
        const SizedBox(height: 12),
        Text(state.notFound ? 'Order not found' : 'Scan failed',
            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Text(state.error ?? 'Something went wrong.',
            style: const TextStyle(color: Colors.white70, fontSize: 13), textAlign: TextAlign.center),
        const SizedBox(height: 18),
        _FullButton(label: 'Scan again', onPressed: cubit.reset),
        _FullButton(label: 'Enter Order ID', filled: false, onPressed: onManual),
      ],
    );
  }
}

// ── Shared bits ──────────────────────────────────────────────────────────────

class _OverlayCard extends StatelessWidget {
  const _OverlayCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xF20D1420),
      alignment: Alignment.center,
      padding: const EdgeInsets.all(24),
      child: SingleChildScrollView(
        child: Column(mainAxisSize: MainAxisSize.min, children: children),
      ),
    );
  }
}

class _FromTo extends StatelessWidget {
  const _FromTo({required this.from, required this.to});
  final OrderStatus? from;
  final OrderStatus? to;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _chip(from),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 10),
          child: Icon(Icons.arrow_forward, color: Colors.white54, size: 18),
        ),
        _chip(to),
      ],
    );
  }

  Widget _chip(OrderStatus? s) {
    final color = s?.color ?? Colors.grey;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(100),
      ),
      child: Text(s?.label ?? '—',
          style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 11.5)),
    );
  }
}

class _FullButton extends StatelessWidget {
  const _FullButton({required this.label, required this.onPressed, this.filled = true});
  final String label;
  final VoidCallback onPressed;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    final child = Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: SizedBox(
        width: double.infinity,
        child: filled
            ? FilledButton(
                onPressed: onPressed,
                style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                child: Text(label),
              )
            : OutlinedButton(
                onPressed: onPressed,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white24),
                ),
                child: Text(label),
              ),
      ),
    );
    return child;
  }
}

class _ViewOrderButton extends StatelessWidget {
  const _ViewOrderButton({required this.orderId});
  final int orderId;

  @override
  Widget build(BuildContext context) {
    return _FullButton(
      label: 'View order',
      filled: false,
      onPressed: () => Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => OrderDetailPage(orderId: orderId)),
      ),
    );
  }
}
