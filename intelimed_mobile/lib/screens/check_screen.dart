import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../providers/drug_provider.dart';
import '../theme.dart';
import '../widgets.dart';
import 'result_screen.dart';

class CheckScreen extends StatefulWidget {
  const CheckScreen({super.key});

  @override
  State<CheckScreen> createState() => _CheckScreenState();
}

class _CheckScreenState extends State<CheckScreen> {
  final _controller = TextEditingController();
  final List<ApiDrug> _selected = [];
  String _query = '';
  List<ApiDrug> _searchResults = [];
  bool _searching = false;
  bool _checking = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => context.read<DrugProvider>().load());
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _search(String query) async {
    if (query.trim().length < 2) {
      setState(() { _searchResults = []; _searching = false; });
      return;
    }
    setState(() { _searching = true; });
    final api = context.read<ApiClient>();
    final drugProvider = context.read<DrugProvider>();
    try {
      final results = await api.searchDrugs(query.trim());
      if (mounted) setState(() { _searchResults = results; _searching = false; });
    } catch (_) {
      // Fallback to local filter
      final drugs = drugProvider.drugs;
      final local = drugs
          .where((d) => d.name.toLowerCase().contains(query.toLowerCase()))
          .map((d) => ApiDrug(id: d.id, name: d.name, generic: d.generic, drugClass: d.drugClass))
          .toList();
      if (mounted) setState(() { _searchResults = local; _searching = false; });
    }
  }

  void _add(ApiDrug drug) {
    if (_selected.any((d) => d.id == drug.id)) return;
    setState(() {
      _selected.add(drug);
      _query = '';
      _controller.clear();
      _searchResults = [];
    });
  }

  void _remove(ApiDrug drug) {
    setState(() => _selected.removeWhere((d) => d.id == drug.id));
  }

  Future<void> _check() async {
    if (_selected.length < 2) return;
    setState(() => _checking = true);
    try {
      final api = context.read<ApiClient>();
      final result = await api.checkInteractions(_selected.map((d) => d.id).toList());
      if (mounted) {
        Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => ResultScreen(apiResult: result, selectedDrugs: _selected),
        ));
      }
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<DrugProvider>();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.paper,
        surfaceTintColor: Colors.transparent,
        title: const Text('Interaction Checker', style: AppText.h2),
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(child: _SourceChip(source: provider.source)),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 40),
        children: [
          Text('Add medications to check for interactions', style: AppText.bodyMuted),
          const SizedBox(height: 16),
          SearchBox(
            controller: _controller,
            onChanged: (v) {
              setState(() => _query = v);
              _search(v);
            },
          ),
          if (_query.isNotEmpty) ...[
            const SizedBox(height: 8),
            SectionCard(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                children: [
                  if (_searching)
                    const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2)),
                  for (final d in _searchResults)
                    if (!_selected.any((s) => s.id == d.id))
                      ListTile(
                        contentPadding: EdgeInsets.zero,
                        title: Text(d.name, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                        subtitle: Text(d.drugClass, style: AppText.caption),
                        trailing: const Icon(Icons.add, color: AppColors.teal700, size: 20),
                        onTap: () => _add(d),
                      ),
                  if (_searchResults.isEmpty && !_searching)
                    Padding(padding: const EdgeInsets.all(12), child: Text('No matches', style: AppText.bodyMuted)),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
          if (_selected.isNotEmpty)
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final d in _selected)
                  Chip(
                    backgroundColor: AppColors.teal50,
                    side: BorderSide.none,
                    label: Text(d.name, style: const TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w500)),
                    deleteIcon: const Icon(Icons.close, size: 16, color: AppColors.teal700),
                    onDeleted: () => _remove(d),
                  ),
              ],
            ),
          const SizedBox(height: 20),
          PrimaryButton(
            label: _checking
                ? 'Checking…'
                : _selected.length < 2
                    ? 'Add at least 2 medications'
                    : 'Check interactions',
            icon: Icons.verified_user_outlined,
            enabled: _selected.length >= 2 && !_checking,
            onPressed: _check,
          ),
        ],
      ),
    );
  }
}

class _SourceChip extends StatelessWidget {
  const _SourceChip({required this.source});
  final DataSource source;

  @override
  Widget build(BuildContext context) {
    final live = source == DataSource.live;
    final text = switch (source) {
      DataSource.live => '● Live',
      DataSource.loading => '…',
      DataSource.sample => '○ Sample',
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(color: live ? AppColors.minorBg : AppColors.surface2, borderRadius: BorderRadius.circular(AppRadius.pill)),
      child: Text(text, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: live ? const Color(0xFF0A8A63) : AppColors.muted)),
    );
  }
}
