import 'package:flutter/foundation.dart';
import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/services/wishlist_service.dart';

class WishlistProvider extends ChangeNotifier {
  final _service = WishlistService();
  List<ProductModel> _items = [];
  bool _isLoading = false;

  List<ProductModel> get items => _items;
  bool get isLoading => _isLoading;
  int get itemCount => _items.length;

  bool hasItem(String productId) => _items.any((e) => e.id == productId);

  Future<void> loadWishlist() async {
    _isLoading = true;
    notifyListeners();
    try {
      _items = await _service.getWishlist();
    } catch (_) {
      _items = [];
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> toggleWishlist(ProductModel product) async {
    final inWishlist = hasItem(product.id);
    if (inWishlist) {
      _items.removeWhere((e) => e.id == product.id);
      notifyListeners();
      try {
        await _service.removeFromWishlist(product.id);
      } catch (_) {
        _items.add(product);
        notifyListeners();
      }
    } else {
      _items.add(product);
      notifyListeners();
      try {
        await _service.addToWishlist(product.id);
      } catch (_) {
        _items.removeWhere((e) => e.id == product.id);
        notifyListeners();
      }
    }
  }

  Future<void> removeItem(String productId) async {
    final item = _items.firstWhere((e) => e.id == productId, orElse: () => _items.first);
    _items.removeWhere((e) => e.id == productId);
    notifyListeners();
    try {
      await _service.removeFromWishlist(productId);
    } catch (_) {
      _items.add(item);
      notifyListeners();
    }
  }

  void clear() {
    _items = [];
    notifyListeners();
  }
}
