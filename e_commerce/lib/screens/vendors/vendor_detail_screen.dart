import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/models/vendor_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/services/vendor_service.dart';

@RoutePage()
class VendorDetailScreen extends StatefulWidget {
  final String vendorId;
  final String? vendorName;

  const VendorDetailScreen({
    super.key,
    @PathParam('vendorId') required this.vendorId,
    this.vendorName,
  });

  @override
  State<VendorDetailScreen> createState() => _VendorDetailScreenState();
}

class _VendorDetailScreenState extends State<VendorDetailScreen> {
  final _service = VendorService();
  VendorModel? _vendor;
  List<ProductModel> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        _service.getVendor(widget.vendorId),
        _service.getVendorProducts(widget.vendorId, limit: 40),
      ]);
      if (mounted) {
        setState(() {
          _vendor = results[0] as VendorModel;
          _products = results[1] as List<ProductModel>;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: _loading
          ? _buildShimmer()
          : CustomScrollView(
              slivers: [
                _buildAppBar(),
                if (_vendor != null) _buildVendorInfo(),
                _buildProductsHeader(),
                _products.isEmpty
                    ? SliverFillRemaining(
                        child: Center(
                          child: Text('No products yet', style: TextStyle(color: Colors.grey.shade500)),
                        ),
                      )
                    : SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.72,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (_, i) => _ProductCard(product: _products[i]),
                            childCount: _products.length,
                          ),
                        ),
                      ),
              ],
            ),
    );
  }

  Widget _buildAppBar() {
    final vendor = _vendor;
    return SliverAppBar(
      expandedHeight: vendor?.bannerUrl != null ? 200 : 0,
      pinned: true,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      title: Text(vendor?.storeName ?? widget.vendorName ?? 'Store'),
      flexibleSpace: vendor?.bannerUrl != null
          ? FlexibleSpaceBar(
              background: CachedNetworkImage(
                imageUrl: vendor!.bannerUrl!,
                fit: BoxFit.cover,
                errorWidget: (_, __, ___) => Container(color: AppColors.primary),
              ),
            )
          : null,
    );
  }

  Widget _buildVendorInfo() {
    final v = _vendor!;
    return SliverToBoxAdapter(
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: v.logoUrl != null && v.logoUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: v.logoUrl!,
                      width: 56,
                      height: 56,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _logoPlaceholder(v.storeName),
                    )
                  : _logoPlaceholder(v.storeName),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(v.storeName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.onBackground)),
                  if (v.description != null && v.description!.isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(v.description!, style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant), maxLines: 2, overflow: TextOverflow.ellipsis),
                    ),
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 2),
                      Text(v.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                      const SizedBox(width: 10),
                      Text('${v.totalOrders} orders', style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProductsHeader() {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        child: Text(
          'Products (${_products.length})',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppColors.onBackground),
        ),
      ),
    );
  }

  Widget _logoPlaceholder(String name) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(25),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : 'S',
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: Column(
        children: [
          Container(height: 200, color: Colors.white),
          const SizedBox(height: 8),
          Container(height: 80, margin: const EdgeInsets.all(16), decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12))),
        ],
      ),
    );
  }
}

class _ProductCard extends StatelessWidget {
  final ProductModel product;
  const _ProductCard({required this.product});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.router.push(ProductDetailRoute(productId: product.id)),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                child: product.thumbnail != null && product.thumbnail!.isNotEmpty
                    ? CachedNetworkImage(
                        imageUrl: product.thumbnail!,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorWidget: (_, __, ___) => const _ProductImagePlaceholder(),
                      )
                    : const _ProductImagePlaceholder(),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.onBackground)),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text('\$${product.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.primary)),
                      if (product.isOnSale) ...[
                        const SizedBox(width: 4),
                        Text('\$${product.compareAtPrice!.toStringAsFixed(2)}', style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant, decoration: TextDecoration.lineThrough)),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  SizedBox(
                    width: double.infinity,
                    child: Consumer<CartProvider>(
                      builder: (_, cart, __) => TextButton(
                        onPressed: product.isInStock
                            ? () {
                                cart.addItem(product.id, product.name, product.price, 1, image: product.displayImage);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 1)),
                                );
                              }
                            : null,
                        style: TextButton.styleFrom(
                          backgroundColor: product.isInStock ? AppColors.primary : Colors.grey.shade200,
                          foregroundColor: product.isInStock ? Colors.white : Colors.grey.shade500,
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          minimumSize: Size.zero,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        child: Text(product.isInStock ? 'Add to Cart' : 'Out of Stock', style: const TextStyle(fontSize: 11)),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ProductImagePlaceholder extends StatelessWidget {
  const _ProductImagePlaceholder();
  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.grey.shade100,
      child: const Center(child: Icon(Icons.image_outlined, size: 40, color: Colors.grey)),
    );
  }
}
