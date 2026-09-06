// Models mirrored from the Spring REST API DTOs.

class ApiAuth {
  const ApiAuth({required this.accessToken, required this.refreshToken, required this.email, required this.name, required this.role});
  final String accessToken;
  final String refreshToken;
  final String email;
  final String name;
  final String role;

  factory ApiAuth.fromJson(Map<String, dynamic> j) => ApiAuth(
        accessToken: j['accessToken'] as String? ?? '',
        refreshToken: j['refreshToken'] as String? ?? '',
        email: j['email'] as String? ?? '',
        name: j['name'] as String? ?? '',
        role: j['role'] as String? ?? '',
      );
}

class ApiUser {
  const ApiUser({required this.id, required this.email, required this.name, required this.role});
  final String id;
  final String email;
  final String name;
  final String role;

  factory ApiUser.fromJson(Map<String, dynamic> j) => ApiUser(
        id: j['id']?.toString() ?? '',
        email: j['email'] as String? ?? '',
        name: j['name'] as String? ?? '',
        role: j['role'] as String? ?? '',
      );

  Map<String, dynamic> toJson() => {'id': id, 'email': email, 'name': name, 'role': role};
}

class ApiDrug {
  const ApiDrug({required this.id, required this.name, required this.generic, required this.drugClass, this.description, this.uses, this.sideEffects, this.contraindications, this.dosageForm, this.dosage, this.pregnancySafety, this.storage, this.manufacturerName, this.imageUrl});
  final String id;
  final String name;
  final String generic;
  final String drugClass;
  final String? description;
  final String? uses;
  final String? sideEffects;
  final String? contraindications;
  final String? dosageForm;
  final String? dosage;
  final String? pregnancySafety;
  final String? storage;
  final String? manufacturerName;
  final String? imageUrl;

  factory ApiDrug.fromJson(Map<String, dynamic> j) => ApiDrug(
        id: j['id']?.toString() ?? '',
        name: (j['brandName'] as String?)?.isNotEmpty == true ? j['brandName'] as String : (j['genericName'] as String? ?? '—'),
        generic: j['genericName'] as String? ?? '',
        drugClass: (j['categoryName'] as String?) ?? (j['dosageForm'] as String?) ?? '—',
        description: j['description'] as String?,
        uses: j['uses'] as String?,
        sideEffects: j['sideEffects'] as String?,
        contraindications: j['contraindications'] as String?,
        dosageForm: j['dosageForm'] as String?,
        dosage: j['dosage'] as String?,
        pregnancySafety: j['pregnancySafety'] as String?,
        storage: j['storage'] as String?,
        manufacturerName: j['manufacturerName'] as String?,
        imageUrl: j['imageUrl'] as String?,
      );
}

class ApiInteractionCheckResponse {
  const ApiInteractionCheckResponse({required this.highestSeverity, required this.interactions, this.aiExplanation});
  final String highestSeverity;
  final List<ApiInteractionDetail> interactions;
  final String? aiExplanation;

  factory ApiInteractionCheckResponse.fromJson(Map<String, dynamic> j) => ApiInteractionCheckResponse(
        highestSeverity: j['highestSeverity'] as String? ?? 'NONE',
        interactions: (j['interactions'] as List<dynamic>? ?? []).map((e) => ApiInteractionDetail.fromJson(e as Map<String, dynamic>)).toList(),
        aiExplanation: j['aiExplanation'] as String?,
      );
}

class ApiInteractionDetail {
  const ApiInteractionDetail({required this.drugA, required this.drugB, required this.severity, this.description, this.recommendation});
  final String drugA;
  final String drugB;
  final String severity;
  final String? description;
  final String? recommendation;

  factory ApiInteractionDetail.fromJson(Map<String, dynamic> j) => ApiInteractionDetail(
        drugA: j['drugA'] as String? ?? '',
        drugB: j['drugB'] as String? ?? '',
        severity: j['severity'] as String? ?? 'UNKNOWN',
        description: j['description'] as String?,
        recommendation: j['recommendation'] as String?,
      );
}

class ApiDrugInteractionSummary {
  const ApiDrugInteractionSummary({required this.otherDrugId, required this.otherDrugName, required this.severity});
  final String otherDrugId;
  final String otherDrugName;
  final String severity;

  factory ApiDrugInteractionSummary.fromJson(Map<String, dynamic> j) => ApiDrugInteractionSummary(
        otherDrugId: j['otherDrugId']?.toString() ?? '',
        otherDrugName: j['otherDrugName'] as String? ?? '',
        severity: j['severity'] as String? ?? 'UNKNOWN',
      );
}

