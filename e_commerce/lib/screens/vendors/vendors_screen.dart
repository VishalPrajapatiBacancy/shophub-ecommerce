import 'package:auto_route/auto_route.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/models/vendor_model.dart';
import 'package:e_commerce/services/vendor_service.dart';

@RoutePage()
class VendorsScreen extends StatefulWidget {
  const VendorsScreen({super.key});

  @override
  State<VendorsScreen> createState() => _VendorsScreenState();
}

class _VendorsScreenState extends State<VendorsScreen> {
  final _service = VendorService();
  final _searchCtrl = TextEditingController();
  List<VendorModel> _vendors = [];
  bool _loading = true;
  String _search = '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await _service.getVendors(search: _search.isEmpty ? null : _search);
      if (mounted) setState(() { _vendors = list; _loading = false; });
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
        title: const Text('Stores'),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(12, 0, 12, 8),
            child: TextField(
              controller: _searchCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Search stores...',
                hintStyle: const TextStyle(color: Colors.white70),
                prefixIcon: const Icon(Icons.search, color: Colors.white70),
                suffixIcon: _search.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear, color: Colors.white70),
                        onPressed: () { _searchCtrl.clear(); setState(() => _search = ''); _load(); },
                      )
                    : null,
                filled: true,
                fillColor: Colors.white.withAlpha(30),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(28),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(vertical: 0),
              ),
              onChanged: (v) { setState(() => _search = v); },
              onSubmitted: (_) => _load(),
            ),
          ),
        ),
      ),
      body: _loading
          ? _buildShimmer()
          : _vendors.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.store_outlined, size: 64, color: Colors.grey.shade400),
                      const SizedBox(height: 12),
                      Text('No stores found', style: TextStyle(color: Colors.grey.shade600, fontSize: 16)),
                    ],
                  ),
                )
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: _vendors.length,
                    itemBuilder: (_, i) => _VendorCard(vendor: _vendors[i]),
                  ),
                ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: Colors.grey.shade300,
      highlightColor: Colors.grey.shade100,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: 8,
        itemBuilder: (_, __) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          height: 88,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

class _VendorCard extends StatelessWidget {
  final VendorModel vendor;
  const _VendorCard({required this.vendor});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.router.push(VendorDetailRoute(vendorId: vendor.id, vendorName: vendor.storeName)),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [BoxShadow(color: AppColors.shadow, blurRadius: 4, offset: Offset(0, 2))],
        ),
        child: Row(
          children: [
            // Logo
            ClipRRect(
              borderRadius: BorderRadius.circular(10),
              child: vendor.logoUrl != null && vendor.logoUrl!.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: vendor.logoUrl!,
                      width: 64,
                      height: 64,
                      fit: BoxFit.cover,
                      errorWidget: (_, __, ___) => _logoPlaceholder(vendor.storeName),
                    )
                  : _logoPlaceholder(vendor.storeName),
            ),
            const SizedBox(width: 12),
            // Info
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    vendor.storeName,
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15, color: AppColors.onBackground),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (vendor.description != null && vendor.description!.isNotEmpty) ...[
                    const SizedBox(height: 2),
                    Text(
                      vendor.description!,
                      style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                  const SizedBox(height: 6),
                  Row(
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 2),
                      Text(vendor.rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: AppColors.onBackground)),
                      const SizedBox(width: 10),
                      const Icon(Icons.shopping_bag_outlined, size: 13, color: AppColors.onSurfaceVariant),
                      const SizedBox(width: 3),
                      Text('${vendor.totalOrders} orders', style: const TextStyle(fontSize: 12, color: AppColors.onSurfaceVariant)),
                    ],
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, color: AppColors.onSurfaceVariant),
          ],
        ),
      ),
    );
  }

  Widget _logoPlaceholder(String name) {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        color: AppColors.primary.withAlpha(25),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Center(
        child: Text(
          name.isNotEmpty ? name[0].toUpperCase() : 'S',
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
        ),
      ),
    );
  }
}
