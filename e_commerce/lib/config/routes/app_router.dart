import 'package:auto_route/auto_route.dart';
import 'package:flutter/widgets.dart';
import '../../screens/auth/signin_screen.dart';
import '../../screens/auth/signup_screen.dart';
import '../../screens/home/home_screen.dart';
import '../../screens/splash/modern_splash_screen.dart';
import '../../screens/products/product_list_screen.dart';
import '../../screens/products/product_detail_screen.dart';
import '../../screens/cart/cart_screen.dart';
import '../../screens/wishlist/wishlist_screen.dart';
import '../../screens/checkout/checkout_screen.dart';
import '../../screens/checkout/order_success_screen.dart';
import '../../screens/orders/orders_list_screen.dart';
import '../../screens/orders/order_detail_screen.dart';
import '../../screens/profile/profile_screen.dart';
import '../../screens/search/search_screen.dart';
import '../../screens/address/address_management_screen.dart';
import '../../screens/categories/categories_screen.dart';

part 'app_router.gr.dart';

@AutoRouterConfig()
class AppRouter extends RootStackRouter {
  @override
  List<AutoRoute> get routes => [
        // Splash Screen
        AutoRoute(page: ModernSplashRoute.page, initial: true),

        // Auth Routes
        AutoRoute(page: SignInRoute.page, path: '/signin'),
        AutoRoute(page: SignUpRoute.page, path: '/signup'),

        // Main App Routes
        AutoRoute(page: HomeRoute.page, path: '/home'),

        // Product Routes
        AutoRoute(page: ProductListRoute.page, path: '/products'),
        AutoRoute(page: ProductDetailRoute.page, path: '/products/:productId'),

        // Cart & Checkout
        AutoRoute(page: CartRoute.page, path: '/cart'),
        AutoRoute(page: CheckoutRoute.page, path: '/checkout'),
        AutoRoute(page: OrderSuccessRoute.page, path: '/order-success'),

        // Orders
        AutoRoute(page: OrdersListRoute.page, path: '/orders'),
        AutoRoute(page: OrderDetailRoute.page, path: '/orders/:orderId'),

        // Profile & Account
        AutoRoute(page: ProfileRoute.page, path: '/profile'),
        AutoRoute(page: WishlistRoute.page, path: '/wishlist'),
        AutoRoute(page: AddressManagementRoute.page, path: '/addresses'),

        // Search & Categories
        AutoRoute(page: SearchRoute.page, path: '/search'),
        AutoRoute(page: CategoriesRoute.page, path: '/categories'),
      ];
}
