import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/models/review_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/providers/wishlist_provider.dart';
import 'package:e_commerce/services/product_service.dart';

@RoutePage()
class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, @PathParam('productId') required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final _service = ProductService();

  ProductModel? _product;
  List<ReviewModel> _reviews = [];
  bool _loading = true;
  int _imageIndex = 0;
  bool _reviewExpanded = false;

  @override
  void initState() {
    super.initState();
    _loadProduct();
  }

  Future<void> _loadProduct() async {
    try {
      final product = await _service.getProductById(widget.productId);
      List<ReviewModel> reviews = [];
      try {
        reviews = await _service.getProductReviews(widget.productId);
      } catch (_) {
        // Reviews are non-critical — show product even if reviews fail
      }
      if (mounted) {
        setState(() {
          _product = product;
          _reviews = reviews;
          _loading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _addToCart(BuildContext context) {
    final cart = context.read<CartProvider>();
    cart.addItem(
      _product!.id,
      _product!.name,
      _product!.price,
      1,
      image: _product!.displayImage,
    );
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Added to cart'),
        action: SnackBarAction(
          label: 'View Cart',
          onPressed: () => context.router.push(const CartRoute()),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: Text(_product?.name ?? 'Product', maxLines: 1, overflow: TextOverflow.ellipsis),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_cart_outlined),
            onPressed: () => context.router.push(const CartRoute()),
          ),
        ],
      ),
      body: _loading
          ? _buildShimmer()
          : _product == null
              ? const Center(child: Text('Product not found'))
              : _buildContent(),
      bottomNavigationBar: _loading || _product == null ? null : _buildBottomBar(),
    );
  }

  Widget _buildContent() {
    final p = _product!;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildImageGallery(p),
          _buildProductInfo(p),
          if (p.description != null) _buildDescription(p),
          _buildReviews(),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  Widget _buildImageGallery(ProductModel p) {
    final images = p.images.isNotEmpty ? p.images : [p.displayImage];
    return Container(
      color: Colors.white,
      child: Column(
        children: [
          SizedBox(
            height: 300,
            child: PageView.builder(
              itemCount: images.length,
              onPageChanged: (i) => setState(() => _imageIndex = i),
              itemBuilder: (_, i) => CachedNetworkImage(
                imageUrl: images[i],
                fit: BoxFit.contain,
                placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                errorWidget: (_, __, ___) => Container(
                  color: AppColors.surfaceVariant,
                  child: const Icon(Icons.image_outlined, size: 64, color: AppColors.onSurfaceVariant),
                ),
              ),
            ),
          ),
          if (images.length > 1)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  images.length,
                  (i) => AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    width: _imageIndex == i ? 16 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: _imageIndex == i ? AppColors.primary : AppColors.outline,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProductInfo(ProductModel p) {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (p.brand != null)
            Text(
              p.brand!,
              style: const TextStyle(fontSize: 13, color: AppColors.primary, fontWeight: FontWeight.w500),
            ),
          const SizedBox(height: 4),
          Text(
            p.name,
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Text(
                      p.rating.toStringAsFixed(1),
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.star, size: 12, color: Colors.white),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                '${p.reviewCount} ratings',
                style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '₹${p.price.toStringAsFixed(0)}',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.onBackground),
              ),
              if (p.isOnSale) ...[
                const SizedBox(width: 8),
                Text(
                  '₹${p.compareAtPrice!.toStringAsFixed(0)}',
                  style: const TextStyle(
                    fontSize: 16,
                    color: AppColors.onSurfaceVariant,
                    decoration: TextDecoration.lineThrough,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppColors.discountBackground,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Text(
                    '${p.discountPercent}% OFF',
                    style: const TextStyle(
                      color: AppColors.discount,
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                p.isInStock ? Icons.check_circle : Icons.cancel,
                size: 16,
                color: p.isInStock ? AppColors.success : AppColors.error,
              ),
              const SizedBox(width: 4),
              Text(
                p.isInStock ? 'In Stock (${p.stock} left)' : 'Out of Stock',
                style: TextStyle(
                  fontSize: 13,
                  color: p.isInStock ? AppColors.success : AppColors.error,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Consumer<WishlistProvider>(
            builder: (ctx, wishlist, _) {
              final inWishlist = wishlist.hasItem(p.id);
              return OutlinedButton.icon(
                onPressed: () => wishlist.toggleWishlist(p),
                icon: Icon(
                  inWishlist ? Icons.favorite : Icons.favorite_outline,
                  color: inWishlist ? AppColors.error : AppColors.onSurfaceVariant,
                ),
                label: Text(inWishlist ? 'Wishlisted' : 'Add to Wishlist'),
                style: OutlinedButton.styleFrom(
                  foregroundColor: inWishlist ? AppColors.error : AppColors.onSurfaceVariant,
                  side: BorderSide(color: inWishlist ? AppColors.error : AppColors.outline),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildDescription(ProductModel p) {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Description',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
          const SizedBox(height: 8),
          Text(
            p.description!,
            style: const TextStyle(fontSize: 14, color: AppColors.onSurfaceVariant, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _buildReviews() {
    return Container(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Customer Reviews',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.onBackground),
              ),
              TextButton(
                onPressed: () => _showReviewDialog(),
                child: const Text('Write Review'),
              ),
            ],
          ),
          if (_reviews.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 16),
              child: Text('No reviews yet. Be the first!', style: TextStyle(color: AppColors.onSurfaceVariant)),
            )
          else
            ...(_reviewExpanded ? _reviews : _reviews.take(3)).map(_buildReviewItem),
          if (_reviews.length > 3)
            TextButton(
              onPressed: () => setState(() => _reviewExpanded = !_reviewExpanded),
              child: Text(_reviewExpanded ? 'Show Less' : 'View All ${_reviews.length} Reviews'),
            ),
        ],
      ),
    );
  }

  Widget _buildReviewItem(ReviewModel r) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.success,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Row(
                  children: [
                    Text(
                      '${r.rating}',
                      style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(width: 2),
                    const Icon(Icons.star, size: 10, color: Colors.white),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              if (r.title != null)
                Text(r.title!, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
            ],
          ),
          if (r.comment != null) ...[
            const SizedBox(height: 4),
            Text(r.comment!, style: const TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant)),
          ],
          const SizedBox(height: 4),
          Text(
            _formatDate(r.createdAt),
            style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant),
          ),
          const Divider(),
        ],
      ),
    );
  }

  void _showReviewDialog() {
    int rating = 5;
    final commentCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          title: const Text('Write a Review'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  5,
                  (i) => IconButton(
                    icon: Icon(
                      i < rating ? Icons.star : Icons.star_outline,
                      color: AppColors.rating,
                    ),
                    onPressed: () => setDialogState(() => rating = i + 1),
                  ),
                ),
              ),
              TextField(
                controller: commentCtrl,
                decoration: const InputDecoration(hintText: 'Write your comment...'),
                maxLines: 3,
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
            ElevatedButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  await _service.submitReview(
                    widget.productId,
                    rating: rating,
                    comment: commentCtrl.text.trim().isEmpty ? null : commentCtrl.text.trim(),
                  );
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Review submitted!')),
                    );
                    _loadProduct();
                  }
                } catch (e) {
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed: $e')),
                    );
                  }
                }
              },
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar() {
    final p = _product!;
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      child: Consumer<CartProvider>(
        builder: (ctx, cart, _) {
          final inCart = cart.hasItem(p.id);
          return SizedBox(
            height: 52,
            child: ElevatedButton(
              onPressed: p.isInStock
                  ? () {
                      if (inCart) {
                        ctx.router.push(const CartRoute());
                      } else {
                        _addToCart(ctx);
                      }
                    }
                  : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: inCart ? AppColors.success : AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: Text(
                p.isInStock ? (inCart ? 'Go to Cart' : 'Add to Cart') : 'Out of Stock',
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: SingleChildScrollView(
        child: Column(
          children: [
            Container(height: 300, color: Colors.white),
            const SizedBox(height: 8),
            Container(
              color: Colors.white,
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 14, width: 80, color: Colors.grey),
                  const SizedBox(height: 8),
                  Container(height: 20, width: double.infinity, color: Colors.grey),
                  const SizedBox(height: 8),
                  Container(height: 16, width: 160, color: Colors.grey),
                  const SizedBox(height: 12),
                  Container(height: 28, width: 120, color: Colors.grey),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(DateTime dt) {
    return '${dt.day}/${dt.month}/${dt.year}';
  }
}
