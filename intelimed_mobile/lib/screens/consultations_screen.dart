import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';
import 'call_screen.dart';
import 'prescription_screens.dart';

String _fmtWhen(DateTime? d) {
  if (d == null) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final h = d.hour.toString().padLeft(2, '0');
  final m = d.minute.toString().padLeft(2, '0');
  return '${months[d.month - 1]} ${d.day}, $h:$m';
}

/// Appointments list. Patients see their bookings and join once confirmed; doctors
/// accept/decline requests and join at the scheduled time. A call can ONLY be started
/// from a confirmed appointment — there is no ad-hoc calling.
class AppointmentsScreen extends StatefulWidget {
  const AppointmentsScreen({super.key, this.doctor = false});
  final bool doctor;

  @override
  State<AppointmentsScreen> createState() => _AppointmentsScreenState();
}

class _AppointmentsScreenState extends State<AppointmentsScreen> {
  List<ApiAppointment>? _appts;
  String? _busyId;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final list = widget.doctor ? await api.listDoctorAppointments() : await api.listAppointments();
      if (mounted) setState(() => _appts = list);
    } catch (_) {
      if (mounted) setState(() => _appts = []);
    }
  }

  Future<void> _act(ApiAppointment a, Future<ApiAppointment> Function() call, String failMsg) async {
    setState(() => _busyId = a.id);
    try {
      await call();
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('$failMsg: $e')));
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  Future<void> _join(ApiAppointment a) async {
    setState(() => _busyId = a.id);
    try {
      final consult = await context.read<ApiClient>().joinAppointmentCall(a.id);
      if (!mounted) return;
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => CallScreen(consultation: consult)));
      await _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not join: $e')));
    } finally {
      if (mounted) setState(() => _busyId = null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appts = _appts;
    return Scaffold(
      appBar: widget.doctor
          ? null
          : AppBar(
              title: const Text('My appointments'),
              backgroundColor: AppColors.paper,
              surfaceTintColor: Colors.transparent,
              actions: [
                TextButton.icon(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const PrescriptionsScreen())),
                  icon: const Icon(Icons.medication_outlined, size: 18, color: AppColors.teal700),
                  label: const Text('Prescriptions', style: TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
          children: [
            if (widget.doctor) ...[
              Text('Appointments', style: AppText.h1),
              const SizedBox(height: 4),
              Text('Accept requests, then join at the scheduled time', style: AppText.bodyMuted),
              const SizedBox(height: 16),
            ],
            if (appts == null)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
            else if (appts.isEmpty)
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const PanelTitle('No appointments yet'),
                    const SizedBox(height: 6),
                    Text(
                      widget.doctor
                          ? 'Booking requests from patients will appear here to accept or decline.'
                          : 'Book a slot with a doctor from the Doctors tab. Once accepted, you can join the call here at the scheduled time.',
                      style: AppText.bodyMuted,
                    ),
                  ],
                ),
              )
            else
              for (final a in appts) ...[
                _AppointmentRow(
                  appt: a,
                  isDoctor: widget.doctor,
                  busy: _busyId == a.id,
                  onAccept: () => _act(a, () => context.read<ApiClient>().acceptAppointment(a.id), 'Could not accept'),
                  onDecline: () => _act(a, () => context.read<ApiClient>().declineAppointment(a.id), 'Could not decline'),
                  onCancel: () => _act(a, () => context.read<ApiClient>().cancelAppointment(a.id), 'Could not cancel'),
                  onJoin: () => _join(a),
                ),
                const SizedBox(height: 12),
              ],
          ],
        ),
      ),
    );
  }
}

class _AppointmentRow extends StatelessWidget {
  const _AppointmentRow({
    required this.appt,
    required this.isDoctor,
    required this.busy,
    required this.onAccept,
    required this.onDecline,
    required this.onCancel,
    required this.onJoin,
  });
  final ApiAppointment appt;
  final bool isDoctor;
  final bool busy;
  final VoidCallback onAccept;
  final VoidCallback onDecline;
  final VoidCallback onCancel;
  final VoidCallback onJoin;

  @override
  Widget build(BuildContext context) {
    final who = isDoctor ? (appt.patientName ?? 'Patient') : 'Dr. ${appt.doctorName ?? ''}';
    final status = appt.status ?? '—';
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              PillIcon(icon: appt.isVideo ? Icons.videocam : Icons.call),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(who, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text('${appt.isVideo ? 'Video' : 'Audio'} • ${_fmtWhen(appt.scheduledAt)}', style: AppText.caption),
                    if (appt.reason != null && appt.reason!.isNotEmpty)
                      Padding(padding: const EdgeInsets.only(top: 2), child: Text(appt.reason!, style: AppText.caption)),
                  ],
                ),
              ),
              _StatusBadge(status: status),
            ],
          ),
          if (busy)
            const Padding(
              padding: EdgeInsets.only(top: 12),
              child: SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2)),
            )
          else
            ..._actions(),
        ],
      ),
    );
  }

  List<Widget> _actions() {
    // Joinable (confirmed + it's time): both parties get a Join button.
    if (appt.joinable) {
      return [
        const SizedBox(height: 12),
        SizedBox(width: double.infinity, child: PrimaryButton(label: 'Join call', icon: Icons.videocam, onPressed: onJoin)),
      ];
    }
    // Doctor deciding on a pending request.
    if (isDoctor && appt.isPending) {
      return [
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(child: PrimaryButton(label: 'Accept', icon: Icons.check, onPressed: onAccept)),
            const SizedBox(width: 10),
            Expanded(child: OutlinedButton(onPressed: onDecline, child: const Text('Decline'))),
          ],
        ),
      ];
    }
    // Confirmed but not yet time.
    if (appt.isConfirmed) {
      return [
        const SizedBox(height: 8),
        Text('Confirmed — join at the scheduled time.', style: AppText.caption.copyWith(color: AppColors.teal700)),
        if (!isDoctor) _cancelLink(),
      ];
    }
    // Pending on the patient side.
    if (!isDoctor && appt.isPending) {
      return [
        const SizedBox(height: 8),
        Text('Waiting for the doctor to accept.', style: AppText.caption),
        _cancelLink(),
      ];
    }
    return const [];
  }

  Widget _cancelLink() => Align(
        alignment: Alignment.centerLeft,
        child: TextButton(
          onPressed: onCancel,
          style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 32)),
          child: const Text('Cancel appointment', style: TextStyle(color: AppColors.major, fontSize: 13)),
        ),
      );
}

class _StatusBadge extends StatelessWidget {
  const _StatusBadge({required this.status});
  final String status;
  @override
  Widget build(BuildContext context) {
    Color c;
    switch (status) {
      case 'CONFIRMED':
        c = AppColors.minor;
      case 'PENDING':
        c = AppColors.moderate;
      case 'DECLINED':
      case 'CANCELLED':
        c = AppColors.major;
      default:
        c = AppColors.muted;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(AppRadius.pill)),
      child: Text(status, style: TextStyle(color: c, fontSize: 11.5, fontWeight: FontWeight.w700)),
    );
  }
}
