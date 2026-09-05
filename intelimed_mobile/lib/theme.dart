import 'package:flutter/material.dart';

/// IntelliMeds design tokens — mirrors the Figma "IntelliMeds — Product Design" system.
abstract final class AppColors {
  // brand teal
  static const teal50 = Color(0xFFE6FAF6);
  static const teal100 = Color(0xFFC3F3E8);
  static const teal300 = Color(0xFF4FD9BD);
  static const teal500 = Color(0xFF02C39A);
  static const teal600 = Color(0xFF02A888);
  static const teal700 = Color(0xFF028090);

  // neutrals (teal-biased)
  static const ink = Color(0xFF0B1F22);
  static const inkSoft = Color(0xFF1C3538);
  static const muted = Color(0xFF5C7A7D);
  static const paper = Color(0xFFEEF4F2);
  static const surface = Color(0xFFFFFFFF);
  static const surface2 = Color(0xFFF6FAF9);
  static const line = Color(0xFFDFEAE7);
  static const lineSoft = Color(0xFFEEF2F1);

  // severity (kept separate from brand accent)
  static const major = Color(0xFFE5484D);
  static const majorBg = Color(0xFFFDECEC);
  static const moderate = Color(0xFFE8890C);
  static const moderateBg = Color(0xFFFDF1E3);
  static const minor = Color(0xFF12B886);
  static const minorBg = Color(0xFFE6F7F0);
  static const unknown = Color(0xFF5C7A7D);
  static const unknownBg = Color(0xFFEEF2F1);
}

const kGradient = LinearGradient(
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
  colors: [AppColors.teal500, AppColors.teal700],
);

abstract final class AppRadius {
  static const sm = 8.0;
  static const md = 12.0;
  static const lg = 16.0;
  static const xl = 24.0;
  static const pill = 999.0;
}

/// Type ramp — mirrors the Figma text styles.
abstract final class AppText {
  static const display = TextStyle(fontSize: 34, height: 1.1, fontWeight: FontWeight.w800, letterSpacing: -1, color: AppColors.ink);
  static const h1 = TextStyle(fontSize: 26, height: 1.15, fontWeight: FontWeight.w800, letterSpacing: -0.6, color: AppColors.ink);
  static const h2 = TextStyle(fontSize: 20, height: 1.2, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: AppColors.ink);
  static const h3 = TextStyle(fontSize: 16, height: 1.25, fontWeight: FontWeight.w600, color: AppColors.ink);
  static const body = TextStyle(fontSize: 15, height: 1.5, color: AppColors.ink);
  static const bodyMuted = TextStyle(fontSize: 14, height: 1.5, color: AppColors.muted);
  static const label = TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: AppColors.muted);
  static const caption = TextStyle(fontSize: 12, color: AppColors.muted);
  static const eyebrow = TextStyle(fontSize: 11, fontWeight: FontWeight.w600, letterSpacing: 1.6, color: AppColors.teal700);
}

ThemeData buildTheme() {
  final base = ThemeData(
    useMaterial3: true,
    scaffoldBackgroundColor: AppColors.paper,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.teal500,
      primary: AppColors.teal500,
      surface: AppColors.surface,
    ),
  );
  return base.copyWith(
    textTheme: base.textTheme.apply(bodyColor: AppColors.ink, displayColor: AppColors.ink),
  );
}

const kShadow = [
  BoxShadow(color: Color(0x0F0B1F22), blurRadius: 18, offset: Offset(0, 6)),
];
const kShadowBrand = [
  BoxShadow(color: Color(0x5902C39A), blurRadius: 20, offset: Offset(0, 8)),
];