class ApiDoctor {
  const ApiDoctor({required this.id, required this.fullName, required this.specialization, this.hospital, this.experienceYears, this.consultationFee, this.bio, this.verified, this.verificationStatus, this.available, this.licenseNumber, this.profileImage});
  final String id;
  final String fullName;
  final String specialization;
  final String? hospital;
  final int? experienceYears;
  final double? consultationFee;
  final String? bio;
  final bool? verified;
  final String? verificationStatus;
  final bool? available;
  final String? licenseNumber;
  final String? profileImage;

  factory ApiDoctor.fromJson(Map<String, dynamic> j) => ApiDoctor(
        id: j['id']?.toString() ?? '',
        fullName: j['fullName'] as String? ?? '',
        specialization: j['specialization'] as String? ?? '',
        hospital: j['hospital'] as String?,
        experienceYears: j['experienceYears'] as int?,
        consultationFee: (j['consultationFee'] as num?)?.toDouble(),
        bio: j['bio'] as String?,
        verified: j['verified'] as bool?,
        verificationStatus: j['verificationStatus'] as String?,
        available: j['available'] as bool?,
        licenseNumber: j['licenseNumber'] as String?,
        profileImage: j['profileImage'] as String?,
      );
}

class ApiReminder {
  const ApiReminder({required this.id, this.drugId, this.drugName, this.reminderTime, this.frequency, this.dosage, this.startDate, this.endDate, this.notificationEnabled, this.isActive});
  final String id;
  final String? drugId;
  final String? drugName;
  final String? reminderTime;
  final String? frequency;
  final String? dosage;
  final String? startDate;
  final String? endDate;
  final bool? notificationEnabled;
  final bool? isActive;

  factory ApiReminder.fromJson(Map<String, dynamic> j) => ApiReminder(
        id: j['id']?.toString() ?? '',
        drugId: j['drugId']?.toString(),
        drugName: j['drugName'] as String?,
        reminderTime: j['reminderTime'] as String?,
        frequency: j['frequency'] as String?,
        dosage: j['dosage'] as String?,
        startDate: j['startDate'] as String?,
        endDate: j['endDate'] as String?,
        notificationEnabled: j['notificationEnabled'] as bool?,
        isActive: j['isActive'] as bool?,
      );
}

class ApiInteractionHistory {
  const ApiInteractionHistory({required this.id, this.drugIds, this.resultSummary, this.highestSeverity, this.checkedAt});
  final String id;
  final String? drugIds;
  final String? resultSummary;
  final String? highestSeverity;
  final String? checkedAt;

  factory ApiInteractionHistory.fromJson(Map<String, dynamic> j) => ApiInteractionHistory(
        id: j['id']?.toString() ?? '',
        drugIds: j['drugIds'] as String?,
        resultSummary: j['resultSummary'] as String?,
        highestSeverity: j['highestSeverity'] as String?,
        checkedAt: j['checkedAt'] as String?,
      );
}

class ApiChatResponse {
  const ApiChatResponse({required this.message, this.sessionId});
  final String message;
  final String? sessionId;

  factory ApiChatResponse.fromJson(Map<String, dynamic> j) => ApiChatResponse(
        message: j['message'] as String? ?? '',
        sessionId: j['sessionId'] as String?,
      );
}

class ApiChatHistory {
  const ApiChatHistory({required this.id, required this.messageRole, required this.messageContent, this.sessionId, this.createdAt});
  final String id;
  final String messageRole;
  final String messageContent;
  final String? sessionId;
  final String? createdAt;

  factory ApiChatHistory.fromJson(Map<String, dynamic> j) => ApiChatHistory(
        id: j['id']?.toString() ?? '',
        messageRole: j['messageRole'] as String? ?? '',
        messageContent: j['messageContent'] as String? ?? '',
        sessionId: j['sessionId'] as String?,
        createdAt: j['createdAt'] as String?,
      );
}

class ApiAppointment {
  const ApiAppointment({required this.id, this.patientId, this.patientName, this.doctorId, this.doctorName, this.doctorSpecialization, this.appointmentDate, this.status, this.callType, this.joinable = false, this.reason});
  final String id;
  final String? patientId;
  final String? patientName;
  final String? doctorId;
  final String? doctorName;
  final String? doctorSpecialization;
  final String? appointmentDate;
  final String? status;
  final String? callType;
  /// Backend-computed: true when CONFIRMED and it's time to join.
  final bool joinable;
  final String? reason;

