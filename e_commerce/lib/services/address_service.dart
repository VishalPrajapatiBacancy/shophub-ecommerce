import 'package:e_commerce/models/address_model.dart';
import 'package:e_commerce/services/api_service.dart';

class AddressService {
  final _api = ApiService();

  Future<List<AddressModel>> getAddresses() async {
    final res = await _api.get('/addresses');
    final data = res['data'] as List? ?? [];
    return data.map((e) => AddressModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<AddressModel> createAddress(AddressModel address) async {
    final res = await _api.post('/addresses', address.toJson());
    return AddressModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<AddressModel> updateAddress(String id, AddressModel address) async {
    final res = await _api.put('/addresses/$id', address.toJson());
    return AddressModel.fromJson(res['data'] as Map<String, dynamic>);
  }

  Future<void> deleteAddress(String id) async {
    await _api.delete('/addresses/$id');
  }

  Future<void> setDefault(String id) async {
    await _api.patch('/addresses/$id/default', {});
  }
}
