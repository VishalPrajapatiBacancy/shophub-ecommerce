import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:e_commerce/services/api_service.dart';

class AuthUser {
  final String id;
  final String name;
  final String email;
  final String role;

  const AuthUser({required this.id, required this.name, required this.email, required this.role});

  factory AuthUser.fromJson(Map<String, dynamic> json) {
    return AuthUser(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'customer',
    );
  }
}

class AuthProvider extends ChangeNotifier {
  final _api = ApiService();

  AuthUser? _user;
  String? _token;
  bool _isLoading = false;
  bool _initialized = false;
  String? _error;

  AuthUser? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get initialized => _initialized;
  String? get error => _error;
  bool get isLoggedIn => _token != null && _user != null;

  Future<void> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    final userData = prefs.getString('user_data');
    if (token != null && userData != null) {
      // Validate the stored token by calling the profile endpoint
      try {
        final res = await _api.get('/users/profile');
        if (res['success'] == true && res['data'] != null) {
          _token = token;
          // Use fresh data from server
          _user = AuthUser.fromJson(res['data'] as Map<String, dynamic>);
          // Update stored user data with fresh info
          await prefs.setString('user_data', jsonEncode(res['data']));
        } else {
          // Token invalid, clear stored data
          await prefs.remove('auth_token');
          await prefs.remove('user_data');
        }
      } catch (_) {
        // Token expired or network error — keep stored data for offline access
        // but if it's an auth error, clear it
        _token = token;
        _user = AuthUser.fromJson(jsonDecode(userData) as Map<String, dynamic>);
      }
    }
    _initialized = true;
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _api.post('/users/login', {'email': email, 'password': password});
      final data = res['data'] as Map<String, dynamic>;
      _token = data['token']?.toString();
      _user = AuthUser.fromJson(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('user_data', jsonEncode(data));
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final res = await _api.post('/users/register', {'name': name, 'email': email, 'password': password});
      final data = res['data'] as Map<String, dynamic>;
      _token = data['token']?.toString();
      _user = AuthUser.fromJson(data);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_token', _token!);
      await prefs.setString('user_data', jsonEncode(data));
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceFirst('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _user = null;
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('user_data');
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
