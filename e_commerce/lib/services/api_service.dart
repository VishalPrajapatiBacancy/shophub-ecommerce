import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:e_commerce/config/app_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  final String _baseUrl = AppConfig.apiBaseUrl;

  Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Map<String, String> _headers(String? token) {
    final headers = <String, String>{'Content-Type': 'application/json'};
    if (token != null) headers['Authorization'] = 'Bearer $token';
    return headers;
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final body = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) return body;
    throw Exception(body['message']?.toString() ?? 'Request failed (${response.statusCode})');
  }

  String _buildUrl(String path, {Map<String, String>? params}) {
    final uri = Uri.parse('$_baseUrl$path');
    if (params == null || params.isEmpty) return uri.toString();
    return uri.replace(queryParameters: params).toString();
  }

  Future<Map<String, dynamic>> get(String path, {Map<String, String>? params}) async {
    final token = await _getToken();
    final res = await http.get(Uri.parse(_buildUrl(path, params: params)), headers: _headers(token));
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final token = await _getToken();
    final res = await http.post(Uri.parse('$_baseUrl$path'), headers: _headers(token), body: jsonEncode(body));
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> put(String path, Map<String, dynamic> body) async {
    final token = await _getToken();
    final res = await http.put(Uri.parse('$_baseUrl$path'), headers: _headers(token), body: jsonEncode(body));
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body) async {
    final token = await _getToken();
    final res = await http.patch(Uri.parse('$_baseUrl$path'), headers: _headers(token), body: jsonEncode(body));
    return _handleResponse(res);
  }

  Future<Map<String, dynamic>> delete(String path) async {
    final token = await _getToken();
    final res = await http.delete(Uri.parse('$_baseUrl$path'), headers: _headers(token));
    return _handleResponse(res);
  }
}
