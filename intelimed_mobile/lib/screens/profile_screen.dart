import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';
import '../widgets.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final name = user?.name ?? 'User';
    final email = user?.email ?? '';
    final role = user?.role ?? '';
    final initials = name.trim().split(' ').map((s) => s.isEmpty ? '' : s[0]).take(2).join();

    final roleLabel = switch (role) {
      'ROLE_PATIENT' => 'Patient',
      'ROLE_HEALTHCARE_PROFESSIONAL' => 'Healthcare Professional',
      'ROLE_ADMIN' => 'Admin',
      _ => role,
    };

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 120),
      children: [
        Text('Profile', style: AppText.h1),
        const SizedBox(height: 16),
        SectionCard(
          child: Column(
            children: [
              Avatar(initials: initials.isEmpty ? 'U' : initials, size: 64),
              const SizedBox(height: 10),
              Text(name, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
              Text(email, style: AppText.bodyMuted),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(color: AppColors.teal50, borderRadius: BorderRadius.circular(AppRadius.pill)),
                child: Text(roleLabel, style: const TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600, fontSize: 12)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const PanelTitle('Health info'),
              _InfoRow(label: 'Allergies', value: 'Not set'),
              _InfoRow(label: 'Conditions', value: 'Not set'),
              _InfoRow(label: 'Active medications', value: 'Track via reminders'),
            ],
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          padding: const EdgeInsets.symmetric(horizontal: 18),
          child: Column(
            children: [
              const _SettingRow(icon: Icons.notifications_none, label: 'Notifications'),
              const _SettingRow(icon: Icons.shield_outlined, label: 'Privacy'),
              const _SettingRow(icon: Icons.language, label: 'Language', trailing: 'English'),
              _SettingRow(
                icon: Icons.logout,
                label: 'Sign out',
                danger: true,
                onTap: () async {
                  await context.read<AuthProvider>().logout();
                },
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
          Text(value, style: AppText.caption),
        ],
      ),
    );
  }
}

class _SettingRow extends StatelessWidget {
  const _SettingRow({required this.icon, required this.label, this.trailing, this.danger = false, this.onTap});
  final IconData icon;
  final String label;
  final String? trailing;
  final bool danger;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.major : AppColors.ink;
    return InkWell(
      onTap: onTap ?? () {},
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.lineSoft))),
        child: Row(
          children: [
            Icon(icon, size: 20, color: color),
            const SizedBox(width: 14),
            Expanded(child: Text(label, style: TextStyle(fontSize: 15, color: color))),
            if (trailing != null) Text(trailing!, style: AppText.bodyMuted),
            if (trailing == null && !danger) const Icon(Icons.chevron_right, color: AppColors.muted, size: 20),
          ],
        ),
      ),
    );
  }
}
