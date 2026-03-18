// dart format width=80
// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AutoRouterGenerator
// **************************************************************************

// ignore_for_file: type=lint
// coverage:ignore-file

part of 'app_router.dart';

/// generated route for
/// [AddressManagementScreen]
class AddressManagementRoute extends PageRouteInfo<AddressManagementRouteArgs> {
  AddressManagementRoute({
    Key? key,
    bool returnAddress = false,
    List<PageRouteInfo>? children,
  }) : super(
         AddressManagementRoute.name,
         args: AddressManagementRouteArgs(
           key: key,
           returnAddress: returnAddress,
         ),
         initialChildren: children,
       );

  static const String name = 'AddressManagementRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<AddressManagementRouteArgs>(
        orElse: () => const AddressManagementRouteArgs(),
      );
      return AddressManagementScreen(
        key: args.key,
        returnAddress: args.returnAddress,
      );
    },
  );
}

class AddressManagementRouteArgs {
  const AddressManagementRouteArgs({this.key, this.returnAddress = false});

  final Key? key;

  final bool returnAddress;

  @override
  String toString() {
    return 'AddressManagementRouteArgs{key: $key, returnAddress: $returnAddress}';
  }
}

/// generated route for
/// [CartScreen]
class CartRoute extends PageRouteInfo<void> {
  const CartRoute({List<PageRouteInfo>? children})
    : super(CartRoute.name, initialChildren: children);

  static const String name = 'CartRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const CartScreen();
    },
  );
}

/// generated route for
/// [CategoriesScreen]
class CategoriesRoute extends PageRouteInfo<void> {
  const CategoriesRoute({List<PageRouteInfo>? children})
    : super(CategoriesRoute.name, initialChildren: children);

  static const String name = 'CategoriesRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const CategoriesScreen();
    },
  );
}

/// generated route for
/// [CheckoutScreen]
class CheckoutRoute extends PageRouteInfo<void> {
  const CheckoutRoute({List<PageRouteInfo>? children})
    : super(CheckoutRoute.name, initialChildren: children);

  static const String name = 'CheckoutRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const CheckoutScreen();
    },
  );
}

/// generated route for
/// [HomeScreen]
class HomeRoute extends PageRouteInfo<void> {
  const HomeRoute({List<PageRouteInfo>? children})
    : super(HomeRoute.name, initialChildren: children);

  static const String name = 'HomeRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const HomeScreen();
    },
  );
}

/// generated route for
/// [ModernSplashScreen]
class ModernSplashRoute extends PageRouteInfo<void> {
  const ModernSplashRoute({List<PageRouteInfo>? children})
    : super(ModernSplashRoute.name, initialChildren: children);

  static const String name = 'ModernSplashRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ModernSplashScreen();
    },
  );
}

/// generated route for
/// [OrderDetailScreen]
class OrderDetailRoute extends PageRouteInfo<OrderDetailRouteArgs> {
  OrderDetailRoute({
    Key? key,
    required String orderId,
    List<PageRouteInfo>? children,
  }) : super(
         OrderDetailRoute.name,
         args: OrderDetailRouteArgs(key: key, orderId: orderId),
         rawPathParams: {'orderId': orderId},
         initialChildren: children,
       );

  static const String name = 'OrderDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final pathParams = data.inheritedPathParams;
      final args = data.argsAs<OrderDetailRouteArgs>(
        orElse: () =>
            OrderDetailRouteArgs(orderId: pathParams.getString('orderId')),
      );
      return OrderDetailScreen(key: args.key, orderId: args.orderId);
    },
  );
}

class OrderDetailRouteArgs {
  const OrderDetailRouteArgs({this.key, required this.orderId});

  final Key? key;

  final String orderId;

  @override
  String toString() {
    return 'OrderDetailRouteArgs{key: $key, orderId: $orderId}';
  }
}

/// generated route for
/// [OrderSuccessScreen]
class OrderSuccessRoute extends PageRouteInfo<OrderSuccessRouteArgs> {
  OrderSuccessRoute({
    Key? key,
    required String orderId,
    required String orderNumber,
    List<PageRouteInfo>? children,
  }) : super(
         OrderSuccessRoute.name,
         args: OrderSuccessRouteArgs(
           key: key,
           orderId: orderId,
           orderNumber: orderNumber,
         ),
         rawPathParams: {'orderId': orderId, 'orderNumber': orderNumber},
         initialChildren: children,
       );

  static const String name = 'OrderSuccessRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final pathParams = data.inheritedPathParams;
      final args = data.argsAs<OrderSuccessRouteArgs>(
        orElse: () => OrderSuccessRouteArgs(
          orderId: pathParams.getString('orderId'),
          orderNumber: pathParams.getString('orderNumber'),
        ),
      );
      return OrderSuccessScreen(
        key: args.key,
        orderId: args.orderId,
        orderNumber: args.orderNumber,
      );
    },
  );
}

class OrderSuccessRouteArgs {
  const OrderSuccessRouteArgs({
    this.key,
    required this.orderId,
    required this.orderNumber,
  });

  final Key? key;

  final String orderId;

  final String orderNumber;

  @override
  String toString() {
    return 'OrderSuccessRouteArgs{key: $key, orderId: $orderId, orderNumber: $orderNumber}';
  }
}

/// generated route for
/// [OrdersListScreen]
class OrdersListRoute extends PageRouteInfo<void> {
  const OrdersListRoute({List<PageRouteInfo>? children})
    : super(OrdersListRoute.name, initialChildren: children);

  static const String name = 'OrdersListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const OrdersListScreen();
    },
  );
}

