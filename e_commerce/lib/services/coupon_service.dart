import 'package:e_commerce/models/coupon_model.dart';
import 'package:e_commerce/services/api_service.dart';

class CouponService {
  final _api = ApiService();

  Future<CouponModel> validateCoupon(String code, double orderAmount) async {
    final res = await _api.post('/coupons/validate', {'code': code, 'orderAmount': orderAmount});
    return CouponModel.fromJson(res['data'] as Map<String, dynamic>);
  }
}
