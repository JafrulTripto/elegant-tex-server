import 'package:flutter/material.dart';

import '../../../../core/constants/order_status.dart';

/// A reusable status-change bottom sheet used by the order detail screen and the
/// scanner. `options` is the pre-filtered list of statuses the user may set
/// (transition-scoped, ADR 0004). `onSubmit` returns an error message or null.
/// Resolves to true when a change was applied.
Future<bool> showStatusChangeSheet({
  required BuildContext context,
  required int current,
  required List<OrderStatus> options,
  required Future<String?> Function(int newStatus, String? comment) onSubmit,
}) async {
  if (options.isEmpty) return false;
  final result = await showModalBottomSheet<bool>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (sheetContext) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(sheetContext).viewInsets.bottom),
      child: _StatusChangeSheet(current: current, options: options, onSubmit: onSubmit),
    ),
  );
  return result ?? false;
}

class _StatusChangeSheet extends StatefulWidget {
  const _StatusChangeSheet({
    required this.current,
    required this.options,
    required this.onSubmit,
  });
  final int current;
  final List<OrderStatus> options;
  final Future<String?> Function(int newStatus, String? comment) onSubmit;

  @override
  State<_StatusChangeSheet> createState() => _StatusChangeSheetState();
}

class _StatusChangeSheetState extends State<_StatusChangeSheet> {
  late int _selected;
  final _commentCtrl = TextEditingController();
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    final hasCurrent = widget.options.any((s) => s.value == widget.current);
    _selected = hasCurrent ? widget.current : widget.options.first.value;
  }

  @override
  void dispose() {
    _commentCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    setState(() => _submitting = true);
    final error = await widget.onSubmit(
      _selected,
      _commentCtrl.text.trim().isEmpty ? null : _commentCtrl.text.trim(),
    );
    if (!mounted) return;
    if (error == null) {
      Navigator.pop(context, true);
    } else {
      setState(() => _submitting = false);
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(error)));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('Update status', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 14),
          DropdownButtonFormField<int>(
            initialValue: _selected,
            isExpanded: true,
            items: widget.options
                .map((s) => DropdownMenuItem(value: s.value, child: Text(s.label)))
                .toList(),
            onChanged: _submitting ? null : (v) => setState(() => _selected = v ?? _selected),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _commentCtrl,
            enabled: !_submitting,
            minLines: 2,
            maxLines: 4,
            decoration: const InputDecoration(hintText: 'Comment (optional)'),
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _submitting ? null : _submit,
            style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(48)),
            child: _submitting
                ? const SizedBox(
                    height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                : const Text('Update'),
          ),
        ],
      ),
    );
  }
}
