import 'dart:async';

import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shimmer/shimmer.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/services/product_service.dart';

@RoutePage()
class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _service = ProductService();
  final _searchCtrl = TextEditingController();
  final _focusNode = FocusNode();

  List<ProductModel> _results = [];
  List<String> _recentSearches = [];
  bool _loading = false;
  bool _searched = false;
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _loadRecent();
    WidgetsBinding.instance.addPostFrameCallback((_) => _focusNode.requestFocus());
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadRecent() async {
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('recent_searches') ?? [];
    if (mounted) setState(() => _recentSearches = list);
  }

  Future<void> _saveRecent(String query) async {
    if (query.trim().isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    final list = prefs.getStringList('recent_searches') ?? [];
    list.remove(query);
    list.insert(0, query);
    if (list.length > 10) list.removeLast();
    await prefs.setStringList('recent_searches', list);
    if (mounted) setState(() => _recentSearches = list);
  }

  Future<void> _clearRecent() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('recent_searches');
    if (mounted) setState(() => _recentSearches = []);
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    if (value.trim().isEmpty) {
      setState(() { _results = []; _searched = false; _loading = false; });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 300), () => _search(value.trim()));
  }

  Future<void> _search(String query) async {
    if (query.isEmpty) return;
    setState(() { _loading = true; _searched = true; });
    await _saveRecent(query);
    try {
      final res = await _service.getProducts(search: query, limit: 30);
      if (mounted) {
        setState(() {
          _results = res['products'] as List<ProductModel>;
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
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        titleSpacing: 0,
        title: TextField(
          controller: _searchCtrl,
          focusNode: _focusNode,
          style: const TextStyle(color: Colors.white),
          cursorColor: Colors.white,
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            hintText: 'Search products...',
            hintStyle: TextStyle(color: Colors.white.withOpacity(0.7)),
            border: InputBorder.none,
            suffixIcon: _searchCtrl.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.close, color: Colors.white),
                    onPressed: () {
                      _searchCtrl.clear();
                      setState(() { _results = []; _searched = false; _loading = false; });
                    },
                  )
                : null,
          ),
          onChanged: _onChanged,
          onSubmitted: _search,
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (!_searched && _recentSearches.isNotEmpty) {
      return _buildRecentSearches();
    }
    if (_loading) return _buildShimmer();
    if (_searched && _results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.search_off, size: 64, color: AppColors.onSurfaceVariant),
            const SizedBox(height: 16),
            Text(
              'No results for "${_searchCtrl.text}"',
              style: const TextStyle(fontSize: 15, color: AppColors.onSurfaceVariant),
            ),
          ],
        ),
      );
    }
    if (_results.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.search, size: 64, color: AppColors.onSurfaceVariant),
            SizedBox(height: 12),
            Text('Search for products', style: TextStyle(color: AppColors.onSurfaceVariant)),
          ],
        ),
      );
    }
    return GridView.builder(
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.66,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: _results.length,
      itemBuilder: (_, i) => _ProductCard(
        product: _results[i],
        onTap: () => context.router.push(ProductDetailRoute(productId: _results[i].id)),
      ),
    );
  }

  Widget _buildRecentSearches() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Recent Searches',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.onBackground)),
              TextButton(onPressed: _clearRecent, child: const Text('Clear all')),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: _recentSearches.length,
            itemBuilder: (_, i) => ListTile(
              leading: const Icon(Icons.history, color: AppColors.onSurfaceVariant),
              title: Text(_recentSearches[i], style: const TextStyle(fontSize: 14)),
              trailing: const Icon(Icons.north_west, size: 16, color: AppColors.onSurfaceVariant),
              onTap: () {
                _searchCtrl.text = _recentSearches[i];
                _search(_recentSearches[i]);
              },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: GridView.builder(
        padding: const EdgeInsets.all(12),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.66,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
        ),
        itemCount: 6,
        itemBuilder: (_, __) => Container(
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
        ),
      ),
    );
  }
}

// ─── Product Card ─────────────────────────────────────────────────────────────

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
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.onBackground),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        '₹${product.price.toStringAsFixed(0)}',
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.onBackground),
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
                              cart.addItem(product.id, product.name, product.price, 1, image: product.displayImage);
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
