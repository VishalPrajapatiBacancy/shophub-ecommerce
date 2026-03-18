import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/order_model.dart';
import 'package:e_commerce/providers/order_provider.dart';
import 'package:e_commerce/services/order_service.dart';

@RoutePage()
class OrderDetailScreen extends StatefulWidget {
  final String orderId;

  const OrderDetailScreen({super.key, @PathParam('orderId') required this.orderId});

  @override
  State<OrderDetailScreen> createState() => _OrderDetailScreenState();
}

class _OrderDetailScreenState extends State<OrderDetailScreen> {
  final _service = OrderService();
  OrderModel? _order;
  bool _loading = true;

  static const _steps = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final o = await _service.getOrderById(widget.orderId);
      if (mounted) setState(() { _order = o; _loading = false; });
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
        title: Text(_order != null ? 'Order #${_order!.orderNumber}' : 'Order Details'),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _order == null
              ? const Center(child: Text('Order not found'))
              : _buildContent(),
    );
  }

  Widget _buildContent() {
    final o = _order!;
    return ListView(
      padding: const EdgeInsets.all(12),
      children: [
        _buildStatusStepper(o),
        const SizedBox(height: 12),
        _buildItems(o),
        const SizedBox(height: 12),
        if (o.shippingAddress != null) _buildDeliveryAddress(o),
        const SizedBox(height: 12),
        _buildPaymentInfo(o),
        const SizedBox(height: 12),
        _buildPriceBreakdown(o),
        const SizedBox(height: 12),
        if (o.isCancellable) _buildCancelButton(o),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _buildStatusStepper(OrderModel o) {
    final currentStep = _steps.indexOf(o.status.toLowerCase());
    final isCancelled = o.status.toLowerCase() == 'cancelled';

    return _Card(
      title: 'Order Status',
      child: isCancelled
          ? Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.errorContainer,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: const [
                  Icon(Icons.cancel, color: AppColors.error),
                  SizedBox(width: 8),
                  Text('Order Cancelled', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                ],
              ),
            )
          : Column(
              children: List.generate(_steps.length, (i) {
                final done = currentStep >= i;
                final active = currentStep == i;
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Column(
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          width: 24,
                          height: 24,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: done ? AppColors.primary : AppColors.outline,
                          ),
                          child: Icon(
                            done ? Icons.check : Icons.circle_outlined,
                            size: 14,
                            color: done ? Colors.white : AppColors.onSurfaceVariant,
                          ),
                        ),
                        if (i < _steps.length - 1)
                          Container(width: 2, height: 28, color: done ? AppColors.primary : AppColors.outline),
                      ],
                    ),
                    const SizedBox(width: 12),
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        _stepLabel(_steps[i]),
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: active ? FontWeight.bold : FontWeight.normal,
                          color: done ? AppColors.onBackground : AppColors.onSurfaceVariant,
                        ),
                      ),
                    ),
                  ],
                );
              }),
            ),
    );
  }

  Widget _buildItems(OrderModel o) {
    return _Card(
      title: 'Items (${o.items.length})',
      child: Column(
        children: o.items.map((item) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 6),
          child: Row(
            children: [
              if (item.image != null && item.image!.isNotEmpty)
                ClipRRect(
                  borderRadius: BorderRadius.circular(6),
                  child: CachedNetworkImage(
                    imageUrl: item.image!,
                    width: 56,
                    height: 56,
                    fit: BoxFit.cover,
                    errorWidget: (_, __, ___) => Container(
                      width: 56, height: 56,
                      color: AppColors.surfaceVariant,
                      child: const Icon(Icons.image_outlined, color: AppColors.onSurfaceVariant, size: 20),
                    ),
                  ),
                )
              else
                Container(
                  width: 56, height: 56,
                  decoration: BoxDecoration(color: AppColors.surfaceVariant, borderRadius: BorderRadius.circular(6)),
                  child: const Icon(Icons.shopping_bag_outlined, color: AppColors.onSurfaceVariant, size: 20),
                ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name ?? 'Product',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                    ),
                    Text(
                      'Qty: ${item.quantity} x ₹${item.price.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant),
                    ),
                  ],
                ),
              ),
              Text(
                '₹${item.totalPrice.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
              ),
            ],
          ),
        )).toList(),
      ),
    );
  }

  Widget _buildDeliveryAddress(OrderModel o) {
    final addr = o.shippingAddress!;
    return _Card(
      title: 'Delivery Address',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(addr['fullName']?.toString() ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const SizedBox(height: 4),
          Text(
            [addr['line1'], addr['line2'], addr['city'], addr['state'], addr['postalCode']]
                .where((e) => e != null && e.toString().isNotEmpty)
                .join(', '),
            style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
          ),
          if (addr['phone'] != null)
            Text(addr['phone'].toString(), style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
        ],
      ),
    );
  }

  Widget _buildPaymentInfo(OrderModel o) {
    return _Card(
      title: 'Payment',
      child: Row(
        children: [
          Icon(_paymentIcon(o.paymentMethod), color: AppColors.primary),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_paymentLabel(o.paymentMethod), style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
              Text(
                o.paymentStatus[0].toUpperCase() + o.paymentStatus.substring(1),
                style: TextStyle(
                  fontSize: 12,
                  color: o.paymentStatus == 'paid' ? AppColors.success : AppColors.warning,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceBreakdown(OrderModel o) {
    return _Card(
      title: 'Price Breakdown',
      child: Column(
        children: [
          _SummaryRow(label: 'Subtotal', value: '₹${o.subtotal.toStringAsFixed(0)}'),
          if (o.discount > 0)
            _SummaryRow(label: 'Discount', value: '-₹${o.discount.toStringAsFixed(0)}', valueColor: AppColors.success),
          if (o.tax > 0) _SummaryRow(label: 'Tax', value: '₹${o.tax.toStringAsFixed(0)}'),
          _SummaryRow(
            label: 'Shipping',
            value: o.shipping == 0 ? 'FREE' : '₹${o.shipping.toStringAsFixed(0)}',
            valueColor: o.shipping == 0 ? AppColors.success : null,
          ),
          const Divider(),
          _SummaryRow(label: 'Total', value: '₹${o.total.toStringAsFixed(0)}', isBold: true),
        ],
      ),
    );
  }

  Widget _buildCancelButton(OrderModel o) {
    return Consumer<OrderProvider>(
      builder: (ctx, provider, _) => SizedBox(
        width: double.infinity,
        height: 48,
        child: OutlinedButton(
          onPressed: () async {
            final confirm = await showDialog<bool>(
              context: ctx,
              builder: (_) => AlertDialog(
                title: const Text('Cancel Order'),
                content: const Text('Are you sure you want to cancel this order?'),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('No')),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(ctx, true),
                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
                    child: const Text('Yes, Cancel'),
                  ),
                ],
              ),
            );
            if (confirm == true) {
              await provider.cancelOrder(o.id);
              if (mounted) {
                context.maybePop();
              }
            }
          },
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.error,
            side: const BorderSide(color: AppColors.error),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          ),
          child: const Text('Cancel Order', style: TextStyle(fontSize: 16)),
        ),
      ),
    );
  }

  String _stepLabel(String s) {
    switch (s) {
      case 'placed': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      default: return s[0].toUpperCase() + s.substring(1);
    }
  }

  IconData _paymentIcon(String method) {
    switch (method.toLowerCase()) {
      case 'upi': return Icons.account_balance_wallet_outlined;
      case 'card': return Icons.credit_card;
      default: return Icons.money;
    }
  }

  String _paymentLabel(String method) {
    switch (method.toLowerCase()) {
      case 'cod': return 'Cash on Delivery';
      case 'upi': return 'UPI';
      case 'card': return 'Card';
      default: return method;
    }
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

class _Card extends StatelessWidget {
  final String title;
  final Widget child;

  const _Card({required this.title, required this.child});

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

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;

  const _SummaryRow({required this.label, required this.value, this.isBold = false, this.valueColor});

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
