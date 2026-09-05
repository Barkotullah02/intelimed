import 'package:flutter/material.dart';
import 'theme.dart';

enum Severity { major, moderate, minor, unknown }

extension SeverityInfo on Severity {
  String get label => switch (this) {
        Severity.major => 'Major',
        Severity.moderate => 'Moderate',
        Severity.minor => 'Safe',
        Severity.unknown => 'Unknown',
      };
  Color get color => switch (this) {
        Severity.major => AppColors.major,
        Severity.moderate => AppColors.moderate,
        Severity.minor => AppColors.minor,
        Severity.unknown => AppColors.unknown,
      };
  Color get bg => switch (this) {
        Severity.major => AppColors.majorBg,
        Severity.moderate => AppColors.moderateBg,
        Severity.minor => AppColors.minorBg,
        Severity.unknown => AppColors.unknownBg,
      };
}

class Drug {
  const Drug(this.id, this.name, this.generic, this.drugClass);
  final String id;
  final String name;
  final String generic;
  final String drugClass;
}

class Interaction {
  const Interaction({
    required this.a,
    required this.b,
    required this.severity,
    required this.summary,
    required this.dos,
    required this.donts,
  });
  final String a;
  final String b;
  final Severity severity;
  final String summary;
  final List<String> dos;
  final List<String> donts;
}

class Reminder {
  const Reminder(this.name, this.time, this.note, this.taken);
  final String name;
  final String time;
  final String note;
  final bool taken;
}

class Doctor {
  const Doctor(this.name, this.specialty, this.next, this.initials);
  final String name;
  final String specialty;
  final String next;
  final String initials;
}

const kDrugs = <Drug>[
  Drug('warfarin', 'Warfarin', 'warfarin sodium', 'Anticoagulant'),
  Drug('aspirin', 'Aspirin', 'acetylsalicylic acid', 'Antiplatelet / NSAID'),
  Drug('lisinopril', 'Lisinopril', 'lisinopril', 'ACE inhibitor'),
  Drug('ibuprofen', 'Ibuprofen', 'ibuprofen', 'NSAID'),
  Drug('metformin', 'Metformin', 'metformin HCl', 'Antidiabetic'),
  Drug('atorvastatin', 'Atorvastatin', 'atorvastatin calcium', 'Statin'),
  Drug('amoxicillin', 'Amoxicillin', 'amoxicillin', 'Antibiotic'),
  Drug('vitamind', 'Vitamin D', 'cholecalciferol', 'Supplement'),
];

const kInteractions = <Interaction>[
  Interaction(
    a: 'warfarin',
    b: 'aspirin',
    severity: Severity.major,
    summary: 'Taking warfarin with aspirin sharply raises the risk of serious bleeding, because both thin the blood through different pathways.',
    dos: [
      'Tell your doctor before taking these together',
      'Watch for unusual bruising, dark stools or bleeding gums',
      'Keep your regular INR blood-test appointments',
    ],
    donts: [
      'Don’t stop either medication on your own',
      'Don’t add other NSAIDs like ibuprofen',
      'Don’t ignore prolonged bleeding from a small cut',
    ],
  ),
  Interaction(
    a: 'lisinopril',
    b: 'ibuprofen',
    severity: Severity.moderate,
    summary: 'Ibuprofen can blunt lisinopril’s blood-pressure effect and, taken often, may stress the kidneys.',
    dos: ['Prefer paracetamol for occasional pain', 'Stay well hydrated', 'Check your blood pressure regularly'],
    donts: ['Don’t take ibuprofen daily without medical advice', 'Don’t combine with other NSAIDs'],
  ),
  Interaction(
    a: 'metformin',
    b: 'vitamind',
    severity: Severity.minor,
    summary: 'No meaningful interaction. Vitamin D is commonly taken alongside metformin and is considered safe.',
    dos: ['Take as directed', 'Pair vitamin D with a meal for absorption'],
    donts: ['No special precautions needed'],
  ),
];

Interaction? findInteraction(String a, String b) {
  for (final i in kInteractions) {
    if ((i.a == a && i.b == b) || (i.a == b && i.b == a)) return i;
  }
  return null;
}

Drug drugById(String id) => kDrugs.firstWhere((d) => d.id == id);

const kReminders = <Reminder>[
  Reminder('Metformin 500mg', '8:00 AM', 'with food', true),
  Reminder('Lisinopril 10mg', '9:00 AM', '', true),
  Reminder('Vitamin D 1000IU', '1:00 PM', 'with lunch', false),
  Reminder('Atorvastatin 20mg', '9:00 PM', '', false),
];

const kDoctors = <Doctor>[
  Doctor('Dr. Emily Rodriguez', 'Cardiology', 'Aug 14, 10:30 AM', 'ER'),
  Doctor('Dr. James Park', 'General Practice', 'Sep 2, 9:00 AM', 'JP'),
  Doctor('Dr. Aisha Khan', 'Endocrinology', 'No upcoming visit', 'AK'),
];
