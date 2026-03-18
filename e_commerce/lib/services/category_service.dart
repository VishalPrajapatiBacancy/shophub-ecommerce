import 'package:e_commerce/models/category_model.dart';
import 'package:e_commerce/services/api_service.dart';

class CategoryService {
  final _api = ApiService();

  Future<List<CategoryModel>> getCategories() async {
    final res = await _api.get('/categories');
    final data = res['data'] as List? ?? [];
    return data.map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
