import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets.dart';

class DrugDetailScreen extends StatefulWidget {
  const DrugDetailScreen({super.key, this.drug, this.drugId});
  final ApiDrug? drug;
  final String? drugId;

  @override
  State<DrugDetailScreen> createState() => _DrugDetailScreenState();
}

class _DrugDetailScreenState extends State<DrugDetailScreen> {
  ApiDrug? _drug;
  List<ApiDrugInteractionSummary> _interactions = [];
  bool _loading = true;
  String? _error;

  ApiDrug? get _displayDrug => _drug ?? widget.drug;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final api = context.read<ApiClient>();
    final drugId = widget.drugId ?? widget.drug?.id;
    if (drugId == null) {
      setState(() { _loading = false; _error = 'No drug ID provided'; });
      return;
    }
    try {
      final results = await Future.wait([
        widget.drug != null ? Future.value(widget.drug!) : api.getDrug(drugId),
        api.getDrugInteractions(drugId),
      ]);
      if (mounted) {
        setState(() {
          _drug = results[0] as ApiDrug;
          _interactions = results[1] as List<ApiDrugInteractionSummary>;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _loading = false; _error = e.toString(); });
    }
  }

  Severity _severityFromString(String s) => switch (s.toUpperCase()) {
        'MAJOR' => Severity.major,
        'MODERATE' => Severity.moderate,
        'MINOR' || 'NONE' => Severity.minor,
        _ => Severity.unknown,
      };

  @override
  Widget build(BuildContext context) {
    final drug = _displayDrug;

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.paper,
        surfaceTintColor: Colors.transparent,
        title: Text(drug?.name ?? 'Drug Detail', style: AppText.h2),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!, style: AppText.bodyMuted))
              : drug == null
                  ? const Center(child: Text('Drug not found'))
                  : _buildContent(drug),
    );
  }

  Widget _buildContent(ApiDrug drug) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 8, 18, 40),
      children: [
        Row(
          children: [
            Expanded(child: Text('${drug.generic} · ${drug.drugClass}', style: AppText.bodyMuted)),
          ],
        ),
        const SizedBox(height: 8),
        if (drug.dosageForm != null)
          Align(
            alignment: Alignment.centerLeft,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(color: AppColors.teal50, borderRadius: BorderRadius.circular(AppRadius.pill)),
              child: Text(drug.dosageForm!, style: const TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600, fontSize: 13)),
            ),
          ),
        const SizedBox(height: 16),

        // Known interactions
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PanelTitle('Known interactions'),
              if (_interactions.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Text('No known interactions found', style: AppText.bodyMuted),
                ),
              for (var i = 0; i < _interactions.length; i++) ...[
                if (i > 0) const Divider(height: 1, color: AppColors.lineSoft),
                _InteractionRow(
                  name: _interactions[i].otherDrugName,
                  sub: _interactions[i].severity,
                  level: _severityFromString(_interactions[i].severity),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Description
        if (drug.description != null && drug.description!.isNotEmpty) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Description'),
                const SizedBox(height: 4),
                Text(drug.description!, style: AppText.bodyMuted),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Uses
        if (drug.uses != null && drug.uses!.isNotEmpty) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Uses'),
                const SizedBox(height: 4),
                Text(drug.uses!, style: AppText.bodyMuted),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Side effects
        if (drug.sideEffects != null && drug.sideEffects!.isNotEmpty) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Side effects', color: AppColors.moderate),
                const SizedBox(height: 4),
                Text(drug.sideEffects!, style: AppText.bodyMuted),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Contraindications
        if (drug.contraindications != null && drug.contraindications!.isNotEmpty) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Contraindications', color: AppColors.major),
                const SizedBox(height: 4),
                Text(drug.contraindications!, style: AppText.bodyMuted),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Dosage
        if (drug.dosage != null && drug.dosage!.isNotEmpty) ...[
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Dosage'),
                const SizedBox(height: 4),
                Text(drug.dosage!, style: AppText.bodyMuted),
              ],
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Overview (fallback)
        if (drug.description == null && drug.uses == null)
          SectionCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const PanelTitle('Overview'),
                const SizedBox(height: 4),
                Text(
                  '${drug.name} is used as part of your treatment plan. Follow your prescriber\'s instructions and check new medicines for interactions before starting them.',
                  style: AppText.bodyMuted,
                ),
              ],
            ),
          ),
        const SizedBox(height: 16),
        PrimaryButton(label: 'Add to my meds', icon: Icons.add, onPressed: () => Navigator.of(context).pop()),
      ],
    );
  }
}

class _InteractionRow extends StatelessWidget {
  const _InteractionRow({required this.name, required this.sub, required this.level});
  final String name;
  final String sub;
  final Severity level;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                Text(sub, style: AppText.caption),
              ],
            ),
          ),
          SeverityBadge(level: level),
        ],
      ),
    );
  }
}
