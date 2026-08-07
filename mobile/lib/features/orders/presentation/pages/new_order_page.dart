import 'package:flutter/material.dart';

/// Placeholder — the create-order form (products, customer/merchant, delivery,
/// image capture) lands here.
class NewOrderPage extends StatelessWidget {
  const NewOrderPage({super.key});

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).hintColor;
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.add_box_outlined, size: 44, color: muted),
          const SizedBox(height: 10),
          Text('New order — coming next', style: TextStyle(color: muted)),
        ],
      ),
    );
  }
}
