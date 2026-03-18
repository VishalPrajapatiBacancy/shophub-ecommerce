import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/address_model.dart';
import 'package:e_commerce/models/coupon_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/providers/order_provider.dart';
import 'package:e_commerce/services/address_service.dart';
import 'package:e_commerce/services/coupon_service.dart';

@RoutePage()
class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressService = AddressService();
  final _couponService = CouponService();

  int _step = 0; // 0: Address, 1: Review & Pay
  List<AddressModel> _addresses = [];
  AddressModel? _selectedAddress;
  bool _loadingAddresses = true;

  CouponModel? _coupon;
  bool _applyingCoupon = false;
  final _couponCtrl = TextEditingController();

  String _paymentMethod = 'cod';

  @override
  void initState() {
    super.initState();
    _loadAddresses();
  }

  @override
  void dispose() {
    _couponCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAddresses() async {
    try {
      final list = await _addressService.getAddresses();
      if (mounted) {
        setState(() {
          _addresses = list;
          _selectedAddress = list.firstWhere((a) => a.isDefault, orElse: () => list.isNotEmpty ? list.first : _selectedAddress!);
          _loadingAddresses = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loadingAddresses = false);
    }
  }

  Future<void> _applyCoupon(double subtotal) async {
    final code = _couponCtrl.text.trim();
    if (code.isEmpty) return;
    setState(() => _applyingCoupon = true);
    try {
      final coupon = await _couponService.validateCoupon(code, subtotal);
      if (mounted) setState(() { _coupon = coupon; _applyingCoupon = false; });
    } catch (e) {
      if (mounted) {
        setState(() => _applyingCoupon = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Invalid coupon: $e'), backgroundColor: AppColors.error),
        );
      }
    }
  }

  Future<void> _placeOrder(BuildContext context) async {
    if (_selectedAddress == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a delivery address')),
      );
      return;
    }
    final cart = context.read<CartProvider>();
    final orderProvider = context.read<OrderProvider>();
    final order = await orderProvider.placeOrder(
      items: cart.items,
      shippingAddress: _selectedAddress!,
      paymentMethod: _paymentMethod,
      couponCode: _coupon?.code,
    );
    if (!mounted) return;
    if (order != null) {
      await cart.clearCart();
      context.router.replace(OrderSuccessRoute(orderId: order.id, orderNumber: order.orderNumber));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(orderProvider.error ?? 'Failed to place order'),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: Text(_step == 0 ? 'Delivery Address' : 'Review & Pay'),
      ),
      body: _step == 0 ? _buildAddressStep() : _buildReviewStep(),
      bottomNavigationBar: _buildBottomBar(context),
    );
  }

  Widget _buildAddressStep() {
    if (_loadingAddresses) {
      return const Center(child: CircularProgressIndicator(color: AppColors.primary));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_addresses.isEmpty)
          Container(
            padding: const EdgeInsets.all(20),
            alignment: Alignment.center,
            child: Column(
              children: [
                const Icon(Icons.location_off, size: 48, color: AppColors.onSurfaceVariant),
                const SizedBox(height: 12),
                const Text('No saved addresses', style: TextStyle(color: AppColors.onSurfaceVariant)),
              ],
            ),
          )
        else ...[
          const Text(
            'Saved Addresses',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 12),
          ..._addresses.map((addr) => _AddressCard(
                address: addr,
                selected: _selectedAddress?.id == addr.id,
                onSelect: () => setState(() => _selectedAddress = addr),
              )),
        ],
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: () => _showAddAddressSheet(),
          icon: const Icon(Icons.add),
          label: const Text('Add New Address'),
          style: OutlinedButton.styleFrom(foregroundColor: AppColors.primary),
        ),
      ],
    );
  }

  Widget _buildReviewStep() {
    return Consumer<CartProvider>(
      builder: (ctx, cart, _) {
        final discount = _coupon?.discountAmount ?? 0.0;
        final subtotal = cart.subtotal;
        final shipping = cart.shipping;
        final total = subtotal - discount + shipping;

        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Delivery address
            _SectionCard(
              title: 'Delivering to',
              child: _selectedAddress == null
                  ? const Text('No address selected')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _selectedAddress!.fullName,
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 2),
                        Text(_selectedAddress!.displayAddress,
                            style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 13)),
                        Text(_selectedAddress!.phone,
                            style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 13)),
                      ],
                    ),
            ),
            const SizedBox(height: 12),
            // Items summary
            _SectionCard(
              title: 'Order Items (${cart.itemCount})',
              child: Column(
                children: cart.items.map((item) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(item.name, maxLines: 1, overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 13)),
                      ),
                      Text('x${item.quantity}', style: const TextStyle(color: AppColors.onSurfaceVariant, fontSize: 12)),
                      const SizedBox(width: 8),
                      Text('₹${item.totalPrice.toStringAsFixed(0)}',
                          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                )).toList(),
              ),
            ),
            const SizedBox(height: 12),
            // Coupon
            _SectionCard(
              title: 'Coupon Code',
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _couponCtrl,
                      textCapitalization: TextCapitalization.characters,
                      decoration: const InputDecoration(
                        hintText: 'Enter coupon code',
                        isDense: true,
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  _applyingCoupon
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                        )
                      : ElevatedButton(
                          onPressed: _coupon != null
                              ? () => setState(() { _coupon = null; _couponCtrl.clear(); })
                              : () => _applyCoupon(subtotal),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _coupon != null ? AppColors.error : AppColors.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          ),
                          child: Text(_coupon != null ? 'Remove' : 'Apply'),
                        ),
                ],
              ),
            ),
            if (_coupon != null) ...[
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.successContainer,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.check_circle, size: 16, color: AppColors.success),
                    const SizedBox(width: 8),
                    Text(
                      '${_coupon!.code} applied: -₹${_coupon!.discountAmount.toStringAsFixed(0)}',
                      style: const TextStyle(color: AppColors.success, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 12),
            // Payment method
            _SectionCard(
              title: 'Payment Method',
              child: Column(
                children: [
                  _PaymentOption(value: 'cod', label: 'Cash on Delivery', icon: Icons.money, selected: _paymentMethod, onChanged: (v) => setState(() => _paymentMethod = v!)),
                  _PaymentOption(value: 'upi', label: 'UPI', icon: Icons.account_balance_wallet_outlined, selected: _paymentMethod, onChanged: (v) => setState(() => _paymentMethod = v!)),
                  _PaymentOption(value: 'card', label: 'Credit / Debit Card', icon: Icons.credit_card, selected: _paymentMethod, onChanged: (v) => setState(() => _paymentMethod = v!)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            // Price summary
            _SectionCard(
              title: 'Price Details',
              child: Column(
                children: [
                  _SummaryRow(label: 'Subtotal', value: '₹${subtotal.toStringAsFixed(0)}'),
                  if (discount > 0) _SummaryRow(label: 'Coupon Discount', value: '-₹${discount.toStringAsFixed(0)}', valueColor: AppColors.success),
                  _SummaryRow(label: 'Shipping', value: shipping == 0 ? 'FREE' : '₹${shipping.toStringAsFixed(0)}', valueColor: shipping == 0 ? AppColors.success : null),
                  const Divider(),
                  _SummaryRow(label: 'Total', value: '₹${total.toStringAsFixed(0)}', isBold: true),
                ],
              ),
            ),
            const SizedBox(height: 80),
          ],
        );
      },
    );
  }

  Widget _buildBottomBar(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Consumer<OrderProvider>(
        builder: (ctx, order, _) => SizedBox(
          height: 48,
          child: ElevatedButton(
            onPressed: order.isPlacing
                ? null
                : () {
                    if (_step == 0) {
                      if (_selectedAddress == null) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Select a delivery address')),
                        );
                        return;
                      }
                      setState(() => _step = 1);
                    } else {
                      _placeOrder(ctx);
                    }
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
            child: order.isPlacing
                ? const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                  )
                : Text(
                    _step == 0 ? 'Continue' : 'Place Order',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
          ),
        ),
      ),
    );
  }

  void _showAddAddressSheet() {
    final formKey = GlobalKey<FormState>();
    final fullNameCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final line1Ctrl = TextEditingController();
    final line2Ctrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final stateCtrl = TextEditingController();
    final postalCtrl = TextEditingController();
    bool isDefault = false;

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
                  const Text('Add New Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  _AddressField(ctrl: fullNameCtrl, label: 'Full Name', required: true),
                  _AddressField(ctrl: phoneCtrl, label: 'Phone', required: true, keyboardType: TextInputType.phone),
                  _AddressField(ctrl: line1Ctrl, label: 'Address Line 1', required: true),
                  _AddressField(ctrl: line2Ctrl, label: 'Address Line 2 (optional)'),
                  Row(
                    children: [
                      Expanded(child: _AddressField(ctrl: cityCtrl, label: 'City', required: true)),
                      const SizedBox(width: 12),
                      Expanded(child: _AddressField(ctrl: stateCtrl, label: 'State', required: true)),
                    ],
                  ),
                  _AddressField(ctrl: postalCtrl, label: 'Postal Code', required: true, keyboardType: TextInputType.number),
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
                    height: 48,
                    child: ElevatedButton(
                      onPressed: () async {
                        if (!formKey.currentState!.validate()) return;
                        try {
                          final addr = await _addressService.createAddress(AddressModel(
                            id: '',
                            fullName: fullNameCtrl.text.trim(),
                            phone: phoneCtrl.text.trim(),
                            line1: line1Ctrl.text.trim(),
                            line2: line2Ctrl.text.trim().isEmpty ? null : line2Ctrl.text.trim(),
                            city: cityCtrl.text.trim(),
                            state: stateCtrl.text.trim(),
                            postalCode: postalCtrl.text.trim(),
                            isDefault: isDefault,
                          ));
                          if (!mounted) return;
                          Navigator.pop(ctx);
                          setState(() {
                            _addresses.add(addr);
                            _selectedAddress = addr;
                          });
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
                      child: const Text('Save Address', style: TextStyle(fontSize: 16)),
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

// ─── Helper Widgets ───────────────────────────────────────────────────────────

class _AddressCard extends StatelessWidget {
  final AddressModel address;
  final bool selected;
  final VoidCallback onSelect;

  const _AddressCard({required this.address, required this.selected, required this.onSelect});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onSelect,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: selected ? AppColors.primary : AppColors.outline,
            width: selected ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Radio<bool>(
              value: true,
              groupValue: selected,
              onChanged: (_) => onSelect(),
              activeColor: AppColors.primary,
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(address.fullName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                      if (address.isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primaryContainer,
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: const Text('Default', style: TextStyle(fontSize: 10, color: AppColors.primary)),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(address.displayAddress,
                      style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                  Text(address.phone, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 1))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.onBackground)),
          const SizedBox(height: 10),
          child,
        ],
      ),
    );
  }
}

class _PaymentOption extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final String selected;
  final ValueChanged<String?> onChanged;

  const _PaymentOption({
    required this.value,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return RadioListTile<String>(
      value: value,
      groupValue: selected,
      onChanged: onChanged,
      activeColor: AppColors.primary,
      contentPadding: EdgeInsets.zero,
      title: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.onSurfaceVariant),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}

class _AddressField extends StatelessWidget {
  final TextEditingController ctrl;
  final String label;
  final bool required;
  final TextInputType? keyboardType;

  const _AddressField({
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

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: isBold ? 15 : 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: AppColors.onBackground,
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: isBold ? 15 : 13,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
              color: valueColor ?? AppColors.onBackground,
            ),
          ),
        ],
      ),
    );
  }
}
