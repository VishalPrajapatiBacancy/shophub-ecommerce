import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';

import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/address_model.dart';
import 'package:e_commerce/services/address_service.dart';

@RoutePage()
class AddressManagementScreen extends StatefulWidget {
  /// If true, tapping an address returns it to the caller instead of navigating away.
  final bool returnAddress;

  const AddressManagementScreen({super.key, this.returnAddress = false});

  @override
  State<AddressManagementScreen> createState() => _AddressManagementScreenState();
}

class _AddressManagementScreenState extends State<AddressManagementScreen> {
  final _service = AddressService();
  List<AddressModel> _addresses = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await _service.getAddresses();
      if (mounted) setState(() { _addresses = list; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text('My Addresses'),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showAddressSheet(context),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add),
        label: const Text('Add Address'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _addresses.isEmpty
              ? _buildEmpty()
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.fromLTRB(12, 12, 12, 80),
                    itemCount: _addresses.length,
                    itemBuilder: (_, i) => _AddressCard(
                      address: _addresses[i],
                      returnAddress: widget.returnAddress,
                      onSetDefault: () => _setDefault(_addresses[i].id),
                      onEdit: () => _showAddressSheet(context, address: _addresses[i]),
                      onDelete: () => _deleteAddress(_addresses[i].id),
                      onSelect: widget.returnAddress
                          ? () => Navigator.of(context).pop(_addresses[i])
                          : null,
                    ),
                  ),
                ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.location_off_outlined, size: 96, color: AppColors.onSurfaceVariant),
          const SizedBox(height: 16),
          const Text(
            'No saved addresses',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 8),
          const Text('Add a delivery address to get started',
              style: TextStyle(color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  Future<void> _setDefault(String id) async {
    try {
      await _service.setDefault(id);
      final list = await _service.getAddresses();
      if (mounted) setState(() => _addresses = list);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  Future<void> _deleteAddress(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Delete Address'),
        content: const Text('Are you sure you want to delete this address?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirm == true) {
      try {
        await _service.deleteAddress(id);
        if (mounted) setState(() => _addresses.removeWhere((a) => a.id == id));
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
          );
        }
      }
    }
  }

  void _showAddressSheet(BuildContext context, {AddressModel? address}) {
    final formKey = GlobalKey<FormState>();
    final fullNameCtrl = TextEditingController(text: address?.fullName ?? '');
    final phoneCtrl = TextEditingController(text: address?.phone ?? '');
    final line1Ctrl = TextEditingController(text: address?.line1 ?? '');
    final line2Ctrl = TextEditingController(text: address?.line2 ?? '');
    final cityCtrl = TextEditingController(text: address?.city ?? '');
    final stateCtrl = TextEditingController(text: address?.state ?? '');
    final postalCtrl = TextEditingController(text: address?.postalCode ?? '');
    bool isDefault = address?.isDefault ?? false;
    final isEditing = address != null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(16))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Form(
              key: formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isEditing ? 'Edit Address' : 'Add New Address',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(ctx)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  _Field(ctrl: fullNameCtrl, label: 'Full Name', required: true),
                  _Field(ctrl: phoneCtrl, label: 'Phone Number', required: true, keyboardType: TextInputType.phone),
                  _Field(ctrl: line1Ctrl, label: 'Address Line 1', required: true),
                  _Field(ctrl: line2Ctrl, label: 'Address Line 2 (optional)'),
                  Row(
                    children: [
                      Expanded(child: _Field(ctrl: cityCtrl, label: 'City', required: true)),
                      const SizedBox(width: 12),
                      Expanded(child: _Field(ctrl: stateCtrl, label: 'State', required: true)),
                    ],
                  ),
                  _Field(ctrl: postalCtrl, label: 'Postal Code', required: true, keyboardType: TextInputType.number),
                  Row(
                    children: [
                      Checkbox(
                        value: isDefault,
                        onChanged: (v) => setSheet(() => isDefault = v ?? false),
                        activeColor: AppColors.primary,
                      ),
                      const Text('Set as default address'),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (!formKey.currentState!.validate()) return;
                        final model = AddressModel(
                          id: address?.id ?? '',
                          fullName: fullNameCtrl.text.trim(),
                          phone: phoneCtrl.text.trim(),
                          line1: line1Ctrl.text.trim(),
                          line2: line2Ctrl.text.trim().isEmpty ? null : line2Ctrl.text.trim(),
                          city: cityCtrl.text.trim(),
                          state: stateCtrl.text.trim(),
                          postalCode: postalCtrl.text.trim(),
                          isDefault: isDefault,
                        );
                        try {
                          if (isEditing) {
                            final updated = await _service.updateAddress(address!.id, model);
                            if (!mounted) return;
                            Navigator.pop(ctx);
                            final idx = _addresses.indexWhere((a) => a.id == address.id);
                            if (idx >= 0) setState(() => _addresses[idx] = updated);
                          } else {
                            final created = await _service.createAddress(model);
                            if (!mounted) return;
                            Navigator.pop(ctx);
                            setState(() => _addresses.add(created));
                          }
                        } catch (e) {
                          if (!mounted) return;
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Failed: $e'), backgroundColor: AppColors.error),
                          );
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                      child: Text(isEditing ? 'Update Address' : 'Save Address',
                          style: const TextStyle(fontSize: 16)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Address Card ─────────────────────────────────────────────────────────────

class _AddressCard extends StatelessWidget {
  final AddressModel address;
  final bool returnAddress;
  final VoidCallback onSetDefault;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  final VoidCallback? onSelect;

  const _AddressCard({
    required this.address,
    required this.returnAddress,
    required this.onSetDefault,
    required this.onEdit,
    required this.onDelete,
    this.onSelect,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: address.isDefault ? AppColors.primary : AppColors.outline),
        boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 1))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(address.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              ),
              if (address.isDefault)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.primaryContainer,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('Default', style: TextStyle(fontSize: 11, color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
            ],
          ),
          const SizedBox(height: 4),
          Text(address.phone, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 2),
          Text(address.displayAddress, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
          const SizedBox(height: 10),
          Row(
            children: [
              if (!address.isDefault)
                TextButton(
                  onPressed: onSetDefault,
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    minimumSize: Size.zero,
                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  ),
                  child: const Text('Set Default', style: TextStyle(fontSize: 12)),
                ),
              TextButton(
                onPressed: onEdit,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Edit', style: TextStyle(fontSize: 12)),
              ),
              TextButton(
                onPressed: onDelete,
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.error,
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: const Text('Delete', style: TextStyle(fontSize: 12)),
              ),
              if (returnAddress && onSelect != null) ...[
                const Spacer(),
                ElevatedButton(
                  onPressed: onSelect,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  ),
                  child: const Text('Deliver Here', style: TextStyle(fontSize: 12)),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Form Field ───────────────────────────────────────────────────────────────

class _Field extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final bool required;
  final TextInputType? keyboardType;

  const _Field({
    required this.ctrl,
    required this.label,
    this.required = false,
    this.keyboardType,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        decoration: InputDecoration(
          labelText: label,
          border: const OutlineInputBorder(),
          isDense: true,
          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
        validator: required ? (v) => (v == null || v.trim().isEmpty) ? '$label is required' : null : null,
      ),
    );
  }
}
