import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../data.dart';
import '../providers/auth_provider.dart';
import '../providers/drug_provider.dart';
import '../theme.dart';
import '../widgets.dart';
import 'check_screen.dart';
import 'assistant_screen.dart';
import 'drug_detail_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<ApiInteractionHistory> _recentChecks = [];
  bool _loadingHistory = true;

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final api = context.read<ApiClient>();
      final history = await api.getInteractionHistory();
      if (mounted) setState(() { _recentChecks = history.take(5).toList(); _loadingHistory = false; });
    } catch (_) {
      if (mounted) setState(() { _loadingHistory = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final drugs = context.watch<DrugProvider>().drugs;
    final name = (user?.name ?? 'User').split(' ').first;

    final greeting = _greeting();

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(greeting, style: AppText.caption),
                  Text(name, style: AppText.h1),
                ],
              ),
            ),
            IconButton(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AssistantScreen())),
              icon: const Icon(Icons.auto_awesome, color: AppColors.teal700),
            ),
            Avatar(initials: _initials(user?.name ?? 'U'), size: 40),
          ],
        ),
        const SizedBox(height: 18),
        Row(
          children: [
            _MiniStat(value: '${drugs.length}', label: 'Meds'),
            const SizedBox(width: 10),
            _MiniStat(value: '${_recentChecks.length}', label: 'Checks'),
            const SizedBox(width: 10),
            _MiniStat(value: '${DateTime.now().day}', label: 'Today'),
          ],
        ),
        const SizedBox(height: 16),
        _CtaCard(onOpen: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CheckScreen()))),
        const SizedBox(height: 16),

        // Recent checks from API
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PanelTitle('Recent checks'),
              if (_loadingHistory)
                const Padding(
                  padding: EdgeInsets.all(12),
                  child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                )
              else if (_recentChecks.isEmpty)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  child: Text('No checks yet. Try the interaction checker!', style: AppText.bodyMuted),
                )
              else
                for (var i = 0; i < _recentChecks.length; i++) ...[
                  if (i > 0) const Divider(height: 1, color: AppColors.lineSoft),
                  _CheckRow(
                    drugs: _recentChecks[i].resultSummary ?? _recentChecks[i].drugIds ?? 'Check',
                    severity: _recentChecks[i].highestSeverity ?? 'NONE',
                    date: _recentChecks[i].checkedAt,
                    onTap: () {},
                  ),
                ],
            ],
          ),
        ),
        const SizedBox(height: 16),

        // Your medications
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PanelTitle('Your medications'),
              for (final d in drugs.take(5))
                InkWell(
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => DrugDetailScreen(drug: ApiDrug(id: d.id, name: d.name, generic: d.generic, drugClass: d.drugClass)),
                  )),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    child: Row(
                      children: [
                        const PillIcon(icon: Icons.medication_rounded),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(d.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                              Text(d.drugClass, style: AppText.caption),
                            ],
                          ),
                        ),
                        const Icon(Icons.chevron_right, color: AppColors.muted),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  String _initials(String name) => name.trim().split(' ').map((s) => s.isEmpty ? '' : s[0]).take(2).join();
}

class _MiniStat extends StatelessWidget {
  const _MiniStat({required this.value, required this.label});
  final String value;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.line),
        ),
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
}

class _CtaCard extends StatelessWidget {
  const _CtaCard({required this.onOpen});
  final VoidCallback onOpen;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(gradient: kGradient, borderRadius: BorderRadius.circular(18), boxShadow: kShadow),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Check an interaction', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
          const SizedBox(height: 4),
          const Text('Add two or more medications for an instant severity rating and AI care plan.',
              style: TextStyle(color: Colors.white70, fontSize: 13)),
          const SizedBox(height: 14),
          SoftButton(label: 'Open checker', onPressed: onOpen),
        ],
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({required this.drugs, required this.severity, this.date, required this.onTap});
  final String drugs;
  final String severity;
  final String? date;
  final VoidCallback onTap;

  Severity _severityFromString(String s) => switch (s.toUpperCase()) {
        'MAJOR' => Severity.major,
        'MODERATE' => Severity.moderate,
        'MINOR' || 'NONE' => Severity.minor,
        _ => Severity.unknown,
      };

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(drugs, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(date != null ? 'Checked ${_formatDate(date!)}' : 'Recently checked', style: AppText.caption),
                ],
              ),
            ),
            SeverityBadge(level: _severityFromString(severity)),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr);
      final now = DateTime.now();
      if (dt.day == now.day && dt.month == now.month && dt.year == now.year) return 'today';
      return '${dt.month}/${dt.day}';
    } catch (_) {
      return 'recently';
    }
  }
}
