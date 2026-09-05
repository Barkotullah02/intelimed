# IntelliMeds — Architecture & Code Map

_Last updated: 2026-09-04_

This document explains **what** the system is, **where** the code lives, **how** it fits together,
and **why** it's built this way — plus how to run and extend it. For status/leftovers see
[`PROJECT_STATUS.md`](PROJECT_STATUS.md); for a narrative summary see [`PROJECT_REPORT.md`](PROJECT_REPORT.md).

---

## 1. What it is

IntelliMeds is a medication-safety platform with three client surfaces sharing one backend:

| Surface | Folder | Stack | Users |
| --- | --- | --- | --- |
| **Backend API** | `springRestApi/` | Spring Boot 4.1, JPA/Hibernate 7, PostgreSQL (Supabase), JWT | all |
| **Web app** | `reactFrontend/` | React + TypeScript + Vite, hash routing | Patient · Doctor · Admin |
| **Mobile app** | `intelimed_mobile/` | Flutter (Dart), Provider | Patient (primarily) |

Core capabilities: drug **interaction checking** against a real 1,922-drug / 155,630-pair dataset,
a **drug database**, **doctor verification** + directory, **video/audio consultations** (WebRTC),
an **AI assistant** (Google Gemini), **reminders**, **appointments**, and an **admin console**.

---

## 2. System architecture (high level)

```
        ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
        │  Web (React)  │     │ Mobile(Flutter)│     │  Admin (web)  │
        │  :5173        │     │                │     │  #/admin/*    │
        └──────┬────────┘     └───────┬────────┘     └──────┬────────┘
               │  HTTPS/JSON (Bearer JWT)                    │
               └───────────────┬─────────────────────────────┘
                               ▼
                 ┌──────────────────────────────────┐
                 │  Spring Boot REST API  :8080      │
                 │  Controller → Service → Repository │
                 │  JwtAuthenticationFilter + RBAC   │
                 │  WebSocket /ws/signal (WebRTC sig) │
                 └───────┬───────────────────┬────────┘
                         │ JPA/Hibernate      │ HTTPS
                         ▼                    ▼
              ┌────────────────────┐   ┌──────────────────┐
              │ PostgreSQL (Supabase)│  │ Google Gemini API │
              │ 20 tables, real data │  │ (AI explanations) │
              └────────────────────┘   └──────────────────┘

  Video/audio call MEDIA is peer-to-peer WebRTC (browser↔browser) + public STUN;
  the server only relays SDP/ICE signaling over the /ws/signal WebSocket.
```

**Why this shape:** one authoritative REST API keeps the three clients consistent; the backend is
stateless (JWT) so it scales horizontally; media stays peer-to-peer to protect privacy and cost;
the DB is the single source of truth.

---

## 3. Backend — `springRestApi/` (127 Java files)

### Layering (every feature follows this)
```
Controller (@RestController, HTTP + auth)        e.g. AuthController
   → Service  (@Service, business logic, @Transactional)   AuthService
      → Repository (Spring Data JPA interface)   UserRepository
         → Entity/Model (@Entity)                User
DTOs (request/response) cross the controller boundary; entities never leak to clients.
```

### Package-by-feature map (`src/main/java/com/intellimeds/`)
| Package | Responsibility | Key classes |
| --- | --- | --- |
| `auth/` | Login, register (role-gated), refresh, `/me` | AuthController, **AuthService** |
| `security/` | JWT create/validate, request filter, user lookup | JwtUtil, JwtAuthenticationFilter, CustomUserDetailsService |
| `config/` | Security rules + CORS, seed data, `.env` loader | **SecurityConfig**, DataInitializer, **DotenvLoader** |
| `model/`, `repository/` | Core entities + repos | User, Role, Profile, RefreshToken |
| `user/` | Patient/professional profile | ProfileController, ProfileService |
| `drug/` | Catalogue, search, detail, alternatives | DrugController, DrugService |
| `interaction/` | Interaction check + history + per-drug | InteractionController, InteractionService, DrugInteractionRepository |
| `doctor/` | Doctor entity, `/me`, verified directory, search | DoctorController, DoctorService |
| `admin/` | Users, dashboard metrics, drugs, **doctor verification** | AdminController, AdminDoctorController, AdminService |
| `consultation/` | Video/audio sessions + **WebSocket signaling** | ConsultationController, ConsultationService, `signaling/` |
| `ai/` | Gemini provider + explain + history | AiController, AiService, **client/GeminiClient** |
| `chatbot/` | App chat endpoint (`/api/chat`) → Gemini | ChatbotController, ChatbotService |
| `appointment/` | Patient + doctor appointments | AppointmentController, AppointmentService |
| `reminder/`, `medication/`, `education/`, `notification/` | supporting patient features | … |
| `exception/` | Global error → JSON `{success,message}` | GlobalExceptionHandler |
| `dto/` | Shared envelopes | ApiResponse, PagedResponse |

