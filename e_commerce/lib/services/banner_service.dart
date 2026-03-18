import 'package:e_commerce/models/banner_model.dart';
import 'package:e_commerce/services/api_service.dart';

class BannerService {
  final _api = ApiService();

  Future<List<BannerModel>> getBanners() async {
    final res = await _api.get('/banners');
    final data = res['data'] as List? ?? [];
    return data.map((e) => BannerModel.fromJson(e as Map<String, dynamic>)).toList();
  }
}
