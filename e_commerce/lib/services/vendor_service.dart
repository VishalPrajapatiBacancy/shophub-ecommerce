import '../models/vendor_model.dart';
import '../models/product_model.dart';
import 'api_service.dart';

class VendorService {
  final ApiService _api = ApiService();

  Future<List<VendorModel>> getVendors({String? search, int page = 1, int limit = 20}) async {
    final params = <String, String>{
      'page': '$page',
      'limit': '$limit',
      if (search != null && search.isNotEmpty) 'search': search,
    };
    final res = await _api.get('/vendors', params: params);
    final list = (res['data'] as List?) ?? [];
    return list.map((e) => VendorModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<VendorModel> getVendor(String idOrSlug) async {
    final res = await _api.get('/vendors/$idOrSlug');
    return VendorModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<List<ProductModel>> getVendorProducts(String vendorId, {String? search, String? category, int page = 1, int limit = 20}) async {
    final params = <String, String>{
      'page': '$page',
      'limit': '$limit',
      if (search != null && search.isNotEmpty) 'search': search,
      if (category != null && category.isNotEmpty) 'category': category,
    };
    final res = await _api.get('/vendors/$vendorId/products', params: params);
    final list = (res['data'] as List?) ?? [];
    return list.map((e) => ProductModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
