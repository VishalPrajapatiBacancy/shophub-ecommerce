import 'package:flutter/foundation.dart';
import 'package:e_commerce/models/order_model.dart';
import 'package:e_commerce/models/cart_item_model.dart';
import 'package:e_commerce/models/address_model.dart';
import 'package:e_commerce/services/order_service.dart';

class OrderProvider extends ChangeNotifier {
  final _service = OrderService();
  List<OrderModel> _orders = [];
  bool _isLoading = false;
  bool _isPlacing = false;
  String? _error;
  int _total = 0;
  int _page = 1;
  static const int _limit = 10;

  List<OrderModel> get orders => _orders;
  bool get isLoading => _isLoading;
  bool get isPlacing => _isPlacing;
  String? get error => _error;
  int get total => _total;
  bool get hasMore => _orders.length < _total;

  Future<void> loadOrders({bool refresh = false}) async {
    if (refresh) {
      _page = 1;
      _orders = [];
    }
    if (_isLoading) return;
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _service.getOrders(page: _page, limit: _limit);
      final newOrders = res['orders'] as List<OrderModel>;
      _total = res['total'] as int;
      if (refresh) {
        _orders = newOrders;
      } else {
        _orders.addAll(newOrders);
      }
      _page++;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<OrderModel?> placeOrder({
    required List<CartItemModel> items,
    required AddressModel shippingAddress,
    required String paymentMethod,
    String? couponCode,
    String? notes,
  }) async {
    _isPlacing = true;
    _error = null;
    notifyListeners();
    try {
      final order = await _service.createOrder(
        items: items,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
        couponCode: couponCode,
        notes: notes,
      );
      _orders.insert(0, order);
      _total++;
      _isPlacing = false;
      notifyListeners();
      return order;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isPlacing = false;
      notifyListeners();
      return null;
    }
  }

  Future<void> cancelOrder(String orderId) async {
    try {
      await _service.cancelOrder(orderId);
      final idx = _orders.indexWhere((o) => o.id == orderId);
      if (idx >= 0) {
        final o = _orders[idx];
        _orders[idx] = OrderModel(
          id: o.id,
          orderNumber: o.orderNumber,
          status: 'cancelled',
          items: o.items,
          subtotal: o.subtotal,
          tax: o.tax,
          shipping: o.shipping,
          discount: o.discount,
          total: o.total,
          shippingAddress: o.shippingAddress,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          trackingNumber: o.trackingNumber,
          notes: o.notes,
          createdAt: o.createdAt,
        );
        notifyListeners();
      }
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      notifyListeners();
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void clear() {
    _orders = [];
    _total = 0;
    _page = 1;
    notifyListeners();
  }
}
