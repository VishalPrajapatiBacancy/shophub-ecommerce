import 'package:auto_route/auto_route.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:e_commerce/config/routes/app_router.dart';
import 'package:e_commerce/config/theme/app_colors.dart';
import 'package:e_commerce/providers/auth_provider.dart';
import 'package:e_commerce/providers/cart_provider.dart';
import 'package:e_commerce/providers/wishlist_provider.dart';
import 'package:e_commerce/providers/order_provider.dart';

@RoutePage()
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        title: const Text('My Profile'),
      ),
      body: Consumer<AuthProvider>(
        builder: (ctx, auth, _) {
          if (!auth.isLoggedIn) {
            return _buildGuestView(ctx);
          }
          final user = auth.user!;
          final initials = _initials(user.name);
          return ListView(
            children: [
              // Avatar header
              Container(
                color: AppColors.primary,
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: Row(
                  children: [
                    Container(
                      width: 64,
                      height: 64,
                      decoration: BoxDecoration(
                        color: AppColors.tertiary,
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white, width: 2),
                      ),
                      child: Center(
                        child: Text(
                          initials,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: AppColors.onTertiary,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user.name,
                            style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user.email,
                            style: const TextStyle(fontSize: 13, color: Colors.white70),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              // Menu items
              _ProfileMenuItem(
                icon: Icons.receipt_long_outlined,
                label: 'My Orders',
                onTap: () => ctx.router.push(const OrdersListRoute()),
              ),
              _ProfileMenuItem(
                icon: Icons.location_on_outlined,
                label: 'My Addresses',
                onTap: () => ctx.router.push(AddressManagementRoute()),
              ),
              _ProfileMenuItem(
                icon: Icons.favorite_outline,
                label: 'Wishlist',
                onTap: () => ctx.router.push(const WishlistRoute()),
              ),
              const Divider(height: 1, indent: 16, endIndent: 16),
              _ProfileMenuItem(
                icon: Icons.logout,
                label: 'Logout',
                color: AppColors.error,
                onTap: () => _confirmLogout(ctx, auth),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildGuestView(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person_outline, size: 96, color: AppColors.onSurfaceVariant),
            const SizedBox(height: 16),
            const Text(
              'Sign in to view your profile',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.onBackground),
            ),
            const SizedBox(height: 8),
            const Text(
              'Access orders, wishlist and more',
              style: TextStyle(fontSize: 13, color: AppColors.onSurfaceVariant),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () => context.router.push(const SignInRoute()),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Sign In', style: TextStyle(fontSize: 16)),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: OutlinedButton(
                onPressed: () => context.router.push(const SignUpRoute()),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.primary,
                  side: const BorderSide(color: AppColors.primary),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text('Create Account', style: TextStyle(fontSize: 16)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmLogout(BuildContext context, AuthProvider auth) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Logout'),
        content: const Text('Are you sure you want to logout?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              await auth.logout();
              if (context.mounted) {
                context.read<CartProvider>().setLoggedIn(false);
                context.read<WishlistProvider>().clear();
                context.read<OrderProvider>().clear();
                context.router.replace(const SignInRoute());
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            child: const Text('Logout'),
          ),
        ],
      ),
    );
  }

  String _initials(String name) {
    final parts = name.trim().split(' ');
    if (parts.length >= 2) return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }
}

// ─── Profile Menu Item ────────────────────────────────────────────────────────

class _ProfileMenuItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _ProfileMenuItem({
    required this.icon,
    required this.label,
    required this.onTap,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final itemColor = color ?? AppColors.onBackground;
    return Container(
      color: Colors.white,
      child: ListTile(
        leading: Icon(icon, color: itemColor),
        title: Text(label, style: TextStyle(color: itemColor, fontSize: 14)),
        trailing: Icon(Icons.chevron_right, color: color != null ? itemColor : AppColors.onSurfaceVariant),
        onTap: onTap,
      ),
    );
  }
}
