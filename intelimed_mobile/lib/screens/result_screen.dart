import 'package:flutter/material.dart';
import '../api/models.dart';
import '../data.dart';
import '../theme.dart';
import '../widgets.dart';

class ResultScreen extends StatelessWidget {
  const ResultScreen({super.key, this.apiResult, this.selectedDrugs, this.selected});
  final ApiInteractionCheckResponse? apiResult;
  final List<ApiDrug>? selectedDrugs;
  final List<String>? selected;

  Severity _severityFromString(String s) => switch (s.toUpperCase()) {
        'MAJOR' => Severity.major,
        'MODERATE' => Severity.moderate,
        'MINOR' || 'NONE' => Severity.minor,
        _ => Severity.unknown,
      };

  @override
  Widget build(BuildContext context) {
    final interactions = apiResult?.interactions ?? [];
    final highestSeverity = apiResult?.highestSeverity ?? 'NONE';
    final severity = _severityFromString(highestSeverity);

    final pairLabel = interactions.isNotEmpty
        ? '${interactions.first.drugA} + ${interactions.first.drugB}'
        : (selectedDrugs?.map((d) => d.name).join(' + ') ?? selected?.join(' + ') ?? '');

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppColors.paper,
        surfaceTintColor: Colors.transparent,
        title: const Text('Interaction result', style: AppText.h2),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(18, 8, 18, 40),
        children: [
          // severity banner
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(color: severity.bg, borderRadius: BorderRadius.circular(18)),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(color: severity.color, borderRadius: BorderRadius.circular(13)),
                  child: const Icon(Icons.warning_amber_rounded, color: Colors.white),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        severity == Severity.minor ? 'No significant interaction' : '${severity.label} interaction',
                        style: AppText.h2,
                      ),
                      Text(pairLabel, style: TextStyle(color: AppColors.inkSoft, fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // AI explanation if available
          if (apiResult?.aiExplanation != null && apiResult!.aiExplanation!.isNotEmpty) ...[
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const PanelTitle('AI Explanation', color: AppColors.teal700),
                  const SizedBox(height: 4),
                  Text(apiResult!.aiExplanation!, style: AppText.body),
                ],
              ),
            ),
            const SizedBox(height: 16),
          ],

          // Individual interaction details
          for (final interaction in interactions) ...[
            SectionCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text('${interaction.drugA} + ${interaction.drugB}',
                            style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                      ),
                      SeverityBadge(level: _severityFromString(interaction.severity)),
                    ],
                  ),
                  if (interaction.description != null && interaction.description!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(interaction.description!, style: AppText.body),
                  ],
                  if (interaction.recommendation != null && interaction.recommendation!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, size: 16, color: AppColors.teal700),
                        const SizedBox(width: 6),
                        Expanded(child: Text(interaction.recommendation!, style: AppText.bodyMuted)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],

          if (interactions.isEmpty)
            SectionCard(
              child: Text(
                'These medications are commonly taken together with no meaningful interaction.',
                style: AppText.body,
              ),
            ),

          const SizedBox(height: 16),
          PrimaryButton(label: 'Talk to your doctor', icon: Icons.chat_bubble_outline, onPressed: () {}),
          const SizedBox(height: 16),
          Text(
            'This tool provides general information and is not a substitute for professional medical advice.',
            style: AppText.caption,
          ),
        ],
      ),
    );
  }
}
