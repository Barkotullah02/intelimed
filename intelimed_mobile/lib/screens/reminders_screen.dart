import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../providers/drug_provider.dart';
import '../theme.dart';
import '../widgets.dart';

class RemindersScreen extends StatefulWidget {
  const RemindersScreen({super.key});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  List<ApiReminder> _reminders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadReminders();
  }

  Future<void> _loadReminders() async {
    try {
      final api = context.read<ApiClient>();
      final reminders = await api.listReminders();
      if (mounted) setState(() { _reminders = reminders; _loading = false; });
    } catch (_) {
      if (mounted) setState(() { _loading = false; });
    }
  }

  Future<void> _deleteReminder(ApiReminder reminder) async {
    try {
      final api = context.read<ApiClient>();
      await api.deleteReminder(reminder.id);
      if (mounted) setState(() => _reminders.removeWhere((r) => r.id == reminder.id));
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to delete: $e')));
      }
    }
  }

  void _showAddReminderDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => const _AddReminderSheet(),
    ).then((created) {
      if (created == true) _loadReminders();
    });
  }

  String _formatTime(String? time) {
    if (time == null || time.isEmpty) return '';
    final parts = time.split(':');
    if (parts.length >= 2) return '${parts[0]}:${parts[1]}';
    return time;
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Row(
          children: [
            Expanded(child: Text('Reminders', style: AppText.h1)),
            GestureDetector(
              onTap: _showAddReminderDialog,
              child: const PillIcon(icon: Icons.add, size: 40),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (_loading)
          const Center(child: CircularProgressIndicator())
        else if (_reminders.isEmpty)
          SectionCard(
            child: Column(
              children: [
                Icon(Icons.notifications_none, size: 48, color: AppColors.muted),
                const SizedBox(height: 12),
                Text('No reminders yet', style: AppText.bodyMuted),
                const SizedBox(height: 4),
                Text('Tap + to create your first reminder.', style: AppText.caption),
              ],
            ),
          )
        else ...[
          SectionCard(
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text('${_reminders.where((r) => r.isActive == true).length}',
                        style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w800, letterSpacing: -1)),
                    const SizedBox(width: 8),
                    Text('active reminders', style: AppText.bodyMuted),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const PanelTitle('Your reminders'),
          for (final reminder in _reminders) ...[
            Dismissible(
              key: Key(reminder.id),
              direction: DismissDirection.endToStart,
              background: Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(right: 20),
                decoration: BoxDecoration(color: AppColors.major, borderRadius: BorderRadius.circular(14)),
                child: const Icon(Icons.delete, color: Colors.white),
              ),
              onDismissed: (_) => _deleteReminder(reminder),
              child: _ReminderTile(
                reminder: reminder,
                formatTime: _formatTime,
              ),
            ),
            const SizedBox(height: 10),
          ],
        ],
      ],
    );
  }
}

class _ReminderTile extends StatelessWidget {
  const _ReminderTile({required this.reminder, required this.formatTime});
  final ApiReminder reminder;
  final String Function(String?) formatTime;

  @override
  Widget build(BuildContext context) {
    final time = formatTime(reminder.reminderTime);
    final drugName = reminder.drugName ?? 'Medication';
    final dosage = reminder.dosage ?? '';
    final frequency = reminder.frequency ?? '';

    return SectionCard(
      padding: const EdgeInsets.all(14),
      child: Row(
        children: [
          const PillIcon(icon: Icons.medication_rounded),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(drugName, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(
                  [time, dosage, frequency].where((s) => s.isNotEmpty).join(' · '),
                  style: AppText.caption,
                ),
              ],
            ),
          ),
          if (reminder.isActive == true)
            Container(
              width: 24,
              height: 24,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.teal500,
              ),
              child: const Icon(Icons.check, color: Colors.white, size: 14),
            )
          else
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.transparent,
                border: Border.all(color: AppColors.teal500, width: 2),
              ),
            ),
        ],
      ),
    );
  }
}

class _AddReminderSheet extends StatefulWidget {
  const _AddReminderSheet();

  @override
  State<_AddReminderSheet> createState() => _AddReminderSheetState();
}

class _AddReminderSheetState extends State<_AddReminderSheet> {
  String? _selectedDrugId;
  TimeOfDay _selectedTime = TimeOfDay.now();
  String _frequency = 'DAILY';
  final _dosageController = TextEditingController();
  DateTime _startDate = DateTime.now();
  bool _submitting = false;