> Note: `controller/`, `service/`, `report/`, `util/` exist from the original scaffold; the live code
> is organized package-by-feature as above.

### Request flow (example: patient checks an interaction)
```
POST /api/interactions/check  (Bearer JWT)
 → JwtAuthenticationFilter validates token, sets SecurityContext
 → SecurityConfig: /api/** requires authenticated
 → InteractionController.checkInteractions()
 → InteractionService.checkInteractions(drugIds, userId)
     · DrugInteractionRepository.findByDrugIds()  (JOIN FETCH, pairs AMONG the set)
     · saves InteractionHistory
 → returns ApiResponse<InteractionCheckResponse>
```

### Security & config
- **Auth:** stateless JWT (access + refresh). `SecurityConfig` permits `/api/auth/**`,
  `/actuator/health`, `/ws/**`; restricts `/api/admin/**` to `ROLE_ADMIN`; everything else authenticated.
- **Secrets:** `springRestApi/.env` (git-ignored) is read into system properties by `DotenvLoader`
  in `main()`, then referenced as `${GEMINI_API_KEY}` etc. DB URL/creds + `app.admin.*` + `webrtc.*`
  + `gemini.*` live in `application.properties`.
- **Schema:** Hibernate `ddl-auto=update` manages the schema during development (Flyway disabled).

---

## 4. Web — `reactFrontend/` (React + TS + Vite)

### Routing model (hash-based, no router lib)
```
main.tsx  ── Root gate: is the hash an app route? ──► App.tsx  (marketing landing)
                                                  └► AppRoot.tsx (the product app)
AppRoot.tsx  = hash router: matches location.hash → screen; wraps in <AuthProvider>
             requireAdmin() / requireDoctor()  guard admin & doctor routes (RequireRole)
```

### File map (`src/`)
| File | Role |
| --- | --- |
| `main.tsx` | Landing-vs-app gate (`APP_PREFIXES`) |
| `App.tsx` | Marketing landing page (has Log in / Sign up) |
| `app/AppRoot.tsx` | Route table + hash router + role guards |
| `app/AppShell.tsx` | Sidebar shell (nav per role, logo, **logout**) |
| `app/auth/AuthContext.tsx` | Auth state, login/register/logout, session restore |
| `app/auth/RequireRole.tsx` | Client-side role guard / redirect |
| `app/screens/auth.tsx` | Login, Register, **AdminLogin** |
| `app/screens/patient.tsx` | All patient screens (dashboard, checker, result, database, drug detail, reminders, doctors, assistant, profile) |
| `app/screens/doctor.tsx` | Doctor portal (dashboard, patients, appointments, profile) |
| `app/screens/admin.tsx` | Admin console screens |
| `app/screens/call.tsx` | **WebRTC call screen** + consultations list |
| `api/client.ts` | Axios instance, JWT attach, 401→refresh, `tokenStore` (localStorage) |
| `api/services.ts` | Typed API wrappers (authApi, drugApi, interactionApi, doctorApi, consultationApi, aiApi, adminApi, appointmentApi, reminderApi) |
| `api/types.ts` | DTO type mirrors |
| `app/ui.tsx`, `icons.tsx`, `navicons.tsx`, `theme.css`, `app.css` | Design system |

**Why hash routing:** the app is a static SPA served by Vite; hash routes need no server rewrite
config and let one bundle host landing + patient + doctor + admin.

---

## 5. Mobile — `intelimed_mobile/` (Flutter)

```
main.dart ── MultiProvider (ApiClient, AuthProvider, DrugProvider)
          └► AuthGate: signed in? → RootShell (5-tab: Home·Reminders·[Check FAB]·Doctors·Profile)
                                    else → LoginScreen
```
| File | Role |
| --- | --- |
| `lib/main.dart` | App root, providers, 5-tab shell + center FAB |
| `lib/api/api_client.dart` | HTTP client, Bearer token (in-memory), refresh; `kApiBase` |
| `lib/api/models.dart` | API models |
| `lib/providers/` | `auth_provider.dart`, `drug_provider.dart` |
| `lib/screens/` | login, home, check, result, drug_detail, doctors, reminders, assistant, profile |
| `lib/theme.dart`, `widgets.dart` | Design tokens + shared widgets (mirror the web) |
| `assets/logo.png` | Brand logo (also the launcher icon via `flutter_launcher_icons`) |

Design mirrors the web mobile view; screens are wired to the same REST API.

---

## 6. Data model (key entities)

