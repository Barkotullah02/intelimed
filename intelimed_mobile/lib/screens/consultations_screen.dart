import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';
import 'call_screen.dart';

/// Video/audio consultations. Patients can start a call with a verified doctor;
/// both sides see the list and can Join a live one. Set [doctor] true on the doctor side.
class ConsultationsScreen extends StatefulWidget {
  const ConsultationsScreen({super.key, this.doctor = false});
  final bool doctor;

  @override
  State<ConsultationsScreen> createState() => _ConsultationsScreenState();
}

class _ConsultationsScreenState extends State<ConsultationsScreen> {
  List<ApiConsultation> _items = [];
  List<ApiDoctor> _doctors = [];
  bool _loading = true;
  String? _selectedDoctorId;
  String _callType = 'VIDEO';
  bool _starting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final api = context.read<ApiClient>();
    try {
      final cons = await api.listMyConsultations();
      List<ApiDoctor> docs = [];
      if (!widget.doctor) {
        docs = await api.listVerifiedDoctors();
      }
      if (!mounted) return;
      setState(() {
        _items = cons;
        _doctors = docs;
        _selectedDoctorId = docs.isNotEmpty ? docs.first.id : null;
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _start() async {
    if (_selectedDoctorId == null || _starting) return;
    setState(() => _starting = true);
    try {
      final api = context.read<ApiClient>();
      final consult = await api.createConsultation(doctorId: _selectedDoctorId, callType: _callType);
      if (!mounted) return;
      await Navigator.of(context).push(MaterialPageRoute(builder: (_) => CallScreen(consultation: consult)));
      _load();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not start the call: $e')));
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  Future<void> _join(ApiConsultation consult) async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => CallScreen(consultation: consult)));
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Text('Consultations', style: AppText.h1),
        const SizedBox(height: 4),
        Text('Your video & audio visits', style: AppText.bodyMuted),
        const SizedBox(height: 16),

        if (!widget.doctor) _startPanel(),

        if (_loading)
          const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
        else if (_items.isEmpty)
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('No consultations yet'),
                const SizedBox(height: 6),
                Text(widget.doctor ? 'When a patient starts a call with you, it appears here.' : 'Start a video or audio call above.', style: AppText.bodyMuted),
              ],
            ),
          )
        else
          for (final ct in _items) ...[
            _ConsultRow(consult: ct, isDoctor: widget.doctor, onJoin: () => _join(ct)),
            const SizedBox(height: 12),
          ],
      ],
    );
  }

  Widget _startPanel() {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: SectionCard(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const PanelTitle('Start a consultation'),
            const SizedBox(height: 10),
            if (_doctors.isEmpty)
              Text('No verified doctors are available yet.', style: AppText.bodyMuted)
            else ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.line)),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedDoctorId,
                    items: _doctors.map((d) => DropdownMenuItem(value: d.id, child: Text('Dr. ${d.fullName} — ${d.specialization}', overflow: TextOverflow.ellipsis))).toList(),
                    onChanged: (v) => setState(() => _selectedDoctorId = v),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  _typeChip('VIDEO', Icons.videocam, 'Video'),
                  const SizedBox(width: 10),
                  _typeChip('AUDIO', Icons.call, 'Audio'),
                ],
              ),
              const SizedBox(height: 14),
              PrimaryButton(
                label: _starting ? 'Starting…' : 'Start call',
                icon: Icons.videocam,
                enabled: !_starting,
                onPressed: _start,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _typeChip(String value, IconData icon, String label) {
    final active = _callType == value;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _callType = value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? AppColors.teal50 : AppColors.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: active ? AppColors.teal500 : AppColors.line, width: active ? 2 : 1.5),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 18, color: active ? AppColors.teal700 : AppColors.muted),
              const SizedBox(width: 8),
              Text(label, style: TextStyle(color: active ? AppColors.teal700 : AppColors.ink, fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      ),
    );
  }
}

class _ConsultRow extends StatelessWidget {
  const _ConsultRow({required this.consult, required this.isDoctor, required this.onJoin});
  final ApiConsultation consult;
  final bool isDoctor;
  final VoidCallback onJoin;

  @override
  Widget build(BuildContext context) {
    final who = isDoctor ? consult.patientName : 'Dr. ${consult.doctorName}';
    final live = consult.isLive;
    return SectionCard(
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(who, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                const SizedBox(height: 2),
                Text('${consult.isVideo ? 'Video' : 'Audio'} • ${consult.status}', style: AppText.caption),
              ],
            ),
          ),
          if (live)
            PrimaryButton(label: 'Join', icon: Icons.call, onPressed: onJoin)
          else
            Text('Ended', style: AppText.caption),
        ],
      ),
    );
  }
}
