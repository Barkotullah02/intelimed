# IntelliMeds — Novelty, Significance & System Flows

> A medication-safety and tele-health platform that unifies **drug-interaction
> checking**, an **AI medical assistant**, and **doctor–patient video/audio
> consultations** behind one role-aware account system — delivered across a
> Spring Boot API, a React web app, and a Flutter mobile app.

---

## 1. Why this project is novel

Most health apps do *one* of these things. IntelliMeds is unusual in stitching the
**full safety-to-care loop** into a single, coherent product:

| Capability | What makes it notable here |
|---|---|
| **Real drug-interaction checker** | Backed by a live catalogue of **1,922 real drugs** in PostgreSQL and a real interaction dataset — not a toy list. Results are graded by severity and **explained in plain language by AI**. |
| **AI medical assistant** | A Google **Gemini**-powered chatbot constrained by a shared **medical-safety system prompt** (evidence-based, defers to professionals, refuses off-topic requests) with a safe offline fallback when the model is unreachable. |
| **Real-time tele-consultation** | Peer-to-peer **WebRTC** video/audio with the server acting only as a **WebSocket signaling relay** — plus a self-hosted **coturn TURN server** so calls connect through strict/mobile NAT. Media never touches the server. |
| **Booking-gated consultations** | Calls can't be started ad-hoc. A patient **books a slot**, the doctor **accepts/declines**, and the call only opens **at the scheduled time** — mirroring how real clinics work. |
| **Trust & verification** | Doctors are a distinct role with an **admin-reviewed verification** workflow; only verified doctors appear to patients and can consult. |
| **Three real surfaces, one backend** | The same stateless **JWT** API serves a **React** web app and a **Flutter** mobile app, with **role-based routing** giving patients, doctors, and admins different experiences. |

**In one line:** IntelliMeds turns "is this medication safe for me?" and "I need to talk
to a doctor" into a single guided journey — check interactions, ask the AI, book a
verified doctor, and meet them over a real video call — all governed by one identity system.

### Engineering notes worth highlighting
- **Privacy-preserving media**: WebRTC keeps audio/video peer-to-peer; the backend only
  brokers SDP/ICE. TURN relays media only when a direct path is impossible.
- **Timezone-correct scheduling**: appointment times are stored in UTC and converted to
  each device's local time, so the join window is correct for users in any region.
- **Resilient by design**: persistent login that survives offline restarts, an AI request
  timeout with graceful degradation, and a bundled drug catalogue fallback when the API is
  unreachable.
- **Production deployment**: runs as a managed **systemd** service on a VPS against a
  Supabase-hosted PostgreSQL database.

---

## 2. The three user types

```mermaid
flowchart TD
    A[Person opens IntelliMeds] --> B[Register / Login]
    B --> C{JWT role}
    C -->|ROLE_PATIENT| P[Patient experience]
    C -->|ROLE_HEALTHCARE_PROFESSIONAL| D[Doctor portal]
    C -->|ROLE_ADMIN| M[Admin console - web]

    P --> P1[Drug interaction checker]
    P --> P2[AI assistant]
    P --> P3[Browse verified doctors]
    P --> P4[Book appointments]
    P --> P5[Join consultations]
    P --> P6[Medication reminders]

    D --> D1[Verification status]
    D --> D2[Accept / decline requests]
    D --> D3[Join consultations]
    D --> D4[Patients and schedule]

    M --> M1[Verify doctors]
    M --> M2[Manage users]
    M --> M3[Manage drugs and interactions]
```

*Role is read from `/auth/me` after login; the mobile app routes healthcare
professionals to the doctor portal and everyone else to the patient app. The admin
console lives on the web surface.*

---

## 3. Patient journey

```mermaid
flowchart TD
    Start([Patient signed in]) --> Home[Home dashboard]

    Home --> Check[Interaction checker]
    Check --> Search[Search the 1,922-drug catalogue]
    Search --> Pick[Select 2+ medications]
    Pick --> Analyze[POST /interactions/check]
    Analyze --> Result[Severity-graded interactions + AI explanation]

    Home --> AI[AI assistant]
    AI --> Ask[Ask a medication / health question]
    Ask --> Gemini[Backend calls Gemini with medical prompt]
    Gemini --> Answer[Evidence-based answer + safety reminder]

    Home --> Docs[Doctors directory - verified only]
    Docs --> Book[Book appointment: date, time, video/audio, reason]
    Book --> Pending[Request sent - status PENDING]
    Pending --> Wait{Doctor decision}
    Wait -->|Accepted| Confirmed[CONFIRMED - shows in My Appointments]
    Wait -->|Declined| Declined[DECLINED]
    Confirmed --> TimeCheck{Scheduled time reached?}
    TimeCheck -->|Not yet| Hold[Join button locked]
    TimeCheck -->|Yes, within window| Join[Join call button]
    Join --> Call[WebRTC video/audio consultation]
    Call --> Ended[Call ends - appointment COMPLETED]

    Home --> Rem[Medication reminders]
    Rem --> AddRem[Create reminder: drug, time, frequency]
    AddRem --> RemList[Reminders list]
```

---

## 4. Doctor journey

