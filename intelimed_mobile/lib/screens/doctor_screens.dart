import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';
import 'consultations_screen.dart';
import 'profile_screen.dart';

String _initials(String name) => name.trim().split(RegExp(r'\s+')).map((s) => s.isEmpty ? '' : s[0]).take(2).join().toUpperCase();

/// Await a list-returning API call, yielding [] on any failure.
Future<List<T>> _safeList<T>(Future<List<T>> f) async {
  try { return await f; } catch (_) { return <T>[]; }
}

bool _isToday(String? iso) {
  final d = parseUtcToLocal(iso);
  if (d == null) return false;
  final n = DateTime.now();
  return d.year == n.year && d.month == n.month && d.day == n.day;
}

String _fmt(String? iso) {
  final d = parseUtcToLocal(iso);
  if (d == null) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final h = d.hour.toString().padLeft(2, '0');
  final m = d.minute.toString().padLeft(2, '0');
  return '${months[d.month - 1]} ${d.day}, $h:$m';
}

/// Distinct patients derived from the doctor's consultations + appointments.
List<({String id, String name, String last})> _derivePatients(List<ApiConsultation> cons, List<ApiAppointment> appts) {
  final map = <String, ({String id, String name, String last})>{};
  for (final c in cons) {
    final prev = map[c.patientId];
    final last = c.createdAt ?? '';
    if (prev == null || last.compareTo(prev.last) > 0) map[c.patientId] = (id: c.patientId, name: c.patientName, last: last);
  }
  for (final a in appts) {
    final id = a.patientId ?? a.patientName ?? '';
    if (id.isEmpty) continue;
    final prev = map[id];
    final last = a.appointmentDate ?? '';
    if (prev == null || last.compareTo(prev.last) > 0) map[id] = (id: id, name: a.patientName ?? 'Patient', last: last);
  }
  final list = map.values.toList()..sort((x, y) => y.last.compareTo(x.last));
  return list;
}

/// Bottom-nav shell for the doctor experience.
class DoctorShell extends StatefulWidget {
  const DoctorShell({super.key});
  @override
  State<DoctorShell> createState() => _DoctorShellState();
}

class _DoctorShellState extends State<DoctorShell> {
  int _index = 0;
  static const _pages = [
    DoctorDashboardScreen(),
    DoctorPatientsScreen(),
    AppointmentsScreen(doctor: true),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(bottom: false, child: IndexedStack(index: _index, children: _pages)),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (i) => setState(() => _index = i),
        height: 70,
        backgroundColor: AppColors.surface,
        indicatorColor: AppColors.teal50,
        destinations: const [
          NavigationDestination(icon: Icon(Icons.grid_view_rounded), label: 'Dashboard'),
          NavigationDestination(icon: Icon(Icons.people_alt_rounded), label: 'Patients'),
          NavigationDestination(icon: Icon(Icons.event_rounded), label: 'Appointments'),
          NavigationDestination(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }
}

/* ============================ Dashboard ============================ */
class DoctorDashboardScreen extends StatefulWidget {
  const DoctorDashboardScreen({super.key});
  @override
  State<DoctorDashboardScreen> createState() => _DoctorDashboardScreenState();
}

class _DoctorDashboardScreenState extends State<DoctorDashboardScreen> {
  ApiDoctor? _doc;
  List<ApiConsultation> _cons = [];
  List<ApiAppointment> _appts = [];
  String _state = 'loading'; // loading | ok | error

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final doc = await api.getMyDoctorApplication();
      if (!mounted) return;
      setState(() { _doc = doc; _state = 'ok'; });
      if (doc.verificationStatus == 'APPROVED') {
        _safeList(api.listMyConsultations()).then((c) { if (mounted) setState(() => _cons = c); });
        _safeList(api.listDoctorAppointments()).then((a) { if (mounted) setState(() => _appts = a); });
      }
    } catch (_) {
      if (mounted) setState(() => _state = 'error');
    }
  }

