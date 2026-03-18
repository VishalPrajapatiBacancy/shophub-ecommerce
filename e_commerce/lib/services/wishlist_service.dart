import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/services/api_service.dart';

class WishlistService {
  final _api = ApiService();

  Future<List<ProductModel>> getWishlist() async {
    final res = await _api.get('/wishlist');
    final data = res['data'] as List? ?? [];
    return data.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> addToWishlist(String productId) async {
    await _api.post('/wishlist', {'productId': productId});
  }

  Future<void> removeFromWishlist(String productId) async {
    await _api.delete('/wishlist/$productId');
  }

  Future<bool> checkWishlist(String productId) async {
    try {
      final res = await _api.get('/wishlist/check', params: {'productId': productId});
      return res['data'] == true || res['inWishlist'] == true;
    } catch (_) {
      return false;
    }
  }
}
