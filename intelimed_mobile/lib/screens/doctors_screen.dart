import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../api/api_client.dart';
import '../api/models.dart';
import '../theme.dart';
import '../widgets.dart';
import 'consultations_screen.dart';
import 'book_appointment_screen.dart';

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

  Future<void> _book(ApiDoctor d) async {
    await Navigator.of(context).push(MaterialPageRoute(builder: (_) => BookAppointmentScreen(doctor: d)));
  }

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Row(
          children: [
            Expanded(child: Text('My doctors', style: AppText.h1)),
            TextButton.icon(
              onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const AppointmentsScreen())),
              icon: const Icon(Icons.event_note, size: 18, color: AppColors.teal700),
              label: const Text('My appointments', style: TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600)),
            ),
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
                  TextButton.icon(
                    onPressed: () => _book(d),
                    style: TextButton.styleFrom(
                      backgroundColor: AppColors.teal50,
                      foregroundColor: AppColors.teal700,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    icon: const Icon(Icons.event_available, size: 18),
                    label: const Text('Book', style: TextStyle(fontWeight: FontWeight.w700)),
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

