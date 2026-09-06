import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';

/// Patient books an appointment slot with a doctor: pick a date & time, a call type,
/// and an optional reason. The doctor then accepts or declines the request.
class BookAppointmentScreen extends StatefulWidget {
  const BookAppointmentScreen({super.key, required this.doctor});
  final ApiDoctor doctor;

  @override
  State<BookAppointmentScreen> createState() => _BookAppointmentScreenState();
}

class _BookAppointmentScreenState extends State<BookAppointmentScreen> {
  DateTime? _date;
  TimeOfDay? _time;
  String _callType = 'VIDEO';
  final _reason = TextEditingController();
  bool _booking = false;

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  DateTime? get _combined {
    if (_date == null || _time == null) return null;
    return DateTime(_date!.year, _date!.month, _date!.day, _time!.hour, _time!.minute);
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final d = await showDatePicker(
      context: context,
      initialDate: _date ?? now.add(const Duration(hours: 1)),
      firstDate: now,
      lastDate: now.add(const Duration(days: 120)),
    );
    if (d != null) setState(() => _date = d);
  }

  Future<void> _pickTime() async {
    final t = await showTimePicker(context: context, initialTime: _time ?? TimeOfDay.now());
    if (t != null) setState(() => _time = t);
  }

  /// Format as a naive ISO string in UTC. The backend stores/compares appointment
  /// times in UTC, so we convert the user's local selection before sending.
  String _iso(DateTime local) {
    final d = local.toUtc();
    two(int n) => n.toString().padLeft(2, '0');
    return '${d.year}-${two(d.month)}-${two(d.day)}T${two(d.hour)}:${two(d.minute)}:00';
  }

  Future<void> _book() async {
    final when = _combined;
    if (when == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please choose a date and time')));
      return;
    }
    if (when.isBefore(DateTime.now())) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please choose a time in the future')));
      return;
    }
    setState(() => _booking = true);
    try {
      await context.read<ApiClient>().bookAppointment(
            doctorId: widget.doctor.id,
            appointmentDate: _iso(when),
            callType: _callType,
            reason: _reason.text.trim(),
          );
      if (!mounted) return;
      Navigator.of(context).pop(true);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Request sent to Dr. ${widget.doctor.fullName}. You’ll be able to join once accepted.')),
      );
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Could not book: $e')));
    } finally {
      if (mounted) setState(() => _booking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final d = widget.doctor;
    final when = _combined;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    final dateLabel = _date == null ? 'Select date' : '${months[_date!.month - 1]} ${_date!.day}, ${_date!.year}';
    final timeLabel = _time == null ? 'Select time' : _time!.format(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Book appointment'), backgroundColor: AppColors.paper, surfaceTintColor: Colors.transparent),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 12, 18, 40),
        children: [
          SectionCard(
            child: Row(
              children: [
                Avatar(initials: _initials(d.fullName), size: 48),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Dr. ${d.fullName}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
                      Text(d.specialization, style: AppText.caption),
                      if (d.consultationFee != null)
                        Text('Fee: ${d.consultationFee!.toStringAsFixed(0)}', style: const TextStyle(color: AppColors.teal700, fontSize: 12.5)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const PanelTitle('When would you like the appointment?'),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(child: _PickerTile(icon: Icons.calendar_today, label: dateLabel, onTap: _pickDate)),
              const SizedBox(width: 10),
              Expanded(child: _PickerTile(icon: Icons.schedule, label: timeLabel, onTap: _pickTime)),
            ],
          ),
          const SizedBox(height: 18),
          const PanelTitle('Consultation type'),
          const SizedBox(height: 10),
          Row(
            children: [
              _typeChip('VIDEO', Icons.videocam, 'Video'),
              const SizedBox(width: 10),
              _typeChip('AUDIO', Icons.call, 'Audio'),
            ],
          ),
          const SizedBox(height: 18),
          const PanelTitle('Reason (optional)'),
          const SizedBox(height: 10),
          TextField(
            controller: _reason,
            maxLines: 3,
            style: AppText.body,
            decoration: InputDecoration(
              hintText: 'e.g. follow-up on medication, chest pain…',
              hintStyle: AppText.bodyMuted,
              filled: true,
              fillColor: AppColors.surface,
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.line, width: 1.5)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.teal500, width: 1.5)),
            ),
          ),
          const SizedBox(height: 24),
          PrimaryButton(
            label: _booking ? 'Sending request…' : (when == null ? 'Pick a date & time' : 'Request appointment'),
            icon: Icons.event_available,
            enabled: !_booking && when != null,
            onPressed: _book,
          ),
          const SizedBox(height: 10),
          Text('The doctor will review and accept or decline your request. You can join the call here once it’s accepted, at the scheduled time.',
              style: AppText.caption, textAlign: TextAlign.center),
        ],
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

String _initials(String name) => name.trim().split(RegExp(r'\s+')).map((s) => s.isEmpty ? '' : s[0]).take(2).join().toUpperCase();

class _PickerTile extends StatelessWidget {
  const _PickerTile({required this.icon, required this.label, required this.onTap});
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.line, width: 1.5),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.teal700),
            const SizedBox(width: 10),
            Expanded(child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5), overflow: TextOverflow.ellipsis)),
          ],
        ),
      ),
    );
  }
}
