import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/cart_item_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';

@RoutePage()
class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: Consumer<CartProvider>(
          builder: (_, cart, __) => Text(
            'My Cart (${cart.itemCount})',
          ),
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (ctx, cart, _) {
          if (cart.items.isEmpty) return _buildEmptyCart(ctx);
          return Column(
            children: [
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.all(12),
                  itemCount: cart.items.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (_, i) => _CartItemCard(item: cart.items[i]),
                ),
              ),
              _buildOrderSummary(ctx, cart),
            ],
          );
        },
      ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 96, color: Colors.grey.shade300),
          const SizedBox(height: 16),
          const Text(
            'Your cart is empty',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 8),
          const Text(
            'Add items to get started',
            style: TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => context.maybePop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
            ),
            child: const Text('Continue Shopping'),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderSummary(BuildContext context, CartProvider cart) {
    final freeShipping = cart.subtotal >= 500;
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: AppColors.shadow, blurRadius: 8, offset: Offset(0, -2))],
      ),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Order Summary',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 8),
          _SummaryRow(label: 'Subtotal', value: '₹${cart.subtotal.toStringAsFixed(0)}'),
          _SummaryRow(
            label: 'Shipping',
            value: freeShipping ? 'FREE' : '₹49',
            valueColor: freeShipping ? AppColors.success : AppColors.onBackground,
          ),
          if (!freeShipping)
            Padding(
              padding: const EdgeInsets.only(top: 2, bottom: 4),
              child: Text(
                'Add ₹${(500 - cart.subtotal).toStringAsFixed(0)} more for free shipping',
                style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant),
              ),
            ),
          const Divider(),
          _SummaryRow(
            label: 'Total',
            value: '₹${cart.total.toStringAsFixed(0)}',
            isBold: true,
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton(
              onPressed: () => context.router.push(const CheckoutRoute()),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text(
                'Proceed to Checkout',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Cart Item Card ────────────────────────────────────────────────────────────

class _CartItemCard extends StatelessWidget {
  final CartItemModel item;

  const _CartItemCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final cart = context.read<CartProvider>();
    return Dismissible(
      key: Key(item.productId),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: AppColors.error,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      onDismissed: (_) => cart.removeItem(item.productId),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 1))],
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.horizontal(left: Radius.circular(8)),
              child: item.image != null && item.image!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: item.image!,
                      width: 90,
                      height: 90,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => Container(
                        width: 90,
                        height: 90,
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image_outlined, color: AppColors.onSurfaceVariant),
                      ),
                    )
                  : Container(
                      width: 90,
                      height: 90,
                      color: AppColors.surfaceVariant,
                      child: const Icon(Icons.shopping_bag_outlined, color: AppColors.onSurfaceVariant),
                    ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.onBackground),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '₹${item.price.toStringAsFixed(0)}',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.onBackground),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        _QuantityButton(
                          icon: Icons.remove,
                          onPressed: () {
                            if (item.quantity == 1) {
                              cart.removeItem(item.productId);
                            } else {
                              cart.updateQuantity(item.productId, item.quantity - 1);
                            }
                          },
                        ),
                        Container(
                          width: 36,
                          alignment: Alignment.center,
                          child: Text(
                            '${item.quantity}',
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                          ),
                        ),
                        _QuantityButton(
                          icon: Icons.add,
                          onPressed: () => cart.updateQuantity(item.productId, item.quantity + 1),
                        ),
                        const Spacer(),
                        Text(
                          '₹${item.totalPrice.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.close, size: 18, color: AppColors.onSurfaceVariant),
              onPressed: () => cart.removeItem(item.productId),
            ),
          ],
        ),
      ),
    );
  }
}

class _QuantityButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _QuantityButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(color: AppColors.outline),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16, color: AppColors.primary),
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