export type Severity = 'major' | 'moderate' | 'minor' | 'unknown'

export type Drug = {
  id: string
  name: string
  generic: string
  drugClass: string
}

export type Interaction = {
  a: string
  b: string
  severity: Severity
  summary: string
  dos: string[]
  donts: string[]
}

export const DRUGS: Drug[] = [
  { id: 'warfarin', name: 'Warfarin', generic: 'warfarin sodium', drugClass: 'Anticoagulant' },
  { id: 'aspirin', name: 'Aspirin', generic: 'acetylsalicylic acid', drugClass: 'Antiplatelet / NSAID' },
  { id: 'lisinopril', name: 'Lisinopril', generic: 'lisinopril', drugClass: 'ACE inhibitor' },
  { id: 'ibuprofen', name: 'Ibuprofen', generic: 'ibuprofen', drugClass: 'NSAID' },
  { id: 'metformin', name: 'Metformin', generic: 'metformin HCl', drugClass: 'Antidiabetic (biguanide)' },
  { id: 'atorvastatin', name: 'Atorvastatin', generic: 'atorvastatin calcium', drugClass: 'Statin' },
  { id: 'amoxicillin', name: 'Amoxicillin', generic: 'amoxicillin', drugClass: 'Antibiotic (penicillin)' },
  { id: 'omeprazole', name: 'Omeprazole', generic: 'omeprazole', drugClass: 'Proton-pump inhibitor' },
  { id: 'sertraline', name: 'Sertraline', generic: 'sertraline HCl', drugClass: 'SSRI antidepressant' },
  { id: 'vitamind', name: 'Vitamin D', generic: 'cholecalciferol', drugClass: 'Supplement' },
]

export const INTERACTIONS: Interaction[] = [
  {
    a: 'warfarin', b: 'aspirin', severity: 'major',
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
  },
  {
    a: 'lisinopril', b: 'ibuprofen', severity: 'moderate',
    summary: 'Ibuprofen can blunt lisinopril’s blood-pressure effect and, taken often, may stress the kidneys.',
    dos: [
      'Prefer paracetamol for occasional pain',
      'Stay well hydrated',
      'Check your blood pressure regularly',
    ],
    donts: [
      'Don’t take ibuprofen daily without medical advice',
      'Don’t combine with other NSAIDs',
    ],
  },
  {
    a: 'metformin', b: 'vitamind', severity: 'minor',
    summary: 'No meaningful interaction. Vitamin D is commonly taken alongside metformin and is considered safe.',
    dos: ['Take as directed', 'Pair vitamin D with a meal for absorption'],
    donts: ['No special precautions needed'],
  },
]

export function findInteraction(a: string, b: string): Interaction | undefined {
  return INTERACTIONS.find(
    (i) => (i.a === a && i.b === b) || (i.a === b && i.b === a),
  )
}

export const REMINDERS = [
  { name: 'Metformin 500mg', time: '8:00 AM', note: 'with food', taken: true },
  { name: 'Lisinopril 10mg', time: '9:00 AM', note: '', taken: true },
  { name: 'Vitamin D 1000IU', time: '1:00 PM', note: 'with lunch', taken: false },
  { name: 'Atorvastatin 20mg', time: '9:00 PM', note: '', taken: false },
]

export const DOCTORS = [
  { name: 'Dr. Emily Rodriguez', specialty: 'Cardiology', next: 'Aug 14, 10:30 AM', initials: 'ER' },
  { name: 'Dr. James Park', specialty: 'General Practice', next: 'Sep 2, 9:00 AM', initials: 'JP' },
  { name: 'Dr. Aisha Khan', specialty: 'Endocrinology', next: 'No upcoming visit', initials: 'AK' },
]

export const USERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@email.com', role: 'Patient', status: 'Active', joined: 'Jul 2026' },
  { name: 'Dr. Emily Rodriguez', email: 'e.rodriguez@clinic.com', role: 'Professional', status: 'Active', joined: 'May 2026' },
  { name: 'Mark Thompson', email: 'mark.t@email.com', role: 'Patient', status: 'Suspended', joined: 'Jun 2026' },
  { name: 'Dr. James Park', email: 'j.park@clinic.com', role: 'Professional', status: 'Active', joined: 'Feb 2026' },
]

export const ARTICLES = [
  { tag: 'Basics', title: 'Understanding drug interactions', read: '4 min read' },
  { tag: 'Daily life', title: 'Managing multiple medications', read: '6 min read' },
  { tag: 'Guide', title: 'How to read a severity rating', read: '3 min read' },
  { tag: 'Safety', title: 'When to call your doctor', read: '5 min read' },
]

export const SEVERITY_LABEL: Record<Severity, string> = {
  major: 'Major', moderate: 'Moderate', minor: 'Safe', unknown: 'Unknown',
}
