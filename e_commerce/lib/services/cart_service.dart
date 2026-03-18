import 'package:e_commerce/models/cart_item_model.dart';
import 'package:e_commerce/services/api_service.dart';

class CartService {
  final _api = ApiService();

  List<CartItemModel> _parseItems(dynamic data) {
    if (data is List) return data.map((e) => CartItemModel.fromJson(e as Map<String, dynamic>)).toList();
    if (data is Map && data['items'] is List) {
      return (data['items'] as List).map((e) => CartItemModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    return [];
  }

  Future<List<CartItemModel>> getCart() async {
    final res = await _api.get('/cart');
    return _parseItems(res['data']);
  }

  Future<List<CartItemModel>> addToCart(String productId, int quantity, {String? variantSku}) async {
    final body = <String, dynamic>{'productId': productId, 'quantity': quantity};
    if (variantSku != null) body['variantSku'] = variantSku;
    final res = await _api.post('/cart/add', body);
    return _parseItems(res['data']);
  }

  Future<List<CartItemModel>> updateCart(List<CartItemModel> items) async {
    final res = await _api.put('/cart', {'items': items.map((e) => e.toJson()).toList()});
    return _parseItems(res['data']);
  }

  Future<List<CartItemModel>> removeFromCart(String productId) async {
    final res = await _api.delete('/cart/item/$productId');
    return _parseItems(res['data']);
  }

  Future<void> clearCart() async {
    await _api.delete('/cart/clear');
  }
}
