import 'package:flutter/foundation.dart';
import '../api/api_client.dart';
import '../api/models.dart';

enum AuthStatus { loggedOut, authenticating, loggedIn, guest }

class AuthProvider extends ChangeNotifier {
  AuthProvider(this._api);
  final ApiClient _api;

  AuthStatus _status = AuthStatus.loggedOut;
  ApiUser? _user;
  String? _error;

  AuthStatus get status => _status;
  ApiUser? get user => _user;
  String? get error => _error;
  bool get isSignedIn => _status == AuthStatus.loggedIn || _status == AuthStatus.guest;

  Future<bool> login(String email, String password) async {
    _status = AuthStatus.authenticating;
    _error = null;
    notifyListeners();
    try {
      await _api.login(email, password);
      _user = await _api.me();
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
    _user = null;
    _status = AuthStatus.loggedOut;
    notifyListeners();
  }
}
