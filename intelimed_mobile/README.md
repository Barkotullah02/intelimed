# IntelliMeds — Mobile App (Flutter)

The mobile client for IntelliMeds. It shares the web app's design language (teal palette,
severity colors, cards, the real logo) and is wired to the **same Spring backend** with real data.

## Design

Matches the web app's mobile view — a **5-tab shell** (Home · Reminders · Check FAB · Doctors ·
Profile) with a center floating "Check" button, defined in `lib/main.dart`. Design tokens in
`lib/theme.dart` mirror the web (`--teal-*`, severity colors, radii, type ramp); shared widgets in
`lib/widgets.dart` (PrimaryButton, SoftButton, SeverityBadge, SectionCard, Avatar, PillIcon, …).
The brand logo (`assets/logo.png`) is the same emblem the web uses.

## Wired to real API (`lib/api/api_client.dart`, base `kApiBase`)

- Auth: `login`, `register` (incl. professional `specialization`/`licenseNumber`), `me`, `logout`
- Drugs: `listDrugs`, `searchDrugs`, `getDrug`
- Interactions: `checkInteractions`, `getInteractionHistory`
- Doctors: `listVerifiedDoctors`, `getDoctor`
- Reminders: `createReminder`, `deleteReminder`
- AI chat: `sendMessage`, `getChatHistory`
- Notifications: `markNotificationRead`

Screens consuming these: Home (recent checks + meds), Check → Result (real interaction check),
Doctors (verified list), Reminders, Assistant (chat), Profile.

## Running

```bash
flutter pub get
flutter run                 # pick a device
flutter analyze             # static analysis — currently clean
```

API base in `lib/api/api_client.dart` (`kApiBase`):
- iOS simulator / desktop: `http://localhost:8080/api`
- Android emulator: `http://10.0.2.2:8080/api`
- Physical device: your machine's LAN IP, e.g. `http://192.168.1.5:8080/api`

## Remaining / nice-to-have

- **AI assistant** uses the backend chatbot endpoint (`/api/chat`); confirm it's backed by a real
  model (the web assistant uses `/api/ai/explain` → Gemini). Consider pointing both at the same path.
- **Role-based experience** — the app is patient-first; there's no separate doctor/admin portal
  (those are web surfaces). A "verification pending" state for professionals could be added.
- **Consultations (video/audio)** — not on mobile yet; would need `flutter_webrtc` + the `/ws/signal`
  signaling channel. Larger effort; scope separately.
- Appointments / Education screens if you want full parity with the backend.

See the repo-wide [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) for the full cross-surface picture.