  @override
  Widget build(BuildContext context) {
    final doc = _doc;
    final approved = doc?.verificationStatus == 'APPROVED';
    final patients = _derivePatients(_cons, _appts).length;
    final apptsToday = _appts.where((a) => _isToday(a.appointmentDate)).length;

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Text(doc != null ? 'Welcome, Dr. ${doc.fullName}' : 'Doctor dashboard', style: AppText.h1),
        const SizedBox(height: 4),
        Text('Your clinical workspace', style: AppText.bodyMuted),
        const SizedBox(height: 16),
        if (_state == 'loading') const SectionCard(child: Text('Loading your workspace…', style: AppText.bodyMuted)),
        if (_state == 'error')
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('No professional profile found'),
                const SizedBox(height: 6),
                Text('We couldn’t load a doctor application for this account.', style: AppText.bodyMuted),
              ],
            ),
          ),
        if (_state == 'ok' && doc != null) ...[
          _VerificationBanner(status: doc.verificationStatus ?? 'PENDING'),
          const SizedBox(height: 14),
          Row(
            children: [
              _Stat(value: approved ? '$patients' : '—', label: 'Patients'),
              const SizedBox(width: 10),
              _Stat(value: approved ? '$apptsToday' : '—', label: 'Appts today'),
              const SizedBox(width: 10),
              _Stat(value: approved ? '${_cons.length}' : '—', label: 'Consultations'),
            ],
          ),
          const SizedBox(height: 14),
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Your credentials'),
                const SizedBox(height: 8),
                _kv('Specialization', doc.specialization),
                _kv('License number', doc.licenseNumber ?? '—'),
                _kv('Hospital / clinic', doc.hospital ?? '—'),
                _kv('Status', doc.verificationStatus ?? '—'),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _kv(String k, String v) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(k, style: AppText.bodyMuted),
            Flexible(child: Text(v, textAlign: TextAlign.right, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5))),
          ],
        ),
      );
}

class _VerificationBanner extends StatelessWidget {
  const _VerificationBanner({required this.status});
  final String status;
  @override
  Widget build(BuildContext context) {
    late Color color; late String title; late String body;
    switch (status) {
      case 'APPROVED':
        color = AppColors.minor; title = '✓ Verified professional';
        body = 'Your credentials are approved. All clinical tools are unlocked and your profile is listed in the doctor directory.';
      case 'REJECTED':
        color = AppColors.major; title = 'Verification not approved';
        body = 'Your application was not approved. Please review your credentials and re-apply.';
      default:
        color = AppColors.moderate; title = 'Verification pending';
        body = 'Our team is reviewing your medical credentials — clinical features unlock once an administrator approves your account.';
    }
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.line),
        boxShadow: kShadow,
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(width: 4, height: 40, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 15)),
                const SizedBox(height: 4),
                Text(body, style: AppText.caption),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.value, required this.label});
  final String value;
  final String label;
  @override
  Widget build(BuildContext context) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
          decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.line)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
              Text(label, style: AppText.caption),
            ],
          ),
        ),
      );
}

/* ============================ My Patients ============================ */
class DoctorPatientsScreen extends StatefulWidget {
  const DoctorPatientsScreen({super.key});
  @override
  State<DoctorPatientsScreen> createState() => _DoctorPatientsScreenState();
}

class _DoctorPatientsScreenState extends State<DoctorPatientsScreen> {
  List<ApiConsultation> _cons = [];
  List<ApiAppointment> _appts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final cons = await _safeList(api.listMyConsultations());
      final appts = await _safeList(api.listDoctorAppointments());
      if (!mounted) return;
      setState(() {
        _cons = cons;
        _appts = appts;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final patients = _derivePatients(_cons, _appts);
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Text('My Patients', style: AppText.h1),
        const SizedBox(height: 4),
        Text('Patients you’ve consulted or have appointments with', style: AppText.bodyMuted),
        const SizedBox(height: 16),
        if (_loading)
          const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
        else if (patients.isEmpty)
          SectionCard(child: Text('No patients yet — they appear here after a consultation or appointment.', style: AppText.bodyMuted))
        else
          for (final p in patients) ...[
            SectionCard(
              child: Row(
                children: [
                  Avatar(initials: _initials(p.name), size: 46),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(p.name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text('Last contact ${_fmt(p.last)}', style: AppText.caption),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}

