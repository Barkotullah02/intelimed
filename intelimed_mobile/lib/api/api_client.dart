import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'models.dart';

/// Base URL of the Spring REST API.
///
/// Production VPS (Hetzner) — reachable from any device (emulator or real phone).
/// For local dev instead, use one of:
///   - iOS simulator / desktop: `http://localhost:8080/api`
///   - Android emulator:        `http://10.0.2.2:8080/api`
///   - Physical device on LAN:  `http://<your-machine-ip>:8080/api`
const String kApiBase = 'http://91.98.154.10:8080/api';

/// Thin HTTP client for the IntelliMeds API: attaches the bearer token,
/// unwraps the `{ success, message, data }` envelope, and refreshes on 401.
class ApiClient {
  ApiClient({http.Client? client, this.baseUrl = kApiBase}) : _http = client ?? http.Client();

  final http.Client _http;
  final String baseUrl;

  String? _accessToken;
  String? _refreshToken;

  bool get isAuthenticated => _accessToken != null;

  /// Exposed so the WebRTC signaling WebSocket can authenticate (`?token=`).
  String? get accessToken => _accessToken;

  static const _kAccess = 'access_token';
  static const _kRefresh = 'refresh_token';

  void setTokens(String access, String refresh) {
    _accessToken = access;
    _refreshToken = refresh;
    // Persist so the session survives an app restart (fire-and-forget).
    SharedPreferences.getInstance().then((p) {
      p.setString(_kAccess, access);
      p.setString(_kRefresh, refresh);
    });
  }

  void clearTokens() {
    _accessToken = null;
    _refreshToken = null;
    SharedPreferences.getInstance().then((p) {
      p.remove(_kAccess);
      p.remove(_kRefresh);
    });
  }

