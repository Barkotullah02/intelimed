import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
import '../api/models.dart';

enum AuthStatus { unknown, loggedOut, authenticating, loggedIn, guest }

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._api) {
    restore();
  }
  final ApiClient _api;

  // Starts as `unknown` while we check for a persisted session, so the UI can show
  // a splash instead of flashing the login screen on every cold start.
  AuthStatus _status = AuthStatus.unknown;
  ApiUser? _user;
  String? _error;

  AuthStatus get status => _status;
  ApiUser? get user => _user;
  String? get error => _error;
  bool get isRestoring => _status == AuthStatus.unknown;
  bool get isSignedIn => _status == AuthStatus.loggedIn || _status == AuthStatus.guest;

  static const _kUser = 'auth_user';

  /// On startup, resume a saved session: load persisted tokens + user and validate
  /// with /auth/me (which auto-refreshes an expired access token). If the device is
  /// simply offline, we keep the saved session rather than kicking the user out — so
  /// they stay logged in until they explicitly log out. Only a real auth rejection
  /// (invalid/expired token) clears the session.
  Future<void> restore() async {
    final hasToken = await _api.loadSession();
    final savedUser = await _loadUser();
    if (!hasToken) {
      _status = AuthStatus.loggedOut;
      notifyListeners();
      return;
    }
    try {
      _user = await _api.me();
      await _saveUser(_user!);
      _status = AuthStatus.loggedIn;
    } on ApiException catch (e) {
      if (_isNetworkError(e) && savedUser != null) {
        _user = savedUser; // offline: trust the saved session
        _status = AuthStatus.loggedIn;
      } else {
        await _clearSession();
        _status = AuthStatus.loggedOut;
      }
    }
    notifyListeners();
  }

  bool _isNetworkError(ApiException e) =>
      e.message.contains('reach the server') || e.message.contains('took too long');

  Future<void> _saveUser(ApiUser user) async {
    final p = await SharedPreferences.getInstance();
    await p.setString(_kUser, jsonEncode(user.toJson()));
  }

  Future<ApiUser?> _loadUser() async {
    final p = await SharedPreferences.getInstance();
    final raw = p.getString(_kUser);
    if (raw == null) return null;
    try {
      return ApiUser.fromJson(jsonDecode(raw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> _clearSession() async {
    _api.clearTokens();
    _user = null;
    final p = await SharedPreferences.getInstance();
    await p.remove(_kUser);
  }

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.authenticating;
    _error = null;
    notifyListeners();
    try {
      await _api.login(email, password);
      _user = await _api.me();
      await _saveUser(_user!);
      _status = AuthStatus.loggedIn;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _status = AuthStatus.loggedOut;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String email, String password, String role, {String? specialization, String? licenseNumber}) async {
    _status = AuthStatus.authenticating;
    _error = null;
    notifyListeners();
    try {
      await _api.register(name, email, password, role, specialization: specialization, licenseNumber: licenseNumber);
      _user = await _api.me();
      await _saveUser(_user!);
      _status = AuthStatus.loggedIn;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _status = AuthStatus.loggedOut;
      notifyListeners();
      return false;
    }
  }

  /// Enter the app without a backend session (keeps the offline demo usable).
  void continueAsGuest() {
    _status = AuthStatus.guest;
    _error = null;
    notifyListeners();
  }

  Future<void> logout() async {
    await _api.logout();
    await _clearSession();
    _status = AuthStatus.loggedOut;
    notifyListeners();
  }
}