  bool get isVideo => (callType ?? 'VIDEO').toUpperCase() == 'VIDEO';
  bool get isPending => status == 'PENDING';
  bool get isConfirmed => status == 'CONFIRMED';
  DateTime? get scheduledAt => appointmentDate == null ? null : DateTime.tryParse(appointmentDate!);

  factory ApiAppointment.fromJson(Map<String, dynamic> j) => ApiAppointment(
        id: j['id']?.toString() ?? '',
        patientId: j['patientId']?.toString(),
        patientName: j['patientName'] as String?,
        doctorId: j['doctorId']?.toString(),
        doctorName: j['doctorName'] as String?,
        doctorSpecialization: j['doctorSpecialization'] as String?,
        appointmentDate: j['appointmentDate'] as String?,
        status: j['status'] as String?,
        callType: j['callType'] as String?,
        joinable: j['joinable'] as bool? ?? false,
        reason: j['reason'] as String?,
      );
}

class ApiIceServer {
  const ApiIceServer({required this.urls, this.username, this.credential});
  final List<String> urls;
  final String? username;
  final String? credential;

  factory ApiIceServer.fromJson(Map<String, dynamic> j) => ApiIceServer(
        urls: (j['urls'] as List<dynamic>? ?? []).map((e) => e.toString()).toList(),
        username: j['username'] as String?,
        credential: j['credential'] as String?,
      );

  /// Shape expected by flutter_webrtc's RTCPeerConnection config.
  Map<String, dynamic> toRtc() => {
        'urls': urls,
        if (username != null && username!.isNotEmpty) 'username': username,
        if (credential != null && credential!.isNotEmpty) 'credential': credential,
      };
}

class ApiConsultation {
  const ApiConsultation({
    required this.id,
    required this.roomCode,
    required this.callType,
    required this.status,
    required this.patientId,
    required this.patientName,
    required this.doctorId,
    required this.doctorName,
    required this.selfIsDoctor,
    required this.signalingUrl,
    required this.iceServers,
    this.createdAt,
    this.startedAt,
    this.endedAt,
  });
  final String id;
  final String roomCode;
  final String callType; // VIDEO | AUDIO
  final String status; // SCHEDULED | ACTIVE | ENDED | CANCELLED
  final String patientId;
  final String patientName;
  final String doctorId;
  final String doctorName;
  final bool selfIsDoctor;
  final String signalingUrl;
  final List<ApiIceServer> iceServers;
  final String? createdAt;
  final String? startedAt;
  final String? endedAt;

  bool get isVideo => callType == 'VIDEO';
  bool get isLive => status == 'SCHEDULED' || status == 'ACTIVE';

  factory ApiConsultation.fromJson(Map<String, dynamic> j) => ApiConsultation(
        id: j['id']?.toString() ?? '',
        roomCode: j['roomCode'] as String? ?? '',
        callType: j['callType'] as String? ?? 'VIDEO',
        status: j['status'] as String? ?? 'SCHEDULED',
        patientId: j['patientId']?.toString() ?? '',
        patientName: j['patientName'] as String? ?? '',
        doctorId: j['doctorId']?.toString() ?? '',
        doctorName: j['doctorName'] as String? ?? '',
        selfIsDoctor: j['self_isDoctor'] as bool? ?? false,
        signalingUrl: j['signalingUrl'] as String? ?? '',
        iceServers: (j['iceServers'] as List<dynamic>? ?? []).map((e) => ApiIceServer.fromJson(e as Map<String, dynamic>)).toList(),
        createdAt: j['createdAt'] as String?,
        startedAt: j['startedAt'] as String?,
        endedAt: j['endedAt'] as String?,
      );
}

class ApiNotification {
  const ApiNotification({required this.id, required this.title, required this.message, this.type, this.isRead, this.createdAt});
  final String id;
  final String title;
  final String message;
  final String? type;
  final bool? isRead;
  final String? createdAt;

  factory ApiNotification.fromJson(Map<String, dynamic> j) => ApiNotification(
        id: j['id']?.toString() ?? '',
        title: j['title'] as String? ?? '',
        message: j['message'] as String? ?? '',
        type: j['type'] as String?,
        isRead: j['isRead'] as bool?,
        createdAt: j['createdAt'] as String?,
      );
}

/// Thrown when the API returns a non-success envelope or a transport error.
class ApiException implements Exception {
  const ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}
