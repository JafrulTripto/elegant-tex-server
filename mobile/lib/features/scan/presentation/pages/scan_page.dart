import 'package:flutter/material.dart';

/// Placeholder — the QR scanner (camera, confirm card, manual entry) lands here.
class ScanPage extends StatelessWidget {
  const ScanPage({super.key});

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).hintColor;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.qr_code_scanner, size: 44, color: muted),
          const SizedBox(height: 10),
          Text('Scan — coming next', style: TextStyle(color: muted)),
        ],
      ),
    );
  }
}
