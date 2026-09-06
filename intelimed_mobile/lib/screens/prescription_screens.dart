import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';

String _fmtWhen(DateTime? d) {
  if (d == null) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  final h = d.hour.toString().padLeft(2, '0');
  final m = d.minute.toString().padLeft(2, '0');
  return '${months[d.month - 1]} ${d.day}, $h:$m';
}

/// Read-only rendering of a prescription — used live in the call and in history.
class PrescriptionCard extends StatelessWidget {
  const PrescriptionCard({super.key, required this.rx, this.showDoctor = true});
  final ApiPrescription rx;
  final bool showDoctor;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const PillIcon(icon: Icons.medication_outlined),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Prescription', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 16)),
                    if (showDoctor && rx.doctorName != null)
                      Text('by Dr. ${rx.doctorName}${rx.updatedLocal != null ? ' • ${_fmtWhen(rx.updatedLocal)}' : ''}', style: AppText.caption),
                  ],
                ),
              ),
            ],
          ),
          if (rx.items.isEmpty && (rx.advice == null || rx.advice!.isEmpty))
            Padding(padding: const EdgeInsets.only(top: 10), child: Text('No medicines added.', style: AppText.bodyMuted)),
          if (rx.items.isNotEmpty) ...[
            const SizedBox(height: 12),
            for (final it in rx.items) _MedLine(item: it),
          ],
          if (rx.advice != null && rx.advice!.isNotEmpty) ...[
            const SizedBox(height: 14),
            Text('Advice', style: AppText.label),
            const SizedBox(height: 4),
            Text(rx.advice!, style: AppText.body),
          ],
        ],
      ),
    );
  }
}

class _MedLine extends StatelessWidget {
  const _MedLine({required this.item});
  final ApiPrescriptionItem item;

  @override
  Widget build(BuildContext context) {
    final meta = [item.dosage, item.frequency, item.duration].where((s) => s != null && s.isNotEmpty).join(' • ');
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(color: AppColors.surface2, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.line)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(item.medicine, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5)),
          if (meta.isNotEmpty) Padding(padding: const EdgeInsets.only(top: 2), child: Text(meta, style: AppText.caption)),
          if (item.instructions != null && item.instructions!.isNotEmpty)
            Padding(padding: const EdgeInsets.only(top: 2), child: Text(item.instructions!, style: AppText.caption.copyWith(fontStyle: FontStyle.italic))),
        ],
      ),
    );
  }
}

/// Read-only bottom sheet — what the patient sees when a prescription arrives.
Future<void> showPrescriptionView(BuildContext context, ApiPrescription rx) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.paper,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (_) => DraggableScrollableSheet(
      initialChildSize: 0.6,
      minChildSize: 0.3,
      maxChildSize: 0.92,
      expand: false,
      builder: (_, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(18, 14, 18, 32),
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.line, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 16),
          PrescriptionCard(rx: rx),
        ],
      ),
    ),
  );
}

/// Doctor's editable prescription form. Returns the draft (advice, items) on save.
Future<({String advice, List<ApiPrescriptionItem> items})?> showPrescribeSheet(BuildContext context, ApiPrescription? initial) {
  return showModalBottomSheet<({String advice, List<ApiPrescriptionItem> items})>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppColors.paper,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (_) => Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom),
      child: _PrescribeSheet(initial: initial),
    ),
  );
}

class _PrescribeSheet extends StatefulWidget {
  const _PrescribeSheet({this.initial});
  final ApiPrescription? initial;

  @override
  State<_PrescribeSheet> createState() => _PrescribeSheetState();
}

class _MedRow {
  final med = TextEditingController();
  final dose = TextEditingController();
  final freq = TextEditingController();
  final dur = TextEditingController();
  final instr = TextEditingController();
  void dispose() { med.dispose(); dose.dispose(); freq.dispose(); dur.dispose(); instr.dispose(); }
}

class _PrescribeSheetState extends State<_PrescribeSheet> {
  final List<_MedRow> _rows = [];
  final _advice = TextEditingController();

  @override
  void initState() {
    super.initState();
    final init = widget.initial;
    if (init != null) {
      _advice.text = init.advice ?? '';
      for (final it in init.items) {
        final r = _MedRow()
          ..med.text = it.medicine
          ..dose.text = it.dosage ?? ''
          ..freq.text = it.frequency ?? ''
          ..dur.text = it.duration ?? ''
          ..instr.text = it.instructions ?? '';
        _rows.add(r);
      }
    }
    if (_rows.isEmpty) _rows.add(_MedRow());
  }

  @override
  void dispose() {
    for (final r in _rows) { r.dispose(); }
    _advice.dispose();
    super.dispose();
  }

