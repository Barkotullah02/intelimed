import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';

class DoctorsScreen extends StatefulWidget {
  const DoctorsScreen({super.key});

  @override
  State<DoctorsScreen> createState() => _DoctorsScreenState();
}

class _DoctorsScreenState extends State<DoctorsScreen> {
  List<ApiDoctor> _doctors = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDoctors();
  }

  Future<void> _loadDoctors() async {
    try {
      final api = context.read<ApiClient>();
      final doctors = await api.listVerifiedDoctors();
      if (mounted) setState(() { _doctors = doctors; _loading = false; });
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  String _initials(String name) => name.trim().split(' ').map((s) => s.isEmpty ? '' : s[0]).take(2).join();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Row(
          children: [
            Expanded(child: Text('My doctors', style: AppText.h1)),
          ],
        ),
        const SizedBox(height: 16),
        if (_loading)
          const Center(child: CircularProgressIndicator())
        else if (_error != null)
          Center(child: Text('Failed to load doctors', style: AppText.bodyMuted))
        else if (_doctors.isEmpty)
          SectionCard(
            child: Column(
              children: [
                Icon(Icons.medical_services_outlined, size: 48, color: AppColors.muted),
                const SizedBox(height: 12),
                Text('No verified doctors found', style: AppText.bodyMuted),
                const SizedBox(height: 4),
                Text('Doctors will appear here once verified by an admin.', style: AppText.caption),
              ],
            ),
          )
        else
          for (final d in _doctors) ...[
            SectionCard(
              child: Row(
                children: [
                  Avatar(initials: _initials(d.fullName), size: 48),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(d.fullName, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                        Text(d.specialization, style: AppText.caption),
                        if (d.hospital != null)
                          Text(d.hospital!, style: const TextStyle(color: AppColors.teal700, fontSize: 12.5)),
                      ],
                    ),
                  ),
                  _RoundAction(icon: Icons.chat_bubble_outline, onTap: () {}),
                  const SizedBox(width: 8),
                  _RoundAction(icon: Icons.call_outlined, filled: true, onTap: () {}),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
      ],
    );
  }
}

class _RoundAction extends StatelessWidget {
  const _RoundAction({required this.icon, required this.onTap, this.filled = false});
  final IconData icon;
  final VoidCallback onTap;
  final bool filled;

  @override
  Widget build(BuildContext context) {
    return InkResponse(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: filled ? AppColors.teal50 : Colors.transparent,
          shape: BoxShape.circle,
          border: filled ? null : Border.all(color: AppColors.line, width: 1.5),
        ),
        child: Icon(icon, size: 18, color: filled ? AppColors.teal700 : AppColors.ink),
      ),
    );
  }
}
