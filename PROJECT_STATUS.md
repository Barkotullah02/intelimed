# IntelliMeds — Project Status & Leftovers

_Last updated: 2026-09-04_

The single source of truth for what is built, what is partial, and what is left to do
across the three surfaces of the project. Work the "leftovers" from the checklists below.

## The three surfaces

| Surface | Path | Stack | Overall state |
| --- | --- | --- | --- |
| **Backend API** | `springRestApi/` | Spring Boot 4.1, JPA/Hibernate, PostgreSQL (Supabase), JWT | **Most complete** — real data + all core modules |
| **Web app** | `reactFrontend/` | React + TypeScript + Vite | **Feature-complete for patient/doctor/admin core flows** |
| **Mobile app** | `intelimed_mobile/` | Flutter (Dart) | **UI prototype only** — mostly mock, several flows now broken |

Users/roles: **Patient** (`ROLE_PATIENT`), **Healthcare Professional** (`ROLE_HEALTHCARE_PROFESSIONAL`), **Admin** (`ROLE_ADMIN`).

---

## Feature status matrix

| Feature | Backend | Web | Mobile |
| --- | :---: | :---: | :---: |
| Auth (login / register / refresh / me) | ✅ | ✅ | ✅ |
| Registration role gating (no self-admin) | ✅ | ✅ | ⚠️ sends role, no pro fields |
| Seeded admin account | ✅ | — | — |
| Separate admin login URL + role routing | ✅ | ✅ | ❌ |
| Doctor application on professional signup | ✅ | ✅ | ❌ |
| Admin doctor verification (approve/reject) | ✅ | ✅ | ❌ |
| Doctor portal / dashboard | ✅ (`/doctors/me`) | ✅ | ❌ |
| Drug search (real 1,922-drug catalogue) | ✅ | ✅ | ⚠️ list only, mock check |
| Interaction check (real 155k dataset) | ✅ | ✅ | ❌ mock |
| Drug detail + known interactions | ✅ | ✅ | ❌ mock |
| Video/audio consultations (WebRTC) | ✅ | ✅ | ❌ |
| AI assistant (Gemini via `.env`) | ✅ | ✅ | ❌ mock |
| Patient dashboard (recent checks, reminders) | ✅ | ✅ real | ❌ mock |
| Patient doctors directory | ✅ | ✅ real | ❌ mock |
| Logout (all portals) | ✅ | ✅ | ⚠️ mock button |
| Admin dashboard metrics | ✅ | ✅ real | ❌ |
| Admin user management (list/activate/delete) | ✅ | ✅ real | ❌ |
| Admin drug management (list/delete) | ✅ | ✅ real | ❌ |
| Admin: create drug / interaction / invite user | ✅ (API) | ❌ no form | ❌ |
| Reminders | ✅ | ⚠️ list only, no CRUD | ❌ mock |
| Appointments | ✅ | ⚠️ patient-side only | ❌ mock |
| Education / Notifications | ✅ | ⚠️ mock UI | ❌ |

Legend: ✅ done · ⚠️ partial · ❌ not built

---

## What was built recently (this cycle)

1. **Registration hardening** — `/api/auth/register` refuses `ROLE_ADMIN`; admin is seeded from config.
2. **Doctor verification workflow** — professional signup creates a `PENDING` doctor row; admin approves/rejects; approved doctors appear in the public directory.
3. **Admin separation** — `#/admin/login` on web + client-side role guards; server keeps one auth endpoint.
4. **Video/audio consultations** — new `consultation` module: session lifecycle + JWT-authenticated WebSocket signaling (`/ws/signal`) + WebRTC peer-to-peer media. Web call screen built.
5. **Real interaction data** — web Checker/Result/DrugDetail now use the live 1,922-drug / 155,630-interaction Supabase dataset. Fixed a check bug (OR→AND), an N+1 (`JOIN FETCH`), and added FK indexes.
6. **Gemini AI** — `AiService.explain()` calls Google Gemini when selected + configured; key read from `springRestApi/.env` (`GEMINI_API_KEY`); graceful offline fallback. Web Assistant wired.
7. **Real logo** — `logo.png` applied across web nav, auth screens, in-app shells, and favicon.

### Follow-up cycle (fixes + de-mocking)

