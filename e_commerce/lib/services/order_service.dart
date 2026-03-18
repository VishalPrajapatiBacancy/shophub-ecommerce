import 'package:e_commerce/models/order_model.dart';
import 'package:e_commerce/models/cart_item_model.dart';
import 'package:e_commerce/models/address_model.dart';
import 'package:e_commerce/services/api_service.dart';

class OrderService {
  final _api = ApiService();

  Future<OrderModel> createOrder({
    required List<CartItemModel> items,
    required AddressModel shippingAddress,
    required String paymentMethod,
    String? couponCode,
    String? notes,
  }) async {
    final res = await _api.post('/orders', {
      'items': items.map((e) => e.toJson()).toList(),
      'shippingAddress': shippingAddress.toJson(),
      'paymentMethod': paymentMethod,
      if (couponCode != null) 'couponCode': couponCode,
      if (notes != null) 'notes': notes,
    });
    return OrderModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<Map<String, dynamic>> getOrders({int page = 1, int limit = 10}) async {
    final res = await _api.get('/orders', params: {'page': page.toString(), 'limit': limit.toString()});
    final data = res['data'] as List? ?? [];
    return {
      'orders': data.map((e) => OrderModel.fromJson(e as Map<String, dynamic>)).toList(),
      'total': res['total'] ?? 0,
    };
  }

  Future<OrderModel> getOrderById(String id) async {
    final res = await _api.get('/orders/$id');
    return OrderModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> cancelOrder(String id) async {
    await _api.patch('/orders/$id/cancel', {});
  }
}
