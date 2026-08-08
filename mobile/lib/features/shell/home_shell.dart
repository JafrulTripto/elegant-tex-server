import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../core/constants/app_permissions.dart';
import '../../core/constants/order_status.dart';
import '../auth/domain/entities/user_session.dart';
import '../auth/presentation/cubit/auth_cubit.dart';
import '../orders/presentation/pages/orders_page.dart';
import '../scan/presentation/pages/scan_page.dart';

class _Tab {
  const _Tab(this.label, this.icon, this.selectedIcon, this.page, {this.isCamera = false});
  final String label;
  final IconData icon;
  final IconData selectedIcon;
  final Widget page;
  final bool isCamera;
}

/// Bottom-nav shell. Tabs are gated by the session's permissions (Q6): Scan shows
/// when the user can perform any status transition; New shows when they can create.
class HomeShell extends StatefulWidget {
  const HomeShell({super.key, required this.session});
  final UserSession session;

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  bool get _canScan =>
      widget.session.has(AppPermissions.changeStatus) ||
      widget.session.hasAny(
        OrderStatus.mainFlow.map((s) => s.requiredPermission).whereType<String>(),
      );

  List<_Tab> get _tabs => [
        const _Tab('Orders', Icons.receipt_long_outlined, Icons.receipt_long, OrdersPage()),
        if (_canScan)
          const _Tab('Scan', Icons.qr_code_scanner, Icons.qr_code_scanner, ScanPage(),
              isCamera: true),
      ];

  @override
  Widget build(BuildContext context) {
    final tabs = _tabs;
    final index = _index.clamp(0, tabs.length - 1);
    return Scaffold(
      appBar: AppBar(
        title: Text(tabs[index].label),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.account_circle_outlined),
            onSelected: (value) {
              if (value == 'logout') context.read<AuthCubit>().logout();
            },
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.session.name,
                        style: const TextStyle(fontWeight: FontWeight.bold)),
                    Text(widget.session.email,
                        style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12)),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem<String>(
                value: 'logout',
                child: ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(Icons.logout, color: Colors.red),
                  title: Text('Sign out'),
                ),
              ),
            ],
          ),
        ],
      ),
      body: IndexedStack(
        index: index,
        children: [
          // The camera tab is only built while it's the active tab, so the scanner
          // isn't running (or asking for permission) under the other tabs.
          for (var i = 0; i < tabs.length; i++)
            (tabs[i].isCamera && i != index) ? const SizedBox.shrink() : tabs[i].page,
        ],
      ),
      bottomNavigationBar: tabs.length > 1
          ? NavigationBar(
              selectedIndex: index,
              onDestinationSelected: (i) => setState(() => _index = i),
              destinations: tabs
                  .map((t) => NavigationDestination(
                        icon: Icon(t.icon),
                        selectedIcon: Icon(t.selectedIcon),
                        label: t.label,
                      ))
                  .toList(),
            )
          : null,
    );
  }
}
