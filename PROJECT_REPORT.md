# IntelliMeds — Project Report

_Prepared 2026-09-04_

## 1. Overview
IntelliMeds is a medication-safety platform that helps patients avoid dangerous drug combinations
and connect with verified doctors, while giving clinicians and administrators the tools to support
them. It spans three surfaces on a shared backend: a **web app** (patients, doctors, admins), a
**Flutter mobile app** (patients), and a **Spring Boot REST API** backed by PostgreSQL (Supabase).

## 2. Objectives
- Let patients **check drug–drug interactions** with clinical-grade severity ratings.
- Provide a searchable **drug database** and **AI assistant** for plain-language guidance.
- Onboard **verified healthcare professionals** and enable **tele-consultations**.
- Give admins a console to manage users, doctors, drugs, and interactions.
- Keep the experience consistent and safe across web and mobile.

## 3. Features delivered
- **Authentication & roles** — JWT auth for Patient / Healthcare Professional / Admin; public
  registration is gated (no self-made admins); admins are provisioned server-side.
- **Doctor verification** — professionals apply at signup (PENDING); an admin approves/rejects;
  approved doctors appear in the patient directory and can be consulted.
- **Interaction checking on real data** — checks run against a **1,922-drug / 155,630-pair**
  dataset (DDInter). Returns highest severity + the interacting pairs; per-drug "known
  interactions" on the drug-detail page.
- **Video/audio consultations** — 1:1 WebRTC calls (peer-to-peer media) with a JWT-authenticated
  WebSocket signaling relay; sessions can be created, joined, ended, and re-joined.
- **AI assistant (Google Gemini)** — real answers governed by a medical-safety system prompt:
  give accurate information or explicitly defer to a doctor; never diagnose or prescribe.
- **Admin console** — real dashboard metrics, user management (activate/deactivate/delete), doctor
  verification queue, and drug/interaction management.
- **Doctor portal** — dashboard, my-patients (from consultations/appointments), appointments, profile.
- **Supporting patient features** — reminders, appointments, medication history, education, notifications.
- **Branding** — the real IntelliMeds logo across web (nav, auth, shells, favicon) and mobile
  (login + Android/iOS launcher icons).

## 4. Technology
| Layer | Choice |
| --- | --- |
| Backend | Java 17, Spring Boot 4.1, Spring Security + JWT, Spring Data JPA / Hibernate 7 |
| Database | PostgreSQL 17 (Supabase), 20 tables |
| Web | React + TypeScript + Vite, Axios, hash routing |
| Mobile | Flutter (Dart), Provider |
| Real-time | WebRTC (media) + Spring WebSocket (signaling) |
| AI | Google Gemini (`generateContent`) |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full code map and request flows.

## 5. Current status
Backend and web are feature-complete for the patient/doctor/admin core flows and run on **real
Supabase data**. The Flutter app mirrors the web mobile design and is wired to the same APIs;
`flutter analyze` is clean. Detailed per-surface status and the remaining backlog are in
[`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## 6. Testing & verification
- **Auth, doctor verification, consultation signaling, and AI** were verified end-to-end via curl
  (e.g., the signaling relay correctly brokers offer/answer/ICE between two peers; the AI returns
  accurate answers and defers to a doctor for personal dosing questions).
- **Screenshots** of all pages (24 web + 8 app), labeled by task, are in `screenshots/`
  (see `screenshots/INDEX.md`).
- **Test accounts** (patient/doctor/admin) are in [`TEST_CREDENTIALS.txt`](TEST_CREDENTIALS.txt).

## 7. Work distribution (this cycle)
Tracked on the Notion "IntelliMeds — Sprint Board" (all marked Done):
- **Opu** — backend/API: doctor verification, consultations, interaction queries, Gemini, admin metrics.
- **Sanin** — web: admin separation + logout, doctor portal, admin panel, patient screens, call screen + branding.
- **Ishtiaque** — mobile: real-data wiring, app icon, design parity, analyze clean.
- **Ahornish** — QA & launch: AI verification, screenshots, documentation.

## 8. Known issues / risks
- The Supabase DB password is committed in `application.properties` (and git history) — **rotate**
  and move to `.env` before production.
- AI responses can be slow (~30s) over the remote link; a request timeout is in place, but consider
  a faster model / caching.
- Consultations use public STUN only — add a **TURN** server for reliable cross-network calls.
- The AI provider-switch endpoint isn't admin-restricted yet.

## 9. Next steps
- Wire admin create/edit forms and patient reminder/appointment CRUD.
- Add a TURN server and (optionally) consultations on mobile.
- Rotate secrets and prepare a production configuration profile.
- Fill AI-generated per-pair explanations into interaction results.
