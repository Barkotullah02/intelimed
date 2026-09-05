import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../theme.dart';
import '../widgets.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _register = false;
  String _role = 'ROLE_PATIENT';
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _specialization = TextEditingController();
  final _licenseNumber = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _specialization.dispose();
    _licenseNumber.dispose();
    super.dispose();
  }

  Future<void> _submit(AuthProvider auth) async {
    if (_register) {
      await auth.register(
        _name.text.trim(),
        _email.text.trim(),
        _password.text,
        _role,
        specialization: _role == 'ROLE_HEALTHCARE_PROFESSIONAL' ? _specialization.text.trim() : null,
        licenseNumber: _role == 'ROLE_HEALTHCARE_PROFESSIONAL' ? _licenseNumber.text.trim() : null,
      );
    } else {
      await auth.login(_email.text.trim(), _password.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final busy = auth.status == AuthStatus.authenticating;

    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              Center(
                child: Image.asset('assets/logo.png', width: 76, height: 76, fit: BoxFit.contain),
              ),
              const SizedBox(height: 16),
              Text(_register ? 'Create account' : 'Welcome back', style: AppText.eyebrow, textAlign: TextAlign.center),
              const SizedBox(height: 6),
              Text(_register ? 'Join IntelliMeds' : 'Sign in to IntelliMeds', style: AppText.h1, textAlign: TextAlign.center),
              const SizedBox(height: 24),
              if (_register) ...[
                _LabeledField(label: 'Full name', controller: _name, hint: 'Sarah Chen'),
                const SizedBox(height: 14),
                _RolePicker(role: _role, onChanged: (r) => setState(() => _role = r)),
                const SizedBox(height: 14),
                if (_role == 'ROLE_HEALTHCARE_PROFESSIONAL') ...[
                  _LabeledField(label: 'Specialization', controller: _specialization, hint: 'e.g. Cardiology'),
                  const SizedBox(height: 14),
                  _LabeledField(label: 'License number', controller: _licenseNumber, hint: 'Medical license #'),
                  const SizedBox(height: 14),
                ],
              ],
              _LabeledField(label: 'Email address', controller: _email, hint: 'you@email.com', keyboard: TextInputType.emailAddress),
              const SizedBox(height: 14),
              _LabeledField(label: 'Password', controller: _password, hint: '••••••••', obscure: true),
              const SizedBox(height: 8),
              if (auth.error != null)
                Text(auth.error!, style: const TextStyle(color: AppColors.major, fontSize: 13)),
              const SizedBox(height: 12),
              PrimaryButton(
                label: busy ? 'Please wait…' : (_register ? 'Create account' : 'Sign in'),
                enabled: !busy,
                onPressed: () => _submit(auth),
              ),
              const SizedBox(height: 14),
              TextButton(
                onPressed: () => setState(() => _register = !_register),
                child: Text(_register ? 'Already have an account? Sign in' : 'New here? Create an account',
                    style: const TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w600)),
              ),
              const Divider(height: 32, color: AppColors.line),
              TextButton(
                onPressed: () => context.read<AuthProvider>().continueAsGuest(),
                child: const Text('Continue without signing in', style: TextStyle(color: AppColors.muted)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({required this.label, required this.controller, this.hint, this.obscure = false, this.keyboard});
  final String label;
  final TextEditingController controller;
  final String? hint;
  final bool obscure;
  final TextInputType? keyboard;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: AppText.label),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          obscureText: obscure,
          keyboardType: keyboard,
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

class _RolePicker extends StatelessWidget {
  const _RolePicker({required this.role, required this.onChanged});
  final String role;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _RoleChip(label: 'Patient', value: 'ROLE_PATIENT', active: role == 'ROLE_PATIENT', onTap: onChanged),
        const SizedBox(width: 12),
        _RoleChip(label: 'Professional', value: 'ROLE_HEALTHCARE_PROFESSIONAL', active: role == 'ROLE_HEALTHCARE_PROFESSIONAL', onTap: onChanged),
      ],
    );
  }
}

class _RoleChip extends StatelessWidget {
  const _RoleChip({required this.label, required this.value, required this.active, required this.onTap});
  final String label;
  final String value;
  final bool active;
  final ValueChanged<String> onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: () => onTap(value),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14),
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: active ? AppColors.teal50 : AppColors.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: active ? AppColors.teal500 : AppColors.line, width: active ? 2 : 1.5),
          ),
          child: Text(label, style: TextStyle(color: active ? AppColors.teal700 : AppColors.ink, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }
}