/// generated route for
/// [ProductDetailScreen]
class ProductDetailRoute extends PageRouteInfo<ProductDetailRouteArgs> {
  ProductDetailRoute({
    Key? key,
    required String productId,
    List<PageRouteInfo>? children,
  }) : super(
         ProductDetailRoute.name,
         args: ProductDetailRouteArgs(key: key, productId: productId),
         rawPathParams: {'productId': productId},
         initialChildren: children,
       );

  static const String name = 'ProductDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final pathParams = data.inheritedPathParams;
      final args = data.argsAs<ProductDetailRouteArgs>(
        orElse: () => ProductDetailRouteArgs(
          productId: pathParams.getString('productId'),
        ),
      );
      return ProductDetailScreen(key: args.key, productId: args.productId);
    },
  );
}

class ProductDetailRouteArgs {
  const ProductDetailRouteArgs({this.key, required this.productId});

  final Key? key;

  final String productId;

  @override
  String toString() {
    return 'ProductDetailRouteArgs{key: $key, productId: $productId}';
  }
}

/// generated route for
/// [ProductListScreen]
class ProductListRoute extends PageRouteInfo<ProductListRouteArgs> {
  ProductListRoute({
    Key? key,
    String? categoryId,
    String? categoryName,
    String? searchQuery,
    List<PageRouteInfo>? children,
  }) : super(
         ProductListRoute.name,
         args: ProductListRouteArgs(
           key: key,
           categoryId: categoryId,
           categoryName: categoryName,
           searchQuery: searchQuery,
         ),
         initialChildren: children,
       );

  static const String name = 'ProductListRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final args = data.argsAs<ProductListRouteArgs>(
        orElse: () => const ProductListRouteArgs(),
      );
      return ProductListScreen(
        key: args.key,
        categoryId: args.categoryId,
        categoryName: args.categoryName,
        searchQuery: args.searchQuery,
      );
    },
  );
}

class ProductListRouteArgs {
  const ProductListRouteArgs({
    this.key,
    this.categoryId,
    this.categoryName,
    this.searchQuery,
  });

  final Key? key;

  final String? categoryId;

  final String? categoryName;

  final String? searchQuery;

  @override
  String toString() {
    return 'ProductListRouteArgs{key: $key, categoryId: $categoryId, categoryName: $categoryName, searchQuery: $searchQuery}';
  }
}

/// generated route for
/// [ProfileScreen]
class ProfileRoute extends PageRouteInfo<void> {
  const ProfileRoute({List<PageRouteInfo>? children})
    : super(ProfileRoute.name, initialChildren: children);

  static const String name = 'ProfileRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const ProfileScreen();
    },
  );
}

/// generated route for
/// [SearchScreen]
class SearchRoute extends PageRouteInfo<void> {
  const SearchRoute({List<PageRouteInfo>? children})
    : super(SearchRoute.name, initialChildren: children);

  static const String name = 'SearchRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SearchScreen();
    },
  );
}

/// generated route for
/// [SignInScreen]
class SignInRoute extends PageRouteInfo<void> {
  const SignInRoute({List<PageRouteInfo>? children})
    : super(SignInRoute.name, initialChildren: children);

  static const String name = 'SignInRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SignInScreen();
    },
  );
}

/// generated route for
/// [SignUpScreen]
class SignUpRoute extends PageRouteInfo<void> {
  const SignUpRoute({List<PageRouteInfo>? children})
    : super(SignUpRoute.name, initialChildren: children);

  static const String name = 'SignUpRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const SignUpScreen();
    },
  );
}

/// generated route for
/// [VendorDetailScreen]
class VendorDetailRoute extends PageRouteInfo<VendorDetailRouteArgs> {
  VendorDetailRoute({
    Key? key,
    required String vendorId,
    String? vendorName,
    List<PageRouteInfo>? children,
  }) : super(
         VendorDetailRoute.name,
         args: VendorDetailRouteArgs(
           key: key,
           vendorId: vendorId,
           vendorName: vendorName,
         ),
         rawPathParams: {'vendorId': vendorId},
         initialChildren: children,
       );

  static const String name = 'VendorDetailRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      final pathParams = data.inheritedPathParams;
      final args = data.argsAs<VendorDetailRouteArgs>(
        orElse: () =>
            VendorDetailRouteArgs(vendorId: pathParams.getString('vendorId')),
      );
      return VendorDetailScreen(
        key: args.key,
        vendorId: args.vendorId,
        vendorName: args.vendorName,
      );
    },
  );
}

class VendorDetailRouteArgs {
  const VendorDetailRouteArgs({
    this.key,
    required this.vendorId,
    this.vendorName,
  });

  final Key? key;

  final String vendorId;

  final String? vendorName;

  @override
  String toString() {
    return 'VendorDetailRouteArgs{key: $key, vendorId: $vendorId, vendorName: $vendorName}';
  }
}

/// generated route for
/// [VendorsScreen]
class VendorsRoute extends PageRouteInfo<void> {
  const VendorsRoute({List<PageRouteInfo>? children})
    : super(VendorsRoute.name, initialChildren: children);

  static const String name = 'VendorsRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const VendorsScreen();
    },
  );
}

/// generated route for
/// [WishlistScreen]
class WishlistRoute extends PageRouteInfo<void> {
  const WishlistRoute({List<PageRouteInfo>? children})
    : super(WishlistRoute.name, initialChildren: children);

  static const String name = 'WishlistRoute';

  static PageInfo page = PageInfo(
    name,
    builder: (data) {
      return const WishlistScreen();
    },
  );
}
