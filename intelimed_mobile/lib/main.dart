import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'theme.dart';
import 'api/api_client.dart';
import 'providers/auth_provider.dart';
import 'providers/drug_provider.dart';
import 'screens/home_screen.dart';
import 'screens/reminders_screen.dart';
import 'screens/doctors_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/check_screen.dart';
import 'screens/login_screen.dart';

void main() {
  final api = ApiClient();
  runApp(
    MultiProvider(
      providers: [
        Provider<ApiClient>.value(value: api),
        ChangeNotifierProvider(create: (_) => AuthProvider(api)),
        ChangeNotifierProvider(create: (_) => DrugProvider(api)),
      ],
      child: const IntelliMedsApp(),
    ),
  );
}

class IntelliMedsApp extends StatelessWidget {
  const IntelliMedsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'IntelliMeds',
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const AuthGate(),
    );
  }
}

/// Shows the login screen until the user signs in (or continues as guest).
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    final signedIn = context.select<AuthProvider, bool>((a) => a.isSignedIn);
    return signedIn ? const RootShell() : const LoginScreen();
  }
}

class RootShell extends StatefulWidget {
  const RootShell({super.key});

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  static const _pages = [HomeScreen(), RemindersScreen(), DoctorsScreen(), ProfileScreen()];

  void _openChecker() {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const CheckScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(bottom: false, child: IndexedStack(index: _index, children: _pages)),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      floatingActionButton: SizedBox(
        width: 62,
        height: 62,
        child: DecoratedBox(
          decoration: const BoxDecoration(shape: BoxShape.circle, boxShadow: kShadowBrand),
          child: FloatingActionButton(
            onPressed: _openChecker,
            elevation: 0,
            highlightElevation: 0,
            backgroundColor: AppColors.teal500,
            shape: const CircleBorder(),
            child: Ink(
              decoration: const BoxDecoration(gradient: kGradient, shape: BoxShape.circle),
              child: const SizedBox(
                width: 62,
                height: 62,
                child: Icon(Icons.add, color: Colors.white, size: 28),
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        color: AppColors.surface,
        elevation: 0,
        height: 76,
        shape: const CircularNotchedRectangle(),
        notchMargin: 8,
        padding: EdgeInsets.zero,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _NavItem(icon: Icons.home_rounded, label: 'Home', active: _index == 0, onTap: () => setState(() => _index = 0)),
            _NavItem(icon: Icons.notifications_rounded, label: 'Reminders', active: _index == 1, onTap: () => setState(() => _index = 1)),
            const SizedBox(width: 56),
            _NavItem(icon: Icons.medical_services_rounded, label: 'Doctors', active: _index == 2, onTap: () => setState(() => _index = 2)),
            _NavItem(icon: Icons.person_rounded, label: 'Profile', active: _index == 3, onTap: () => setState(() => _index = 3)),
          ],
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.icon, required this.label, required this.active, required this.onTap});
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = active ? AppColors.teal700 : AppColors.muted;
    return InkResponse(
      onTap: onTap,
      radius: 36,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 3),
          Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: active ? FontWeight.w600 : FontWeight.w500)),
        ],
      ),
    );
  }
}