  /// Load any persisted tokens into memory. Returns true if a token was restored,
  /// meaning we can attempt to resume the previous session.
  Future<bool> loadSession() async {
    final p = await SharedPreferences.getInstance();
    _accessToken = p.getString(_kAccess);
    _refreshToken = p.getString(_kRefresh);
    return _accessToken != null;
  }

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_accessToken != null) 'Authorization': 'Bearer $_accessToken',
      };

  /// Max time to wait for any single request. The AI endpoint can legitimately take
  /// ~7-25s (Gemini), so this is generous — without it the app would hang forever.
  static const Duration _timeout = Duration(seconds: 60);

  Future<dynamic> _send(String method, String path, {Object? body, bool retry = true}) async {
    final uri = Uri.parse('$baseUrl$path');
    late http.Response res;
    try {
      switch (method) {
        case 'POST':
          res = await _http.post(uri, headers: _headers, body: body == null ? null : jsonEncode(body)).timeout(_timeout);
        case 'PUT':
          res = await _http.put(uri, headers: _headers, body: body == null ? null : jsonEncode(body)).timeout(_timeout);
        case 'DELETE':
          res = await _http.delete(uri, headers: _headers).timeout(_timeout);
        default:
          res = await _http.get(uri, headers: _headers).timeout(_timeout);
      }
    } on TimeoutException {
      throw ApiException('The server took too long to respond. Please try again.');
    } catch (e) {
      throw ApiException('Cannot reach the server. Is the API running?');
    }

    if (res.statusCode == 401 && retry && _refreshToken != null) {
      if (await _refresh()) return _send(method, path, body: body, retry: false);
    }

    final Map<String, dynamic> json = res.body.isNotEmpty
        ? jsonDecode(res.body) as Map<String, dynamic>
        : <String, dynamic>{'success': false, 'message': 'Empty response'};

    if (res.statusCode >= 200 && res.statusCode < 300 && json['success'] == true) {
      return json['data'];
    }
    throw ApiException((json['message'] as String?) ?? 'Request failed (${res.statusCode})');
  }

  Future<bool> _refresh() async {
    try {
      final res = await _http.post(
        Uri.parse('$baseUrl/auth/refresh-token'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'refreshToken': _refreshToken}),
      );
      final json = jsonDecode(res.body) as Map<String, dynamic>;
      if (json['success'] == true) {
        final auth = ApiAuth.fromJson(json['data'] as Map<String, dynamic>);
        setTokens(auth.accessToken, auth.refreshToken);
        return true;
      }
    } catch (_) {/* fall through */}
    clearTokens();
    return false;
  }

  // ---------------- Auth ----------------
  Future<ApiAuth> login(String email, String password) async {
    final data = await _send('POST', '/auth/login', body: {'email': email, 'password': password});
    final auth = ApiAuth.fromJson(data as Map<String, dynamic>);
    setTokens(auth.accessToken, auth.refreshToken);
    return auth;
  }

  Future<ApiAuth> register(String name, String email, String password, String role, {String? specialization, String? licenseNumber, String? hospital, int? experienceYears}) async {
    final body = <String, dynamic>{'name': name, 'email': email, 'password': password, 'role': role};
    if (role == 'ROLE_HEALTHCARE_PROFESSIONAL') {
      body['specialization'] = specialization ?? '';
      body['licenseNumber'] = licenseNumber ?? '';
      if (hospital != null) body['hospital'] = hospital;
      if (experienceYears != null) body['experienceYears'] = experienceYears;
    }
    final data = await _send('POST', '/auth/register', body: body);
    final auth = ApiAuth.fromJson(data as Map<String, dynamic>);
    setTokens(auth.accessToken, auth.refreshToken);
    return auth;
  }

  Future<ApiUser> me() async {
    final data = await _send('GET', '/auth/me');
    return ApiUser.fromJson(data as Map<String, dynamic>);
  }

  Future<void> logout() async {
    try {
      await _send('POST', '/auth/logout');
    } finally {
      clearTokens();
    }
  }

  // ---------------- Drugs ----------------
  Future<List<ApiDrug>> listDrugs() async {
    final data = await _send('GET', '/drugs');
    return (data as List).map((e) => ApiDrug.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<ApiDrug>> searchDrugs(String keyword) async {
    final data = await _send('GET', '/drugs/search?keyword=${Uri.encodeComponent(keyword)}');
    return (data as List).map((e) => ApiDrug.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ApiDrug> getDrug(String id) async {
    final data = await _send('GET', '/drugs/$id');
    return ApiDrug.fromJson(data as Map<String, dynamic>);
  }

  Future<List<ApiDrug>> getDrugAlternatives(String id) async {
    final data = await _send('GET', '/drugs/$id/alternatives');
    return (data as List).map((e) => ApiDrug.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ---------------- Interactions ----------------
  Future<ApiInteractionCheckResponse> checkInteractions(List<String> drugIds) async {
    final data = await _send('POST', '/interactions/check', body: {'drugIds': drugIds});
    return ApiInteractionCheckResponse.fromJson(data as Map<String, dynamic>);
  }

  Future<List<ApiDrugInteractionSummary>> getDrugInteractions(String drugId, {int limit = 50}) async {
    final data = await _send('GET', '/interactions/for-drug/$drugId?limit=$limit');
    return (data as List).map((e) => ApiDrugInteractionSummary.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<List<ApiInteractionHistory>> getInteractionHistory() async {
    final data = await _send('GET', '/interactions/history');
    return (data as List).map((e) => ApiInteractionHistory.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ---------------- Doctors ----------------
  Future<List<ApiDoctor>> listVerifiedDoctors() async {
    final data = await _send('GET', '/doctors/verified');
    return (data as List).map((e) => ApiDoctor.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ApiDoctor> getDoctor(String id) async {
    final data = await _send('GET', '/doctors/$id');
    return ApiDoctor.fromJson(data as Map<String, dynamic>);
  }

  /// The signed-in professional's own doctor record (verification status + credentials).
  Future<ApiDoctor> getMyDoctorApplication() async {
    final data = await _send('GET', '/doctors/me');
    return ApiDoctor.fromJson(data as Map<String, dynamic>);
  }

  // ---------------- Consultations (video/audio) ----------------
  Future<List<ApiConsultation>> listMyConsultations() async {
    final data = await _send('GET', '/consultations/mine');
    return (data as List).map((e) => ApiConsultation.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Open (or rejoin) the call for a CONFIRMED appointment once it's time.
  /// This is the only way to start a consultation — no ad-hoc calling.
  Future<ApiConsultation> joinAppointmentCall(String appointmentId) async {
    final data = await _send('POST', '/consultations/appointments/$appointmentId/join');
    return ApiConsultation.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiConsultation> joinConsultation(String id) async {
    final data = await _send('POST', '/consultations/$id/join');
    return ApiConsultation.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiConsultation> endConsultation(String id) async {
    final data = await _send('POST', '/consultations/$id/end');
    return ApiConsultation.fromJson(data as Map<String, dynamic>);
  }

  // ---------------- Prescriptions ----------------
  /// Doctor writes/updates the prescription for a consultation.
  Future<ApiPrescription> savePrescription(String consultationId, {String? advice, required List<ApiPrescriptionItem> items}) async {
    final data = await _send('PUT', '/consultations/$consultationId/prescription', body: {
      if (advice != null) 'advice': advice,
      'items': items.map((e) => e.toJson()).toList(),
    });
    return ApiPrescription.fromJson(data as Map<String, dynamic>);
  }

  /// Read a consultation's prescription. Returns null if none has been written yet.
  Future<ApiPrescription?> getPrescription(String consultationId) async {
    final data = await _send('GET', '/consultations/$consultationId/prescription');
    if (data == null) return null;
    return ApiPrescription.fromJson(data as Map<String, dynamic>);
  }

  /// All prescriptions written for the signed-in patient.
  Future<List<ApiPrescription>> listMyPrescriptions() async {
    final data = await _send('GET', '/prescriptions/mine');
    return (data as List).map((e) => ApiPrescription.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ---------------- Reminders ----------------
  Future<List<ApiReminder>> listReminders() async {
    final data = await _send('GET', '/reminders');
    return (data as List).map((e) => ApiReminder.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ApiReminder> createReminder({required String drugId, required String reminderTime, required String frequency, String? dosage, required String startDate, String? endDate, bool notificationEnabled = true}) async {
    // Ensure ISO format: reminderTime as HH:mm:ss, dates as yyyy-MM-dd
    final timeParts = reminderTime.split(':');
    final isoTime = timeParts.length == 2 ? '$reminderTime:00' : reminderTime;

    final data = await _send('POST', '/reminders', body: {
      'drugId': drugId,
      'reminderTime': isoTime,
      'frequency': frequency,
      if (dosage != null) 'dosage': dosage,
      'startDate': startDate,
      if (endDate != null) 'endDate': endDate,
      'notificationEnabled': notificationEnabled,
    });
    return ApiReminder.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteReminder(String id) async {
    await _send('DELETE', '/reminders/$id');
  }

  // ---------------- AI / Chat ----------------
  Future<ApiChatResponse> sendMessage(String message, {String? sessionId}) async {
    final data = await _send('POST', '/chat', body: {
      'message': message,
      if (sessionId != null) 'sessionId': sessionId,
    });
    return ApiChatResponse.fromJson(data as Map<String, dynamic>);
  }

  Future<List<ApiChatHistory>> getChatHistory() async {
    final data = await _send('GET', '/chat/history');
    return (data as List).map((e) => ApiChatHistory.fromJson(e as Map<String, dynamic>)).toList();
  }

  // ---------------- Appointments ----------------
  Future<List<ApiAppointment>> listAppointments() async {
    final data = await _send('GET', '/appointments');
    return (data as List).map((e) => ApiAppointment.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Appointments for the signed-in doctor.
  Future<List<ApiAppointment>> listDoctorAppointments() async {
    final data = await _send('GET', '/appointments/doctor');
    return (data as List).map((e) => ApiAppointment.fromJson(e as Map<String, dynamic>)).toList();
  }

  /// Patient books a slot with a doctor. [appointmentDate] must be ISO-8601 (local).
  Future<ApiAppointment> bookAppointment({
    required String doctorId,
    required String appointmentDate,
    String callType = 'VIDEO',
    String? reason,
  }) async {
    final data = await _send('POST', '/appointments', body: {
      'doctorId': doctorId,
      'appointmentDate': appointmentDate,
      'callType': callType,
      if (reason != null && reason.isNotEmpty) 'reason': reason,
    });
    return ApiAppointment.fromJson(data as Map<String, dynamic>);
  }

  Future<ApiAppointment> acceptAppointment(String id) async =>
      ApiAppointment.fromJson(await _send('POST', '/appointments/$id/accept') as Map<String, dynamic>);

  Future<ApiAppointment> declineAppointment(String id) async =>
      ApiAppointment.fromJson(await _send('POST', '/appointments/$id/decline') as Map<String, dynamic>);

  Future<ApiAppointment> cancelAppointment(String id) async =>
      ApiAppointment.fromJson(await _send('POST', '/appointments/$id/cancel') as Map<String, dynamic>);

  // ---------------- Notifications ----------------
  Future<List<ApiNotification>> listNotifications() async {
    final data = await _send('GET', '/notifications');
    return (data as List).map((e) => ApiNotification.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> markNotificationRead(String id) async {
    await _send('PUT', '/notifications/$id/read');
  }
}