  void _save() {
    final items = <ApiPrescriptionItem>[];
    for (final r in _rows) {
      final name = r.med.text.trim();
      if (name.isEmpty) continue;
      items.add(ApiPrescriptionItem(
        medicine: name,
        dosage: r.dose.text.trim().isEmpty ? null : r.dose.text.trim(),
        frequency: r.freq.text.trim().isEmpty ? null : r.freq.text.trim(),
        duration: r.dur.text.trim().isEmpty ? null : r.dur.text.trim(),
        instructions: r.instr.text.trim().isEmpty ? null : r.instr.text.trim(),
      ));
    }
    Navigator.of(context).pop((advice: _advice.text.trim(), items: items));
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.85,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (_, controller) => ListView(
        controller: controller,
        padding: const EdgeInsets.fromLTRB(18, 14, 18, 28),
        children: [
          Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppColors.line, borderRadius: BorderRadius.circular(2)))),
          const SizedBox(height: 14),
          Row(
            children: [
              const PillIcon(icon: Icons.medication_outlined),
              const SizedBox(width: 12),
              Text('Write prescription', style: AppText.h2),
            ],
          ),
          const SizedBox(height: 4),
          Text('The patient sees this instantly during the call.', style: AppText.caption),
          const SizedBox(height: 16),
          for (int i = 0; i < _rows.length; i++) _medCard(i),
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: () => setState(() => _rows.add(_MedRow())),
              icon: const Icon(Icons.add, size: 18, color: AppColors.teal700),
              label: const Text('Add medicine', style: TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600)),
            ),
          ),
          const SizedBox(height: 12),
          Text('Advice / notes', style: AppText.label),
          const SizedBox(height: 6),
          TextField(
            controller: _advice,
            maxLines: 3,
            decoration: _dec('e.g. rest, hydrate, return if symptoms persist…'),
          ),
          const SizedBox(height: 20),
          PrimaryButton(label: 'Save & send to patient', icon: Icons.send_rounded, onPressed: _save),
        ],
      ),
    );
  }

  Widget _medCard(int i) {
    final r = _rows[i];
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppColors.surface, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.line)),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(child: TextField(controller: r.med, decoration: _dec('Medicine name'))),
              if (_rows.length > 1)
                IconButton(
                  onPressed: () => setState(() { r.dispose(); _rows.removeAt(i); }),
                  icon: const Icon(Icons.close, size: 18, color: AppColors.muted),
                ),
            ],
          ),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: TextField(controller: r.dose, decoration: _dec('Dosage e.g. 500 mg'))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: r.freq, decoration: _dec('Frequency'))),
          ]),
          const SizedBox(height: 8),
          Row(children: [
            Expanded(child: TextField(controller: r.dur, decoration: _dec('Duration e.g. 7 days'))),
            const SizedBox(width: 8),
            Expanded(child: TextField(controller: r.instr, decoration: _dec('Instructions'))),
          ]),
        ],
      ),
    );
  }

  InputDecoration _dec(String hint) => InputDecoration(
        hintText: hint,
        hintStyle: AppText.caption,
        isDense: true,
        filled: true,
        fillColor: AppColors.surface2,
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.line, width: 1.5)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.teal500, width: 1.5)),
      );
}

/// Patient's list of all prescriptions they've received.
class PrescriptionsScreen extends StatefulWidget {
  const PrescriptionsScreen({super.key});
  @override
  State<PrescriptionsScreen> createState() => _PrescriptionsScreenState();
}

class _PrescriptionsScreenState extends State<PrescriptionsScreen> {
  List<ApiPrescription>? _items;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final list = await context.read<ApiClient>().listMyPrescriptions();
      if (mounted) setState(() => _items = list);
    } catch (_) {
      if (mounted) setState(() => _items = []);
    }
  }

  @override
  Widget build(BuildContext context) {
    final items = _items;
    return Scaffold(
      appBar: AppBar(title: const Text('My prescriptions'), backgroundColor: AppColors.paper, surfaceTintColor: Colors.transparent),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(18, 12, 18, 40),
          children: [
            if (items == null)
              const Padding(padding: EdgeInsets.all(24), child: Center(child: CircularProgressIndicator()))
            else if (items.isEmpty)
              SectionCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const PanelTitle('No prescriptions yet'),
                    const SizedBox(height: 6),
                    Text('Prescriptions your doctor writes during a consultation appear here.', style: AppText.bodyMuted),
                  ],
                ),
              )
            else
              for (final rx in items) ...[
                PrescriptionCard(rx: rx),
                const SizedBox(height: 12),
              ],
          ],
        ),
      ),
    );
  }
}
