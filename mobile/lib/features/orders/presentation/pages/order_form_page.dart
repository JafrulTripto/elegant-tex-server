import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../../core/di/injector.dart';
import '../../../../core/utils/formatters.dart';
import '../../../../core/utils/json_parse.dart';
import '../../../auth/presentation/cubit/auth_cubit.dart';
import '../../domain/entities/customer_match.dart';
import '../../domain/entities/ref_item.dart';
import '../../domain/repositories/reference_repository.dart';
import '../cubit/order_form_cubit.dart';

class OrderFormPage extends StatelessWidget {
  const OrderFormPage.create({super.key, required this.orderType}) : orderId = null;
  const OrderFormPage.edit({super.key, required this.orderId}) : orderType = 1;

  final int orderType;
  final int? orderId;

  @override
  Widget build(BuildContext context) {
    final userId = context.read<AuthCubit>().state.session!.userId;
    return BlocProvider<OrderFormCubit>(
      create: (_) => sl<OrderFormCubit>()
        ..init(orderType: orderType, userId: userId, editId: orderId),
      child: Scaffold(
        appBar: AppBar(title: Text(orderId == null ? 'New order' : 'Edit order')),
        body: BlocBuilder<OrderFormCubit, OrderFormState>(
          builder: (context, state) {
            switch (state.phase) {
              case FormPhase.loading:
                return const Center(child: CircularProgressIndicator());
              case FormPhase.error:
                return Center(
                  child: Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(state.error ?? 'Could not load the form',
                            textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        OutlinedButton(
                          onPressed: () => context.read<OrderFormCubit>().init(
                              orderType: orderType, userId: userId, editId: orderId),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                );
              case FormPhase.ready:
                final cubit = context.read<OrderFormCubit>();
                return _OrderForm(
                  key: ValueKey(cubit.orderType),
                  userId: userId,
                  isEdit: orderId != null,
                );
            }
          },
        ),
      ),
    );
  }
}

class _ProductRow {
  _ProductRow({this.productTypeId, this.fabricColorId, this.fabricColorName, this.fabricTypeId, this.qty = 1})
      : price = TextEditingController(),
        desc = TextEditingController();
  int? productTypeId;
  int? fabricColorId;
  String? fabricColorName;
  int? fabricTypeId;
  int qty;
  final TextEditingController price;
  final TextEditingController desc;
  void dispose() {
    price.dispose();
    desc.dispose();
  }
}

class _OrderForm extends StatefulWidget {
  const _OrderForm({super.key, required this.userId, required this.isEdit});
  final int userId;
  final bool isEdit;

  @override
  State<_OrderForm> createState() => _OrderFormState();
}

class _OrderFormState extends State<_OrderForm> {
  final _picker = ImagePicker();

  // Party / merchant
  int? _partyId;
  final _merchantRef = TextEditingController();

  // Customer
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _altPhone = TextEditingController();
  final _address = TextEditingController();
  final _facebook = TextEditingController();
  int? _divisionId, _districtId, _upazilaId;

  // Delivery
  int? _channelId;
  DateTime? _deliveryDate;
  final _charge = TextEditingController(text: '0');

  final List<_ProductRow> _products = [];
  final List<XFile> _newImages = [];
  List<dynamic> _existingImages = const [];

  // Phone → existing-customer search (matches the web auto-fill behaviour).
  List<CustomerMatch> _customerMatches = const [];
  bool _fieldsDisabled = false;
  bool _customerFound = false;
  Timer? _phoneDebounce;

  OrderFormCubit get _cubit => context.read<OrderFormCubit>();
  bool get _isMarketplace => _cubit.orderType == 1;

  @override
  void initState() {
    super.initState();
    _prefill(_cubit.state.prefill);
    if (_products.isEmpty) _products.add(_ProductRow());
  }

  void _prefill(Map<String, dynamic>? p) {
    if (p == null) return;
    _partyId = _id(p['orderable']?['id']);
    _merchantRef.text = asStr(p['merchantRef']);
    _channelId = _id(p['deliveryChannel']?['value'] ?? p['deliveryChannel']?['id']);
    _deliveryDate = asDate(p['deliveryDate']);
    _charge.text = asDouble(p['payment']?['deliveryCharge']).toStringAsFixed(0);
    _existingImages = (p['images'] as List?) ?? const [];

    final c = p['customer'] as Map<String, dynamic>?;
    if (c != null) {
      _name.text = asStr(c['name']);
      _facebook.text = asStr(c['facebook']);
      _altPhone.text = asStr(c['altPhone']);
      final a = c['address'] as Map<String, dynamic>?;
      _address.text = asStr(a?['address']);
      _phone.text = asStr(a?['phone']);
      _divisionId = _id(a?['division']?['value']);
      _districtId = _id(a?['district']?['value']);
      _upazilaId = _id(a?['upazila']?['value']);
    }

    for (final raw in (p['products'] as List? ?? const [])) {
      final pr = raw as Map<String, dynamic>;
      final row = _ProductRow(
        productTypeId: _id(pr['productType']),
        fabricColorId: _id(pr['fabrics']),
        fabricColorName: _id(pr['fabrics']) == null ? null : 'Fabric #${_id(pr['fabrics'])}',
        fabricTypeId: _id(pr['fabricType']),
        qty: asInt(pr['unit'], 1),
      );
      row.price.text = asDouble(pr['price']).toStringAsFixed(0);
      row.desc.text = asStr(pr['description']);
      _products.add(row);
    }
  }

  int? _id(dynamic v) {
    if (v == null) return null;
    final n = asInt(v, -1);
    return n < 0 ? null : n;
  }

  @override
  void dispose() {
    _merchantRef.dispose();
    _name.dispose();
    _phone.dispose();
    _altPhone.dispose();
    _address.dispose();
    _facebook.dispose();
    _charge.dispose();
    _phoneDebounce?.cancel();
    for (final p in _products) {
      p.dispose();
    }
    super.dispose();
  }

  double get _grandTotal {
    final items = _products.fold<double>(
        0, (sum, p) => sum + p.qty * (double.tryParse(p.price.text) ?? 0));
    return items + (double.tryParse(_charge.text) ?? 0);
  }

  @override
  Widget build(BuildContext context) {
    final refs = _cubit.state.refs!;
    return BlocListener<OrderFormCubit, OrderFormState>(
      listenWhen: (p, c) => p.districts != c.districts || p.upazilas != c.upazilas,
      listener: (_, _) => setState(() {}),
      child: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
              children: [
                _partySection(refs),
                const SizedBox(height: 16),
                _sectionLabel('Products'),
                const SizedBox(height: 8),
                ..._products.asMap().entries.map((e) => _productCard(e.key, e.value, refs)),
                OutlinedButton.icon(
                  onPressed: () => setState(() => _products.add(_ProductRow())),
                  icon: const Icon(Icons.add),
                  label: const Text('Add product'),
                ),
                const SizedBox(height: 16),
                if (_isMarketplace) _customerSection() else _merchantSection(),
                const SizedBox(height: 16),
                _deliverySection(refs),
                const SizedBox(height: 16),
                _imagesSection(),
              ],
            ),
          ),
          _submitBar(),
        ],
      ),
    );
  }

  // ── Sections ────────────────────────────────────────────────────────────

  Widget _partySection(FormRefs refs) {
    return _card([
      _dropdown<int>(
        label: _isMarketplace ? 'Marketplace' : 'Merchant',
        value: _partyId,
        items: refs.parties.map((m) => DropdownMenuItem(value: m.id, child: Text(m.name))).toList(),
        onChanged: (v) => setState(() => _partyId = v),
      ),
    ]);
  }

  Widget _productCard(int index, _ProductRow row, FormRefs refs) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text('PRODUCT ${index + 1}',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: Theme.of(context).hintColor,
                      )),
                ),
                Text(fmtBDT(row.qty * (double.tryParse(row.price.text) ?? 0)),
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            _dropdown<int>(
              label: 'Product type',
              value: row.productTypeId,
              items: refs.productTypes.map((t) => DropdownMenuItem(value: t.id, child: Text(t.name))).toList(),
              onChanged: (v) => setState(() => row.productTypeId = v),
            ),
            const SizedBox(height: 10),
            InkWell(
              onTap: () => _pickFabric(row),
              child: InputDecorator(
                decoration: const InputDecoration(labelText: 'Fabric colour'),
                child: Text(row.fabricColorName ?? 'Select fabric',
                    style: TextStyle(color: row.fabricColorName == null ? Theme.of(context).hintColor : null)),
              ),
            ),
            const SizedBox(height: 10),
            _dropdown<int>(
              label: 'Fabric type',
              value: row.fabricTypeId,
              items: refs.fabricTypes.map((t) => DropdownMenuItem(value: t.id, child: Text(t.name))).toList(),
              onChanged: (v) => setState(() => row.fabricTypeId = v),
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                _QtyStepper(
                  qty: row.qty,
                  onChanged: (q) => setState(() => row.qty = q),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    controller: row.price,
                    keyboardType: TextInputType.number,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(labelText: 'Unit price'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _text(row.desc, 'Description', maxLines: 2),
            if (_products.length > 1)
              Align(
                alignment: Alignment.centerRight,
                child: TextButton.icon(
                  onPressed: () => setState(() => _products.removeAt(index).dispose()),
                  icon: const Icon(Icons.delete_outline, size: 18),
                  label: const Text('Remove'),
                  style: TextButton.styleFrom(foregroundColor: Theme.of(context).colorScheme.error),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _customerSection() {
    final st = _cubit.state;
    final disabled = _fieldsDisabled;
    return _card([
      TextField(
        controller: _phone,
        keyboardType: TextInputType.phone,
        onChanged: _onPhoneChanged,
        decoration: const InputDecoration(
          labelText: 'Phone (search existing customer)',
          prefixIcon: Icon(Icons.search),
        ),
      ),
      if (_customerMatches.isNotEmpty && !_customerFound)
        Container(
          margin: const EdgeInsets.only(top: 6),
          decoration: BoxDecoration(
            border: Border.all(color: Theme.of(context).dividerColor),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Column(
            children: _customerMatches
                .map((c) => ListTile(
                      dense: true,
                      title: Text(c.name),
                      subtitle: Text(c.phone),
                      onTap: () => _selectCustomer(c),
                    ))
                .toList(),
          ),
        ),
      if (_customerFound)
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Row(
            children: [
              Chip(
                label: const Text('Existing customer — auto-filled'),
                visualDensity: VisualDensity.compact,
                backgroundColor: Colors.green.withValues(alpha: 0.15),
              ),
              const Spacer(),
              TextButton(onPressed: _clearCustomer, child: const Text('Clear & edit')),
            ],
          ),
        ),
      const SizedBox(height: 10),
      _text(_name, 'Customer name', enabled: !disabled),
      const SizedBox(height: 10),
      _text(_altPhone, 'Alternate phone', keyboard: TextInputType.phone, enabled: !disabled),
      const SizedBox(height: 10),
      _text(_address, 'Address', maxLines: 2, enabled: !disabled),
      const SizedBox(height: 10),
      _dropdown<int>(
        label: 'Division',
        value: _divisionId,
        items: st.refs!.divisions.map((d) => DropdownMenuItem(value: d.id, child: Text(d.name))).toList(),
        onChanged: disabled
            ? null
            : (v) {
                setState(() {
                  _divisionId = v;
                  _districtId = null;
                  _upazilaId = null;
                });
                if (v != null) _cubit.loadDistricts(v);
              },
      ),
      const SizedBox(height: 10),
      _dropdown<int>(
        label: 'District',
        value: _districtId,
        items: st.districts.map((d) => DropdownMenuItem(value: d.id, child: Text(d.name))).toList(),
        onChanged: disabled
            ? null
            : (v) {
                setState(() {
                  _districtId = v;
                  _upazilaId = null;
                });
                if (v != null) _cubit.loadUpazilas(v);
              },
      ),
      const SizedBox(height: 10),
      _dropdown<int>(
        label: 'Upazila / Thana',
        value: _upazilaId,
        items: st.upazilas.map((d) => DropdownMenuItem(value: d.id, child: Text(d.name))).toList(),
        onChanged: disabled ? null : (v) => setState(() => _upazilaId = v),
      ),
      const SizedBox(height: 10),
      _text(_facebook, 'Facebook ID', enabled: !disabled),
    ]);
  }

  void _onPhoneChanged(String value) {
    _phoneDebounce?.cancel();
    final q = value.trim();
    if (q.length < 3) {
      setState(() => _customerMatches = const []);
      return;
    }
    _phoneDebounce = Timer(const Duration(milliseconds: 400), () async {
      final matches = await _cubit.searchCustomers(q);
      if (mounted) setState(() => _customerMatches = matches);
    });
  }

  void _selectCustomer(CustomerMatch c) {
    setState(() {
      _phone.text = c.phone;
      _name.text = c.name;
      _facebook.text = c.facebook ?? '';
      _altPhone.text = c.altPhone ?? '';
      _address.text = c.address ?? '';
      _divisionId = c.divisionId;
      _districtId = c.districtId;
      _upazilaId = c.upazilaId;
      _fieldsDisabled = true;
      _customerFound = true;
      _customerMatches = const [];
    });
    if (c.divisionId != null) _cubit.loadDistricts(c.divisionId!);
    if (c.districtId != null) _cubit.loadUpazilas(c.districtId!);
  }

  void _clearCustomer() => setState(() {
        _fieldsDisabled = false;
        _customerFound = false;
      });

  Widget _merchantSection() => _card([_text(_merchantRef, 'Reference number')]);

  Widget _deliverySection(FormRefs refs) {
    return _card([
      _dropdown<int>(
        label: 'Delivery channel',
        value: _channelId,
        items: refs.deliveryChannels.map((c) => DropdownMenuItem(value: c.id, child: Text(c.name))).toList(),
        onChanged: (v) => setState(() => _channelId = v),
      ),
      const SizedBox(height: 10),
      InkWell(
        onTap: _pickDate,
        child: InputDecorator(
          decoration: const InputDecoration(labelText: 'Delivery date'),
          child: Text(_deliveryDate == null ? 'Select date' : fmtDate(_deliveryDate),
              style: TextStyle(color: _deliveryDate == null ? Theme.of(context).hintColor : null)),
        ),
      ),
      const SizedBox(height: 10),
      TextField(
        controller: _charge,
        keyboardType: TextInputType.number,
        onChanged: (_) => setState(() {}),
        decoration: const InputDecoration(labelText: 'Delivery charge (BDT)'),
      ),
    ]);
  }

  Widget _imagesSection() {
    return _card([
      Row(
        children: [
          const Expanded(child: Text('Photos', style: TextStyle(fontWeight: FontWeight.bold))),
          IconButton(icon: const Icon(Icons.photo_library_outlined), onPressed: () => _addImage(ImageSource.gallery)),
          IconButton(icon: const Icon(Icons.photo_camera_outlined), onPressed: () => _addImage(ImageSource.camera)),
        ],
      ),
      if (widget.isEdit && _existingImages.isNotEmpty)
        Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text('${_existingImages.length} existing photo(s) will be kept.',
              style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12)),
        ),
      if (_newImages.isNotEmpty)
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: _newImages.asMap().entries.map((e) {
            return Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.file(File(e.value.path), width: 72, height: 72, fit: BoxFit.cover),
                ),
                Positioned(
                  right: 0,
                  child: GestureDetector(
                    onTap: () => setState(() => _newImages.removeAt(e.key)),
                    child: const CircleAvatar(radius: 11, backgroundColor: Colors.black54, child: Icon(Icons.close, size: 14, color: Colors.white)),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
    ]);
  }

  Widget _submitBar() {
    final submitting = _cubit.state.submitting;
    return Material(
      elevation: 8,
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 12),
          child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Grand total', style: TextStyle(color: Theme.of(context).hintColor, fontSize: 12)),
                  Text(fmtBDT(_grandTotal), style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            FilledButton(
              onPressed: submitting ? null : _submit,
              style: FilledButton.styleFrom(minimumSize: const Size(140, 48)),
              child: submitting
                  ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                    : Text(widget.isEdit ? 'Update order' : 'Create order'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  Future<void> _pickDate() async {
    final now = DateTime.now();
    // The web disables today and past — delivery must be tomorrow or later.
    final tomorrow = DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final initial =
        (_deliveryDate != null && !_deliveryDate!.isBefore(tomorrow)) ? _deliveryDate! : tomorrow;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: tomorrow,
      lastDate: DateTime(now.year + 2),
    );
    if (picked != null) setState(() => _deliveryDate = picked);
  }

  Future<void> _addImage(ImageSource source) async {
    if (_existingImages.length + _newImages.length >= 7) {
      _snack('You can attach up to 7 photos.');
      return;
    }
    final file = await _picker.pickImage(source: source, imageQuality: 70);
    if (file != null) setState(() => _newImages.add(file));
  }

  Future<void> _pickFabric(_ProductRow row) async {
    final selected = await showModalBottomSheet<FabricColor>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      builder: (_) => _FabricPicker(search: _cubit.searchFabrics),
    );
    if (selected != null) {
      setState(() {
        row.fabricColorId = selected.id;
        row.fabricColorName = selected.name;
      });
    }
  }

  String? _validate() {
    if (_partyId == null) return _isMarketplace ? 'Select a marketplace.' : 'Select a merchant.';
    if (!_isMarketplace && _merchantRef.text.trim().isEmpty) return 'Enter a reference number.';
    if (_isMarketplace) {
      if (_name.text.trim().isEmpty) return 'Enter the customer name.';
      if (_phone.text.trim().isEmpty) return 'Enter a phone number.';
      if (_altPhone.text.trim().isEmpty) return 'Enter an alternate phone number.';
      if (_facebook.text.trim().isEmpty) return 'Enter the Facebook ID.';
      if (_address.text.trim().isEmpty) return 'Enter the address.';
      if (_divisionId == null || _districtId == null || _upazilaId == null) {
        return 'Complete the division, district and upazila.';
      }
    }
    for (var i = 0; i < _products.length; i++) {
      final p = _products[i];
      if (p.productTypeId == null || p.fabricColorId == null || p.fabricTypeId == null ||
          (double.tryParse(p.price.text) ?? 0) <= 0 || p.desc.text.trim().isEmpty) {
        return 'Complete product ${i + 1} (type, fabric, price, description).';
      }
    }
    if (_channelId == null) return 'Select a delivery channel.';
    if (_deliveryDate == null) return 'Select a delivery date.';
    return null;
  }

  Future<void> _submit() async {
    final error = _validate();
    if (error != null) {
      _snack(error);
      return;
    }

    final fields = <String, dynamic>{
      'deliveryChannel': _channelId,
      'deliveryCharge': double.tryParse(_charge.text) ?? 0,
      'deliveryDate': DateFormat('yyyy-MM-dd').format(_deliveryDate!),
      'products': _products
          .map((p) => {
                'productType': p.productTypeId,
                'fabrics': p.fabricColorId,
                'fabricType': p.fabricTypeId,
                'quantity': p.qty,
                'price': double.tryParse(p.price.text) ?? 0,
                'productDescription': p.desc.text.trim(),
              })
          .toList(),
      if (_isMarketplace) ...{
        'marketplace': _partyId,
        'name': _name.text.trim(),
        'phone': _phone.text.trim(),
        'altPhone': _altPhone.text.trim(),
        'address': _address.text.trim(),
        'division': _divisionId,
        'district': _districtId,
        'upazila': _upazilaId,
        'facebookId': _facebook.text.trim(),
      } else ...{
        'merchant': _partyId,
        'merchantRef': _merchantRef.text.trim(),
      },
    };

    // Edit keeps the original creator (the update service derives team_id from it).
    final createdBy =
        widget.isEdit ? asInt(_cubit.state.prefill?['createdBy'], widget.userId) : widget.userId;
    final err = await _cubit.submit(
      fields: fields,
      existingImages: _existingImages,
      newImagePaths: _newImages.map((x) => x.path).toList(),
      createdBy: createdBy,
    );
    if (!mounted) return;
    if (err == null) {
      Navigator.pop(context, true);
      _snack(widget.isEdit ? 'Order updated' : 'Order created');
    } else {
      _snack(err);
    }
  }

  void _snack(String msg) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(msg)));
  }

  // ── Small builders ───────────────────────────────────────────────────────

  Widget _card(List<Widget> children) => Card(
        margin: EdgeInsets.zero,
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: children),
        ),
      );

  Widget _sectionLabel(String text) => Text(text.toUpperCase(),
      style: TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Theme.of(context).hintColor, letterSpacing: 0.4));

  Widget _text(TextEditingController c, String label,
          {int maxLines = 1, TextInputType? keyboard, bool enabled = true}) =>
      TextField(
        controller: c,
        maxLines: maxLines,
        keyboardType: keyboard,
        enabled: enabled,
        decoration: InputDecoration(labelText: label),
      );

  Widget _dropdown<T>({
    required String label,
    required T? value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?>? onChanged,
  }) {
    // Clamp the value to the available items (edit prefill loads before the geo
    // lists), and key on it so the FormField reflects programmatic resets.
    final safe = items.any((i) => i.value == value) ? value : null;
    return DropdownButtonFormField<T>(
      key: ValueKey('$label-$safe-${items.length}'),
      initialValue: safe,
      isExpanded: true,
      decoration: InputDecoration(labelText: label),
      items: items,
      onChanged: onChanged,
    );
  }
}

class _QtyStepper extends StatelessWidget {
  const _QtyStepper({required this.qty, required this.onChanged});
  final int qty;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Theme.of(context).dividerColor),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.remove, size: 18),
            onPressed: qty > 1 ? () => onChanged(qty - 1) : null,
          ),
          Text('$qty', style: const TextStyle(fontWeight: FontWeight.w600)),
          IconButton(icon: const Icon(Icons.add, size: 18), onPressed: () => onChanged(qty + 1)),
        ],
      ),
    );
  }
}

class _FabricPicker extends StatefulWidget {
  const _FabricPicker({required this.search});
  final Future<List<FabricColor>> Function(String) search;

  @override
  State<_FabricPicker> createState() => _FabricPickerState();
}

class _FabricPickerState extends State<_FabricPicker> {
  List<FabricColor> _results = const [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _query('');
  }

  Future<void> _query(String q) async {
    setState(() => _loading = true);
    final r = await widget.search(q);
    if (mounted) {
      setState(() {
        _results = r;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: SizedBox(
        height: MediaQuery.of(context).size.height * 0.6,
        child: SafeArea(
          top: false,
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: TextField(
                  autofocus: true,
                  onChanged: _query,
                  decoration: const InputDecoration(hintText: 'Search fabric colour…', prefixIcon: Icon(Icons.search)),
                ),
              ),
              Expanded(
                child: _loading
                    ? const Center(child: CircularProgressIndicator())
                    : ListView.builder(
                        itemCount: _results.length,
                        itemBuilder: (_, i) => ListTile(
                          title: Text(_results[i].name),
                          onTap: () => Navigator.pop(context, _results[i]),
                        ),
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