  @override
  void dispose() {
    _dosageController.dispose();
    super.dispose();
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(context: context, initialTime: _selectedTime);
    if (picked != null) setState(() => _selectedTime = picked);
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _startDate,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );
    if (picked != null) setState(() => _startDate = picked);
  }

  Future<void> _submit() async {
    if (_selectedDrugId == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Please select a medication')));
      return;
    }
    setState(() => _submitting = true);
    try {
      final api = context.read<ApiClient>();
      final hour = _selectedTime.hour.toString().padLeft(2, '0');
      final minute = _selectedTime.minute.toString().padLeft(2, '0');
      final timeStr = '$hour:$minute:00';

      final dateStr = '${_startDate.year}-${_startDate.month.toString().padLeft(2, '0')}-${_startDate.day.toString().padLeft(2, '0')}';

      await api.createReminder(
        drugId: _selectedDrugId!,
        reminderTime: timeStr,
        frequency: _frequency,
        dosage: _dosageController.text.trim().isNotEmpty ? _dosageController.text.trim() : null,
        startDate: dateStr,
      );
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to create reminder: $e')));
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final drugs = context.read<DrugProvider>().drugs;

    return Padding(
      padding: EdgeInsets.fromLTRB(24, 24, 24, MediaQuery.of(context).viewInsets.bottom + 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text('New Reminder', style: AppText.h2),
          const SizedBox(height: 20),

          // Drug picker
          Text('Medication', style: AppText.label),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.line, width: 1.5),
            ),
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedDrugId,
              hint: Text('Select medication', style: AppText.bodyMuted),
              underline: const SizedBox(),
              dropdownColor: AppColors.surface,
              items: drugs.map((d) => DropdownMenuItem(value: d.id, child: Text(d.name))).toList(),
              onChanged: (v) => setState(() => _selectedDrugId = v),
            ),
          ),
          const SizedBox(height: 16),

          // Time picker
          Text('Time', style: AppText.label),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickTime,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
              decoration: BoxDecoration(
                color: AppColors.surface2,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.line, width: 1.5),
              ),
              child: Row(
                children: [
                  const Icon(Icons.access_time, size: 20, color: AppColors.teal700),
                  const SizedBox(width: 10),
                  Text(_selectedTime.format(context), style: AppText.body),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Frequency
          Text('Frequency', style: AppText.label),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: AppColors.surface2,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.line, width: 1.5),
            ),
            child: DropdownButton<String>(
              isExpanded: true,
              value: _frequency,
              underline: const SizedBox(),
              dropdownColor: AppColors.surface,
              items: const [
                DropdownMenuItem(value: 'DAILY', child: Text('Daily')),
                DropdownMenuItem(value: 'WEEKLY', child: Text('Weekly')),
                DropdownMenuItem(value: 'AS_NEEDED', child: Text('As needed')),
              ],
              onChanged: (v) => setState(() => _frequency = v ?? 'DAILY'),
            ),
          ),
          const SizedBox(height: 16),

          // Dosage
          _LabeledField(label: 'Dosage (optional)', controller: _dosageController, hint: 'e.g. 500mg'),
          const SizedBox(height: 16),

          // Start date
          Text('Start date', style: AppText.label),
          const SizedBox(height: 8),
          GestureDetector(
            onTap: _pickDate,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
              decoration: BoxDecoration(
                color: AppColors.surface2,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.line, width: 1.5),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today, size: 20, color: AppColors.teal700),
                  const SizedBox(width: 10),
                  Text('${_startDate.year}-${_startDate.month.toString().padLeft(2, '0')}-${_startDate.day.toString().padLeft(2, '0')}', style: AppText.body),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),

          PrimaryButton(
            label: _submitting ? 'Creating…' : 'Create reminder',
            icon: Icons.alarm_add,
            enabled: !_submitting,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({required this.label, required this.controller, this.hint});
  final String label;
  final TextEditingController controller;
  final String? hint;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppText.label),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: AppText.bodyMuted,
            filled: true,
            fillColor: AppColors.surface2,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 15),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.line, width: 1.5)),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.teal500, width: 1.5)),
          ),
        ),
      ],
    );
  }
}
