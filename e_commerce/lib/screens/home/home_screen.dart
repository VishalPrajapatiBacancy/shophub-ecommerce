import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shimmer/shimmer.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/banner_model.dart';
import 'package:e_commerce/models/category_model.dart';
import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/services/banner_service.dart';
import 'package:e_commerce/services/category_service.dart';
import 'package:e_commerce/services/product_service.dart';
import 'package:e_commerce/screens/categories/categories_screen.dart';
import 'package:e_commerce/screens/wishlist/wishlist_screen.dart';
import 'package:e_commerce/screens/profile/profile_screen.dart';

@RoutePage()
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: const [
          _HomeTab(),
          CategoriesScreen(),
          WishlistScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (i) => setState(() => _currentIndex = i),
        backgroundColor: Colors.white,
        indicatorColor: AppColors.primaryContainer,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppColors.primary),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view, color: AppColors.primary),
            label: 'Categories',
          ),
          NavigationDestination(
            icon: Icon(Icons.favorite_outline),
            selectedIcon: Icon(Icons.favorite, color: AppColors.primary),
            label: 'Wishlist',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppColors.primary),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// ─── Home Tab ─────────────────────────────────────────────────────────────────

class _HomeTab extends StatefulWidget {
  const _HomeTab();

  @override
  State<_HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<_HomeTab> {
  final _bannerService = BannerService();
  final _categoryService = CategoryService();
  final _productService = ProductService();

  List<BannerModel> _banners = [];
  List<CategoryModel> _categories = [];
  List<ProductModel> _products = [];
  bool _loading = true;

  final PageController _bannerController = PageController();
  int _bannerPage = 0;
  Timer? _bannerTimer;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  @override
  void dispose() {
    _bannerTimer?.cancel();
    _bannerController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final results = await Future.wait([
        _bannerService.getBanners(),
        _categoryService.getCategories(),
        _productService.getProducts(limit: 20),
      ]);
      if (mounted) {
        setState(() {
          _banners = results[0] as List<BannerModel>;
          _categories = results[1] as List<CategoryModel>;
          final productRes = results[2] as Map<String, dynamic>;
          _products = productRes['products'] as List<ProductModel>;
          _loading = false;
        });
        _startBannerTimer();
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _startBannerTimer() {
    if (_banners.length <= 1) return;
    _bannerTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (!mounted) return;
      final next = (_bannerPage + 1) % _banners.length;
      _bannerController.animateToPage(
        next,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: _buildAppBar(context),
      body: RefreshIndicator(
        onRefresh: () async {
          setState(() => _loading = true);
          await _loadData();
        },
        child: _loading ? _buildShimmer() : _buildContent(),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(BuildContext context) {
    return AppBar(
      backgroundColor: AppColors.primary,
      elevation: 0,
      title: Row(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.tertiary,
              borderRadius: BorderRadius.circular(4),
            ),
            child: const Text(
              'ShopHub',
              style: TextStyle(
                color: AppColors.onTertiary,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: GestureDetector(
              onTap: () => context.router.push(const SearchRoute()),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: const [
                    Icon(Icons.search, color: AppColors.onSurfaceVariant, size: 18),
                    SizedBox(width: 8),
                    Text(
                      'Search products...',
                      style: TextStyle(color: AppColors.onSurfaceVariant, fontSize: 13),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      actions: [
        Consumer<CartProvider>(
          builder: (_, cart, __) => Stack(
            clipBehavior: Clip.none,
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_cart_outlined, color: Colors.white),
                onPressed: () => context.router.push(const CartRoute()),
              ),
              if (cart.itemCount > 0)
                Positioned(
                  top: 6,
                  right: 6,
                  child: Container(
                    padding: const EdgeInsets.all(3),
                    decoration: const BoxDecoration(
                      color: AppColors.tertiary,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${cart.itemCount}',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: AppColors.onTertiary,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_banners.isNotEmpty) _buildBannerSlider(),
          _buildCategories(),
          _buildFeaturedProducts(),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildBannerSlider() {
    return SizedBox(
      height: 180,
      child: Stack(
        children: [
          PageView.builder(
            controller: _bannerController,
            itemCount: _banners.length,
            onPageChanged: (i) => setState(() => _bannerPage = i),
            itemBuilder: (_, i) {
              final b = _banners[i];
              return CachedNetworkImage(
                imageUrl: b.imageUrl ?? '',
                fit: BoxFit.cover,
                width: double.infinity,
                placeholder: (_, __) => Container(color: AppColors.primaryContainer),
                errorWidget: (_, __, ___) => Container(
                  color: AppColors.primaryContainer,
                  child: const Icon(Icons.image_outlined, color: AppColors.primary),
                ),
              );
            },
          ),
          Positioned(
            bottom: 8,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                _banners.length,
                (i) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 3),
                  width: _bannerPage == i ? 16 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: _bannerPage == i ? Colors.white : Colors.white54,
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

  Widget _buildCategories() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Shop by Category',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
        ),
        SizedBox(
          height: 96,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12),
            itemCount: _categories.length,
            itemBuilder: (_, i) {
              final cat = _categories[i];
              return GestureDetector(
                onTap: () => context.router.push(
                  ProductListRoute(categoryId: cat.id, categoryName: cat.name),
                ),
                child: Container(
                  width: 72,
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    children: [
                      Container(
                        width: 56,
                        height: 56,
                        decoration: const BoxDecoration(
                          color: AppColors.primaryContainer,
                          shape: BoxShape.circle,
                        ),
                        child: cat.imageUrl != null && cat.imageUrl!.isNotEmpty
                            ? ClipOval(
                                child: CachedNetworkImage(
                                  imageUrl: cat.imageUrl!,
                                  fit: BoxFit.cover,
                                  errorWidget: (_, __, ___) => const Icon(
                                    Icons.category_outlined,
                                    color: AppColors.primary,
                                    size: 24,
                                  ),
                                ),
                              )
                            : const Icon(Icons.category_outlined, color: AppColors.primary, size: 24),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        cat.name,
                        maxLines: 2,
                        textAlign: TextAlign.center,
                        style: const TextStyle(fontSize: 10, color: AppColors.onBackground),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFeaturedProducts() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: Text(
            'Featured Products',
            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.onBackground),
          ),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 0.68,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
          ),
          itemCount: _products.length,
          itemBuilder: (_, i) => _ProductCard(
            product: _products[i],
            onTap: () => context.router.push(ProductDetailRoute(productId: _products[i].id)),
          ),
        ),
      ],
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(height: 180, color: Colors.white),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(height: 16, width: 140, color: Colors.white),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 80,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: 6,
                      itemBuilder: (_, __) => Container(
                        width: 64,
                        height: 64,
                        margin: const EdgeInsets.only(right: 12),
                        decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Container(height: 16, width: 140, color: Colors.white),
                  const SizedBox(height: 12),
                  GridView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.68,
                      crossAxisSpacing: 8,
                      mainAxisSpacing: 8,
                    ),
                    itemCount: 6,
                    itemBuilder: (_, __) => Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(8),
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

// ─── Shared Product Card ──────────────────────────────────────────────────────

class _ProductCard extends StatelessWidget {
  final ProductModel product;
  final VoidCallback? onTap;

  const _ProductCard({required this.product, this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(8),
          boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                    child: CachedNetworkImage(
                      imageUrl: product.displayImage,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      placeholder: (_, __) => Container(color: AppColors.surfaceVariant),
                      errorWidget: (_, __, ___) => Container(
                        color: AppColors.surfaceVariant,
                        child: const Icon(Icons.image_outlined, color: AppColors.onSurfaceVariant),
                      ),
                    ),
                  ),
                  if (product.isOnSale)
                    Positioned(
                      top: 6,
                      left: 6,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.discount,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '${product.discountPercent}% OFF',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: AppColors.onBackground,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Icon(Icons.star, size: 12, color: AppColors.rating),
                      const SizedBox(width: 2),
                      Text(
                        product.rating.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 11, color: AppColors.onSurfaceVariant),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(${product.reviewCount})',
                        style: const TextStyle(fontSize: 10, color: AppColors.onSurfaceVariant),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '₹${product.price.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: AppColors.onBackground,
                        ),
                      ),
                      if (product.isOnSale) ...[
                        const SizedBox(width: 4),
                        Text(
                          '₹${product.compareAtPrice!.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 11,
                            color: AppColors.onSurfaceVariant,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  SizedBox(
                    width: double.infinity,
                    height: 38,
                    child: Consumer<CartProvider>(
                      builder: (ctx, cart, _) {
                        final inCart = cart.hasItem(product.id);
                        return ElevatedButton(
                          onPressed: () {
                            if (inCart) {
                              ctx.router.push(const CartRoute());
                            } else {
                              cart.addItem(
                                product.id,
                                product.name,
                                product.price,
                                1,
                                image: product.displayImage,
                              );
                              ScaffoldMessenger.of(ctx).showSnackBar(
                                const SnackBar(
                                  content: Text('Added to cart'),
                                  duration: Duration(seconds: 1),
                                ),
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: inCart ? AppColors.primaryContainer : AppColors.primary,
                            foregroundColor: inCart ? AppColors.primary : Colors.white,
                            padding: EdgeInsets.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                            elevation: 0,
                          ),
                          child: Text(
                            inCart ? 'Go to Cart' : 'Add to Cart',
                            style: const TextStyle(fontSize: 11),
                          ),
                        );
                      },
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
