import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:e_commerce/models/cart_item_model.dart';
import 'package:e_commerce/services/cart_service.dart';

class CartProvider extends ChangeNotifier {
  final _service = CartService();
  List<CartItemModel> _items = [];
  bool _isLoading = false;
  bool _isLoggedIn = false;

  List<CartItemModel> get items => _items;
  bool get isLoading => _isLoading;
  int get itemCount => _items.fold(0, (sum, i) => sum + i.quantity);
  double get subtotal => _items.fold(0.0, (sum, i) => sum + i.totalPrice);
  double get shipping => subtotal >= 500 ? 0.0 : 49.0;
  double get total => subtotal + shipping;

  void setLoggedIn(bool value) {
    _isLoggedIn = value;
    if (value) loadCart();
  }

  Future<void> loadCart() async {
    if (_isLoggedIn) {
      try {
        _items = await _service.getCart();
        notifyListeners();
      } catch (_) {
        await _loadLocalCart();
      }
    } else {
      await _loadLocalCart();
    }
  }

  Future<void> _loadLocalCart() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString('local_cart');
      if (raw != null) {
        final list = jsonDecode(raw) as List;
        _items = list.map((e) => CartItemModel.fromJson(e as Map<String, dynamic>)).toList();
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _saveLocalCart() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('local_cart', jsonEncode(_items.map((e) => e.toJson()).toList()));
  }

  Future<void> addItem(String productId, String name, double price, int quantity, {String? image}) async {
    final idx = _items.indexWhere((e) => e.productId == productId);
    if (idx >= 0) {
      _items[idx] = _items[idx].copyWith(quantity: _items[idx].quantity + quantity);
    } else {
      _items.add(CartItemModel(productId: productId, name: name, price: price, quantity: quantity, image: image));
    }
    notifyListeners();
    if (_isLoggedIn) {
      try {
        _items = await _service.updateCart(_items);
        notifyListeners();
      } catch (_) {}
    } else {
      await _saveLocalCart();
    }
  }

  Future<void> removeItem(String productId) async {
    _items.removeWhere((e) => e.productId == productId);
    notifyListeners();
    if (_isLoggedIn) {
      try { await _service.removeFromCart(productId); } catch (_) {}
    } else {
      await _saveLocalCart();
    }
  }

  Future<void> updateQuantity(String productId, int qty) async {
    if (qty <= 0) { removeItem(productId); return; }
    final idx = _items.indexWhere((e) => e.productId == productId);
    if (idx >= 0) {
      _items[idx] = _items[idx].copyWith(quantity: qty);
      notifyListeners();
      if (_isLoggedIn) {
        try {
          await _service.updateCart(_items);
        } catch (_) {}
      } else {
        await _saveLocalCart();
      }
    }
  }

  Future<void> clearCart() async {
    _items = [];
    notifyListeners();
    if (_isLoggedIn) {
      try { await _service.clearCart(); } catch (_) {}
    }
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('local_cart');
  }

  bool hasItem(String productId) => _items.any((e) => e.productId == productId);
}