```
User ─1:1─ Profile        User ─*:*─ Role (via user_roles)
Doctor ─1:1─ Profile (→ User)     Doctor.verified / verificationStatus (PENDING/APPROVED/REJECTED)
Drug ─*:*─ Drug  via DrugInteraction (severity: MAJOR/MODERATE/MINOR/UNKNOWN)  [155,630 rows]
Appointment (patient User, doctor Doctor)
ConsultationSession (patient User, doctor Doctor, roomCode, status, callType)
InteractionHistory, MedicationReminder, AiHistory, ChatHistory, Notification, EducationContent
```
Tables live in Supabase PostgreSQL (20 tables). `drugs` (1,922) and `drug_interactions` (155,630)
are the real seed dataset (DDInter); FK columns on `drug_interactions` are indexed.

---

## 7. Cross-cutting subsystems (how the notable flows work)

**Auth & roles** — register is server-gated to PATIENT/PROFESSIONAL (never ADMIN); admins are
seeded. JWT carries authorities; `@PreAuthorize`/`SecurityConfig` enforce RBAC; the web adds a
client-side `RequireRole` guard and a separate `#/admin/login`.

**Doctor verification** — professional signup creates a `Doctor` row `PENDING`. Admin approves via
`PATCH /api/admin/doctors/{id}/verification` → `verified=true` → the doctor appears in
`GET /api/doctors/verified` (the patient directory) and can be consulted.

**Consultations (WebRTC)** — `POST /api/consultations` creates a room; both parties open
`ws://…/ws/signal?token=&room=` (JWT-authenticated handshake, participant-checked). The server
relays `offer/answer/ice-candidate` between the two peers (`SignalingHandler`); **media is P2P**.
Client logic is in `call.tsx`.

**AI (Gemini)** — `GeminiClient` calls Google Gemini using the `.env` key with a shared
**medical system prompt** (accurate info, or defer to a doctor; never diagnose/prescribe). Used by
`AiService` (`/api/ai/explain`, web) and `ChatbotService` (`/api/chat`, app). Graceful offline
fallback if no key / unreachable.

---

## 8. Development process

**How it was built (phases):** planning → API (auth, drugs, interactions) → web UI → mobile →
then this cycle's hardening: doctor verification, admin separation, WebRTC consultations, wiring
every screen to real Supabase data, Gemini AI, branding (logo/icon), and QA (verification + screenshots).

**Run it locally**
```bash
# Backend (from springRestApi/)
./mvnw spring-boot:run                      # :8080, uses Supabase in application.properties

# Web (from reactFrontend/)
npm install && npm run dev                  # :5173

# Mobile (from intelimed_mobile/)
flutter pub get && flutter run
```
Set `GEMINI_API_KEY` in `springRestApi/.env` to enable real AI. Test logins: see
[`TEST_CREDENTIALS.txt`](TEST_CREDENTIALS.txt).

**Add a backend feature (pattern):** entity (`model/…`) → repository → service (`@Transactional`
reads) → controller (DTOs) → secure the route in `SecurityConfig`/`@PreAuthorize`.
**Add a web screen:** component in `screens/…` → route in `AppRoot.tsx` (guard if needed) → API
wrapper in `api/services.ts` (+ type in `api/types.ts`).

---

## 9. Where each feature lives (cross-surface index)

| Feature | Backend | Web | Mobile |
| --- | --- | --- | --- |
| Auth | `auth/`, `security/` | `auth/AuthContext.tsx`, `screens/auth.tsx` | `providers/auth_provider.dart`, `screens/login_screen.dart` |
| Interaction check | `interaction/` | `screens/patient.tsx` (Checker/Result) | `screens/check_screen.dart`, `result_screen.dart` |
| Drug database | `drug/` | `screens/patient.tsx` (Database/DrugDetail) | `screens/drug_detail_screen.dart` |
| Doctors + verification | `doctor/`, `admin/AdminDoctor*` | `screens/doctor.tsx`, `screens/admin.tsx` | `screens/doctors_screen.dart` |
| Consultations (WebRTC) | `consultation/` (+`signaling/`) | `screens/call.tsx` | — (future) |
| AI assistant | `ai/`, `chatbot/`, `ai/client/GeminiClient` | `screens/patient.tsx` (Assistant) | `screens/assistant_screen.dart` |
| Admin console | `admin/` | `screens/admin.tsx` | — |
| Reminders / Appointments | `reminder/`, `appointment/` | `screens/patient.tsx`, `screens/doctor.tsx` | `screens/reminders_screen.dart` |

---

## 10. Why (key decisions, briefly)
- **Package-by-feature + layered** backend → each feature is self-contained and testable.
- **JWT / stateless** → simple horizontal scaling; clients store tokens (web localStorage, mobile memory).
- **Peer-to-peer WebRTC** → private, low-cost media; server only brokers signaling.
- **One REST contract** for all three clients → consistency; DTOs prevent entity leakage.
- **`.env` + config placeholders** → secrets out of source (rotate the committed DB password before prod).
- **Real DDInter dataset** → clinically meaningful interaction results rather than mocks.
