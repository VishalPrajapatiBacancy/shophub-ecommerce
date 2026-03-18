import 'package:e_commerce/models/product_model.dart';
import 'package:e_commerce/models/review_model.dart';
import 'package:e_commerce/services/api_service.dart';

class ProductService {
  final _api = ApiService();

  Future<Map<String, dynamic>> getProducts({
    int page = 1,
    int limit = 20,
    String? search,
    String? category,
    String? sort,
    String? status,
  }) async {
    final params = <String, String>{
      'page': page.toString(),
      'limit': limit.toString(),
    };
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (sort != null && sort.isNotEmpty) params['sort'] = sort;
    if (status != null && status.isNotEmpty) params['status'] = status;

    final res = await _api.get('/products', params: params);
    final data = res['data'] as List? ?? [];
    return {
      'products': data.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList(),
      'total': res['total'] ?? 0,
      'totalPages': res['totalPages'] ?? 1,
    };
  }

  Future<ProductModel> getProductById(String id) async {
    final res = await _api.get('/products/$id');
    return ProductModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ReviewModel>> getProductReviews(String productId, {int page = 1}) async {
    final res = await _api.get('/products/$productId/reviews', params: {'page': page.toString()});
    final data = res['data'] as List? ?? [];
    return data.map((e) => ReviewModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> submitReview(String productId, {required int rating, String? title, String? comment}) async {
    await _api.post('/products/$productId/reviews', {
      'rating': rating,
      if (title != null) 'title': title,
      if (comment != null) 'comment': comment,
    });
  }
}