8. **De-mocked the patient app** — Dashboard (recent checks via `/interactions/history` + reminders), Doctors (`/doctors/verified`), and Reminders now use real data.
9. **De-mocked the admin panel** — real dashboard metrics (`AdminService` now counts drugs/interactions/appointments/AI requests), User Management (list + activate/deactivate + delete), and Drug Management (real 1,922-drug list + delete). Interactions & Doctor Verification were already live.
10. **Gemini fixed** — model updated `gemini-2.0-flash` → **`gemini-3.6-flash`** (old one was 404'd by Google); the earlier "AI not working" was also just the backend being down.
11. **Video preview fixed** — `<video>` elements now call `play()` after `srcObject` is set (autoplay doesn't fire on programmatic assignment) — resolves the black-screen-while-connected issue.
12. **Consultation rejoin** — `join` re-activates an `ENDED` session instead of returning 409, so an accidental hang-up / dropped call can be rejoined.
13. **Logout everywhere** — added to the shared sidebar footer for patient/doctor/admin; made resilient so a failed server call still clears the session and redirects.
14. **Second admin account** created & promoted in DB (`barkotullahopu+admin@gmail.com`).

---

## Leftovers — Backend (`springRestApi/`)

- [ ] **Lock down `PUT /api/ai/provider`** — currently any authenticated user can switch the AI provider; restrict to `hasRole('ADMIN')`.
- [ ] **User lock/unlock** — `User.isLocked` exists but no admin endpoint toggles it (only `isActive`).
- [ ] **Role management endpoint** — no admin way to grant/revoke roles.
- [ ] **Offline / Ollama AI provider** — implement behind the same provider dispatch as Gemini (Ollama = HTTP at `localhost:11434`).
- [ ] **Interaction/AI explanation text** — the dataset has severity only (no description/recommendation); consider generating per-pair text via the AI provider and filling `InteractionCheckResponse.aiExplanation`.
- [ ] **TURN server config for production** — hooks exist (`webrtc.turn-*`); currently STUN-only (won't traverse all NATs).
- [ ] **Chatbot module** (`/api/chat`) — likely still stubbed; reuse `GeminiClient`.
- [ ] **Rotate the committed DB password** in `application.properties` and move to env var (it is in git history).
- [ ] **Consultations ↔ appointments** — link a call to an existing appointment in the UI/flow.

## Leftovers — Web (`reactFrontend/`)

- [ ] **Admin create/edit forms** — "Add drug", "New interaction", "Invite user", and the admin drug/interaction **edit** flows aren't wired (list + delete work; the backend POST/PUT endpoints exist). Same for the patient "Add reminder" button.
- [ ] **Reminders CRUD** — patient Reminders lists real data but can't create/edit/delete yet (`/api/reminders` POST/PUT/DELETE).
- [ ] **Appointments / Education / Notifications** — these patient screens still render sample data (`app/data.ts`); wire to their live APIs.
- [x] ~~**Doctor portal secondary screens**~~ — DONE. "My Patients" (derived from consultations/appointments) and "Appointments" (new `GET /api/appointments/doctor`) now show real data; dashboard stats are real too.
- [ ] **Doctor Edit Profile** form (button currently links to read-only profile).
- [ ] **Book appointments** — patients can't create appointments from the UI yet (backend `POST /api/appointments` exists), so the doctor's Appointments list is empty until that's wired.
- [ ] **Recent checks show drug IDs, not names** — `interaction_history` stores drug UUIDs; resolve to names for a nicer dashboard/history.
- [ ] **AI provider admin screen** — UI to select provider + (for online) manage key/status.

## Mobile (Flutter, `intelimed_mobile/`) — status corrected

**Earlier notes here were stale.** The app is **not** a mock prototype — it shares the web design
language (5-tab shell, teal tokens, real `logo.png`) and is wired to real APIs: auth (incl.
professional `specialization`/`licenseNumber`, so registration works), drug search, interaction
check, verified doctors, reminders CRUD, and AI chat. `flutter analyze` is **clean**. Full detail in
[`intelimed_mobile/README.md`](intelimed_mobile/README.md).

Remaining / nice-to-have:
- [ ] **AI assistant path** — mobile uses `/api/chat` (chatbot); web uses `/api/ai/explain` (Gemini). Point both at the same real model.
- [ ] **Consultations (video/audio)** on mobile — `flutter_webrtc` + `/ws/signal`; larger effort, scope separately.
- [ ] **Professional "pending verification" state** and any doctor-side screens (mostly a web surface today).
- [ ] Appointments / Education screens for full backend parity.

---

## Running the project

**Backend** (from `springRestApi/`):
```bash
./mvnw spring-boot:run
```
Uses Supabase config in `application.properties`. If Supabase is paused, override the datasource:
```bash
SPRING_DATASOURCE_URL="jdbc:postgresql://localhost:5432/intellimeds" SPRING_DATASOURCE_USERNAME="<user>" SPRING_DATASOURCE_PASSWORD="" ./mvnw spring-boot:run
```

**Web** (from `reactFrontend/`):
```bash
npm install && npm run dev   # http://localhost:5173
```

**Mobile** (from `intelimed_mobile/`):
```bash
flutter run
```
(Android emulator: set API base to `http://10.0.2.2:8080/api` in `lib/api/api_client.dart`.)

### Enable the Gemini AI
1. Get a key: https://aistudio.google.com/apikey
2. Edit `springRestApi/.env` → replace `GEMINI_API_KEY=REPLACE_WITH_YOUR_GEMINI_API_KEY`
3. Restart the backend. The `GEMINI` provider is already selected; the Assistant returns real answers.

### Seeded accounts (dev)
- **Admin:** `admin@intellimeds.com` / `ChangeMe!123` (from `app.admin.*` in `application.properties`)
- Additional test accounts are created during use; see conversation history.

---

## Known issues / tech debt

- `PUT /api/ai/provider` is not admin-restricted (any logged-in user can switch the AI provider).
- DB password committed to git history (`application.properties`).
- Legacy admin/test accounts from earlier testing (`admin@test.com`, `admin@intellimeds.dev`, `verify…@example.com` demo doctors) — review/remove.
- Interaction dataset has no per-pair text (severity only); the assistant/`aiExplanation` can fill this.
- Admin create/edit forms are not wired (backend supports them; UI does list + delete only).
- Mobile professional registration is broken against the current backend contract.
- Backend startup against Supabase (Tokyo) can be slow (2–4 min) when latency is high.
