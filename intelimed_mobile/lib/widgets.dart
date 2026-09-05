import 'package:flutter/material.dart';
import 'data.dart';
import 'theme.dart';

/// Primary gradient button — mirrors Figma Button (Primary).
class PrimaryButton extends StatelessWidget {
  const PrimaryButton({super.key, required this.label, this.icon, this.onPressed, this.enabled = true});
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.md + 2),
          onTap: enabled ? onPressed : null,
          child: Ink(
            decoration: BoxDecoration(
              gradient: kGradient,
              borderRadius: BorderRadius.circular(AppRadius.md + 2),
              boxShadow: enabled ? kShadowBrand : null,
            ),
            child: Container(
              height: 52,
              alignment: Alignment.center,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (icon != null) ...[Icon(icon, color: Colors.white, size: 18), const SizedBox(width: 8)],
                  Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Soft / ghost secondary button.
class SoftButton extends StatelessWidget {
  const SoftButton({super.key, required this.label, this.icon, this.onPressed, this.ghost = false});
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool ghost;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: ghost ? Colors.transparent : AppColors.teal50,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppRadius.md + 2),
        side: ghost ? const BorderSide(color: AppColors.line, width: 1.5) : BorderSide.none,
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md + 2),
        onTap: onPressed,
        child: Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 22),
          alignment: Alignment.center,
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, color: ghost ? AppColors.ink : AppColors.teal700, size: 18), const SizedBox(width: 8)],
              Text(label, style: TextStyle(color: ghost ? AppColors.ink : AppColors.teal700, fontWeight: FontWeight.w600, fontSize: 14)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Severity badge pill — mirrors Figma SeverityBadge.
class SeverityBadge extends StatelessWidget {
  const SeverityBadge({super.key, required this.level});
  final Severity level;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 6, 14, 6),
      decoration: BoxDecoration(color: level.bg, borderRadius: BorderRadius.circular(AppRadius.pill)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 8, height: 8, decoration: BoxDecoration(color: level.color, shape: BoxShape.circle)),
          const SizedBox(width: 7),
          Text(level.label, style: TextStyle(color: level.color, fontWeight: FontWeight.w600, fontSize: 12.5)),
        ],
      ),
    );
  }
}

/// Surface card container.
class SectionCard extends StatelessWidget {
  const SectionCard({super.key, required this.child, this.padding = const EdgeInsets.all(18)});
  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: padding,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: AppColors.line),
        boxShadow: kShadow,
      ),
      child: child,
    );
  }
}

/// Circular initials avatar.
class Avatar extends StatelessWidget {
  const Avatar({super.key, required this.initials, this.size = 44});
  final String initials;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: AppColors.teal50,
        shape: BoxShape.circle,
        border: Border.all(color: AppColors.teal500, width: 2),
      ),
      child: Text(initials, style: TextStyle(color: AppColors.teal700, fontWeight: FontWeight.w700, fontSize: size * 0.34)),
    );
  }
}

/// Rounded icon chip used in list rows.
class PillIcon extends StatelessWidget {
  const PillIcon({super.key, required this.icon, this.bg = AppColors.teal50, this.fg = AppColors.teal700, this.size = 38});
  final IconData icon;
  final Color bg;
  final Color fg;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(11)),
      child: Icon(icon, color: fg, size: size * 0.5),
    );
  }
}

/// Styled search field.
class SearchBox extends StatelessWidget {
  const SearchBox({super.key, this.controller, this.hint = 'Search medications…', this.onChanged, this.readOnly = false});
  final TextEditingController? controller;
  final String hint;
  final ValueChanged<String>? onChanged;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      readOnly: readOnly,
      style: AppText.body,
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: AppText.bodyMuted,
        prefixIcon: const Icon(Icons.search, color: AppColors.muted, size: 20),
        filled: true,
        fillColor: AppColors.surface,
        contentPadding: const EdgeInsets.symmetric(vertical: 14),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.line, width: 1.5),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
          borderSide: const BorderSide(color: AppColors.teal500, width: 1.5),
        ),
      ),
    );
  }
}

/// Small uppercase section label.
class PanelTitle extends StatelessWidget {
  const PanelTitle(this.text, {super.key, this.color});
  final String text;
  final Color? color;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text(text, style: AppText.h3.copyWith(color: color)),
    );
  }
}