```mermaid
flowchart TD
    DStart([Doctor signed in]) --> Verify{Verification status}
    Verify -->|PENDING| Locked[Awaiting admin approval - limited access]
    Verify -->|REJECTED| Rejected[Re-apply with corrected credentials]
    Verify -->|APPROVED| Dash[Doctor dashboard unlocked]

    Dash --> Stats[Stats: patients, appts today, consultations]
    Dash --> Appts[Appointments tab]
    Appts --> Req{Incoming request}
    Req -->|Review| Decide[Accept or Decline]
    Decide -->|Accept| Conf[Appointment CONFIRMED]
    Decide -->|Decline| Dec[Appointment DECLINED]
    Conf --> DTime{Scheduled time reached?}
    DTime -->|Yes| DJoin[Join call]
    DJoin --> DCall[WebRTC consultation with patient]
    DCall --> DDone[Ends - marked COMPLETED]

    Dash --> Pats[My patients - derived from appts/consultations]
    Dash --> Prof[Profile and logout]
```

*Only verified doctors are listed in the patient-facing directory and may consult.
A doctor can accept/decline only their own appointment requests (owner-enforced).*

---

## 5. Admin journey

```mermaid
flowchart TD
    AStart([Admin signed in - web]) --> AConsole[Admin console]
    AConsole --> V[Doctor verification queue]
    V --> VR{Review credentials}
    VR -->|Approve| Approved[Doctor becomes APPROVED and listed]
    VR -->|Reject| Rej[Doctor REJECTED with reason]

    AConsole --> U[User management]
    AConsole --> DR[Drug catalogue management]
    AConsole --> IX[Interaction data management]
```

*The seed admin is provisioned on startup from configuration. Admin tooling is on the
web surface; the mobile app intentionally has no admin mode.*

---

## 6. Appointment → consultation (end-to-end sequence)

This is the core interaction that ties patients and doctors together. Media is
peer-to-peer; the backend only relays signaling.

```mermaid
sequenceDiagram
    participant Pt as Patient app
    participant API as Spring REST API
    participant Dr as Doctor app
    participant WS as Signaling (WebSocket)
    participant TURN as coturn TURN server

    Pt->>API: POST /appointments (doctor, time, type)
    API-->>Pt: PENDING
    Dr->>API: GET /appointments/doctor
    API-->>Dr: sees PENDING request
    Dr->>API: POST /appointments/{id}/accept
    API-->>Dr: CONFIRMED

    Note over Pt,Dr: At the scheduled time (joinable = true)

    Pt->>API: POST /consultations/appointments/{id}/join
    API-->>Pt: room code + ICE servers (STUN + TURN)
    Dr->>API: POST /consultations/appointments/{id}/join
    API-->>Dr: same room code + ICE

    Pt->>WS: connect (JWT + room)
    Dr->>WS: connect (JWT + room)
    WS-->>Pt: peer-joined
    Pt->>WS: SDP offer
    WS-->>Dr: relay offer
    Dr->>WS: SDP answer + ICE
    WS-->>Pt: relay answer + ICE

    Note over Pt,Dr: Direct P2P media if possible,<br/>else relayed via TURN
    Pt-->>Dr: Encrypted audio/video (WebRTC)

    Pt->>API: POST /consultations/{id}/end
    API-->>API: appointment marked COMPLETED
```

---

## 7. Drug interaction check (data flow)

```mermaid
flowchart LR
    U[Patient] --> S[Search drugs]
    S --> DB[(PostgreSQL: 1,922 drugs)]
    DB --> Sel[Select medications]
    Sel --> Chk[POST /interactions/check]
    Chk --> Match[Match against interaction dataset]
    Match --> Sev[Grade severity: major / moderate / minor]
    Sev --> Expl[AI explains the result in plain language]
    Expl --> Out[Result shown to patient + saved to history]
```

---

## 8. AI assistant (request flow)

```mermaid
flowchart TD
    Msg[Patient message] --> Post[POST /chat]
    Post --> Cfg{Gemini configured?}
    Cfg -->|Yes| Call[Call Gemini with medical system prompt]
    Call --> OK{Responded in time?}
    OK -->|Yes| Reply[Evidence-based answer + 'confirm with a professional']
    OK -->|Timeout / error| Fallback
    Cfg -->|No| Fallback[Safe offline reply: consult your doctor/pharmacist]
    Reply --> Save[Saved to chat history]
    Fallback --> Save
```

*The app applies its own request timeout and shows a clear message rather than hanging,
so a slow model never looks like a broken feature.*

---

## 9. System architecture

```mermaid
flowchart TB
    subgraph Clients
      Web[React web app]
      Mob[Flutter mobile app]
    end

    subgraph Server[VPS - systemd service]
      API[Spring Boot REST API - JWT]
      Sig[WebSocket signaling relay]
      Turn[coturn TURN server]
    end

    DBx[(Supabase PostgreSQL)]
    AIx[Google Gemini API]

    Web -->|HTTPS/JSON + JWT| API
    Mob -->|HTTP/JSON + JWT| API
    API --> DBx
    API -->|AI explanations & chat| AIx
    Mob -. WebRTC signaling .-> Sig
    Web -. WebRTC signaling .-> Sig
    Mob === Turn
    Web === Turn
    Mob <-. peer-to-peer media .-> Web
```

---

## 10. At a glance

- **Users:** Patient · Verified Doctor · Admin — one JWT identity, three experiences.
- **Safety:** 1,922-drug interaction checker with AI-explained, severity-graded results.
- **Guidance:** Gemini medical assistant with safety guardrails and offline fallback.
- **Care:** book → doctor accepts → join a real WebRTC video/audio call at the scheduled time.
- **Trust:** admin-verified doctors; only verified doctors are bookable.
- **Reach:** React web + Flutter mobile on a shared, production-deployed backend.

*The result is a single app that carries a person from a medication question all the way to
a live consultation with a verified doctor — safely, and without ever exposing their call
media to the server.*
