# Visual Map - IntelliMeds Project

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT APPLICATIONS                            │
│                        (Mobile / Web / Third-party)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SPRING BOOT APPLICATION                           │
│                              (Port 8080)                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Security  │  │   Actuator  │  │  WebMVC     │  │  Validation │        │
│  │   Filter    │  │   Health    │  │  REST       │  │  Bean       │        │
│  │   Chain     │  │   Check     │  │  Controllers│  │  Validation │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────────────────────┤
│                        CONTROLLER LAYER (16 controllers)                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  Auth    │ │ Profile  │ │  Drug    │ │  Interac │ │   AI     │         │
│  │Controller│ │Controller│ │Controller│ │Controller│ │Controller│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │ Chatbot  │ │Reminder  │ │Medication│ │ Doctor   │ │Appointment│         │
│  │Controller│ │Controller│ │History   │ │Controller│ │Controller│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │Education │ │Notif.    │ │ Admin    │ │ Admin    │ │Download/ │         │
│  │Controller│ │Controller│ │Controller│ │DrugCtrl  │ │Share     │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐                                                           │
│  │ Search   │                                                           │
│  │Controller│                                                           │
│  └──────────┘                                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                         SERVICE LAYER (16 services)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                        REPOSITORY LAYER (16 repositories)                    │
│                    Spring Data JPA Repositories                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DATABASE (PostgreSQL 17.6)                           │
│                           Supabase Cloud                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Package Structure (com.intellimeds)

```
com.intellimeds/
│
├── IntelliMedsApplication.java            # Main entry point
│
├── 📁 auth/                               # Module 1: Authentication
│   ├── AuthController.java                # /api/auth/*
│   ├── AuthService.java                   # JWT + registration
│   ├── dto/
│   │   ├── AuthRequest.java
│   │   ├── AuthResponse.java
│   │   └── RefreshTokenRequest.java
│   └── model/
│       └── RefreshToken.java
│
├── 📁 user/                               # Module 2: Profile
│   ├── ProfileController.java             # /api/users/profile
│   └── ProfileService.java
│
├── 📁 drug/                               # Modules 3, 18, 19: Drug + Search + Download
│   ├── DrugController.java                # /api/drugs
│   ├── SearchController.java              # /api/search/suggestions
│   ├── DownloadShareController.java       # /api/download/*
│   ├── DrugService.java
│   └── dto/
│       ├── DrugRequest.java
│       └── DrugResponse.java
│
├── 📁 interaction/                        # Module 4: Drug Interactions
│   ├── InteractionController.java         # /api/interactions/*
│   └── InteractionService.java
│
├── 📁 ai/                                 # Modules 5, 6, 8: AI
│   ├── AiController.java                  # /api/ai/*
│   ├── AiService.java
│   ├── AiProviderService.java
│   ├── AiHistoryService.java
│   ├── dto/
│   │   ├── AiExplainRequest.java
│   │   ├── AiExplainResponse.java
│   │   ├── AiProviderResponse.java
│   │   └── AiHistoryResponse.java
│   └── model/
│       ├── AiProvider.java
│       └── AiHistory.java
│
├── 📁 chatbot/                            # Module 7: AI Chatbot
│   ├── ChatbotController.java             # /api/chat
│   └── ChatbotService.java
│
├── 📁 reminder/                           # Module 9: Medication Reminders
│   ├── ReminderController.java            # /api/reminders
│   └── ReminderService.java
│
├── 📁 medication/                         # Module 10: Medication History
│   ├── MedicationHistoryController.java   # /api/medications/history
│   └── MedicationHistoryService.java
│
├── 📁 doctor/                             # Module 11: Doctor
│   ├── DoctorController.java              # /api/doctors
│   └── DoctorService.java
│
├── 📁 appointment/                        # Module 12: Appointment
│   ├── AppointmentController.java         # /api/appointments
│   └── AppointmentService.java
│
├── 📁 education/                          # Module 13: Patient Education
│   ├── EducationController.java           # /api/education
│   └── EducationService.java
│
├── 📁 notification/                       # Module 14: Notifications
│   ├── NotificationController.java        # /api/notifications
│   └── NotificationService.java
│
├── 📁 admin/                              # Modules 15, 16, 17: Admin
│   ├── AdminController.java               # /api/admin/users/*
│   ├── AdminDrugController.java           # /api/admin/drugs/*
│   ├── AdminService.java
│   └── dto/
│       ├── AdminUserResponse.java
│       └── DashboardStatsResponse.java
│
├── 📁 config/                             # Configuration
│   ├── SecurityConfig.java                # JWT security chain
│   ├── DataInitializer.java               # Seeds roles + AI providers
│   └── WebConfig.java                     # CORS config
│
├── 📁 security/                           # Security components
│   ├── JwtUtil.java                       # JWT token gen/validate
│   ├── JwtAuthenticationFilter.java       # OncePerRequestFilter
│   └── CustomUserDetailsService.java      # Loads User by email
│
├── 📁 exception/                          # Exception handling
│   ├── GlobalExceptionHandler.java        # @RestControllerAdvice
│   └── ErrorResponse.java                 # Error DTO
│
├── 📁 dto/                                # Common DTOs
│   └── ApiResponse.java                   # { success, message, data }
│
├── 📁 model/                              # Core entities
│   ├── User.java
│   ├── Profile.java
│   ├── Role.java
│   ├── Drug.java
│   ├── AlternativeMedicine.java
│   ├── DrugInteraction.java
│   ├── InteractionHistory.java
│   ├── MedicationReminder.java
│   ├── MedicationHistory.java
│   ├── Doctor.java
│   ├── Appointment.java
│   ├── EducationContent.java
│   └── Notification.java
│
└── 📁 repository/                         # Data access
    ├── UserRepository.java
    ├── RoleRepository.java
    ├── ProfileRepository.java
    ├── DrugRepository.java
    ├── AlternativeMedicineRepository.java
    ├── DrugInteractionRepository.java
    ├── InteractionHistoryRepository.java
    ├── AiProviderRepository.java
    ├── AiHistoryRepository.java
    ├── ChatHistoryRepository.java
    ├── MedicationReminderRepository.java
    ├── MedicationHistoryRepository.java
    ├── DoctorRepository.java
    ├── AppointmentRepository.java
    ├── EducationContentRepository.java
    └── NotificationRepository.java
```

## API Endpoint Map

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─── HEALTH ───────────────────────────────────────────────────────────┐  │
│  │  GET /actuator/health                                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── AUTH ─────────────────────────────────────────────────────────────┐  │
│  │  POST   /api/auth/register              Register new user            │  │
│  │  POST   /api/auth/login                 Login, get tokens            │  │
│  │  POST   /api/auth/refresh-token         Refresh access token         │  │
│  │  GET    /api/auth/me                    Get current user             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── PROFILE ──────────────────────────────────────────────────────────┐  │
│  │  GET    /api/users/profile               Get own profile             │  │
│  │  PUT    /api/users/profile               Update profile (full)       │  │
│  │  PATCH  /api/users/profile               Partial update profile      │  │
│  │  DELETE /api/users/profile               Delete profile              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DRUGS ────────────────────────────────────────────────────────────┐  │
│  │  GET    /api/drugs                       List all drugs              │  │
│  │  GET    /api/drugs/{id}                  Get drug by ID              │  │
│  │  GET    /api/drugs/search?keyword=       Search drugs                │  │
│  │  GET    /api/drugs/suggestions?keyword=  Autocomplete suggestions    │  │
│  │  GET    /api/drugs/{id}/alternatives     Get alternatives            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DRUG INTERACTIONS ────────────────────────────────────────────────┐  │
│  │  POST   /api/interactions/check          Check drug interactions     │  │
│  │  GET    /api/interactions/history        Get check history           │  │
│  │  GET    /api/interactions/{id}           Get interaction by ID       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── AI ───────────────────────────────────────────────────────────────┐  │
│  │  POST   /api/ai/explain                  Get AI explanation          │  │
│  │  GET    /api/ai/providers                List AI providers           │  │
│  │  PUT    /api/ai/provider                 Switch active provider      │  │
│  │  GET    /api/ai/history                  Get AI history              │  │
│  │  DELETE /api/ai/history/{id}             Delete AI history entry     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── CHATBOT ──────────────────────────────────────────────────────────┐  │
│  │  POST   /api/chat                        Send message                │  │
│  │  GET    /api/chat/history                Get chat history            │  │
│  │  DELETE /api/chat/history                Clear chat history          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── MEDICATION REMINDERS ─────────────────────────────────────────────┐  │
│  │  POST   /api/reminders                   Create reminder             │  │
│  │  GET    /api/reminders                   List reminders              │  │
│  │  GET    /api/reminders/{id}              Get reminder by ID          │  │
│  │  PUT    /api/reminders/{id}              Update reminder             │  │
│  │  DELETE /api/reminders/{id}              Delete reminder             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── MEDICATION HISTORY ───────────────────────────────────────────────┐  │
│  │  GET    /api/medications/history         Get medication history      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DOCTORS ──────────────────────────────────────────────────────────┐  │
│  │  GET    /api/doctors                     List all doctors            │  │
│  │  GET    /api/doctors/{id}                Get doctor by ID            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── APPOINTMENTS ─────────────────────────────────────────────────────┐  │
│  │  POST   /api/appointments                Create appointment          │  │
│  │  GET    /api/appointments                List appointments           │  │
│  │  GET    /api/appointments/{id}           Get appointment by ID       │  │
│  │  PUT    /api/appointments/{id}           Update appointment          │  │
│  │  DELETE /api/appointments/{id}           Cancel appointment          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── EDUCATION ────────────────────────────────────────────────────────┐  │
│  │  POST   /api/education                   Create content              │  │
│  │  GET    /api/education                   List content                │  │
│  │  GET    /api/education/{id}              Get content by ID           │  │
│  │  PUT    /api/education/{id}              Update content              │  │
│  │  DELETE /api/education/{id}              Delete content              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── NOTIFICATIONS ────────────────────────────────────────────────────┐  │
│  │  GET    /api/notifications               List notifications          │  │
│  │  PUT    /api/notifications/{id}/read     Mark as read                │  │
│  │  DELETE /api/notifications/{id}          Delete notification         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── SEARCH SUGGESTIONS ───────────────────────────────────────────────┐  │
│  │  GET    /api/search/suggestions?keyword= Get suggestions             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DOWNLOAD & SHARE ─────────────────────────────────────────────────┐  │
│  │  GET    /api/download/drug/{id}          Download drug info          │  │
│  │  POST   /api/download/drug/{id}/share    Generate share link         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── ADMIN: USER MANAGEMENT ───────────────────────────────────────────┐  │
│  │  GET    /api/admin/users                 List all users              │  │
│  │  GET    /api/admin/users/{id}            Get user by ID              │  │
│  │  PUT    /api/admin/users/{id}            Update user                 │  │
│  │  PATCH  /api/admin/users/{id}/status     Toggle active/locked        │  │
│  │  DELETE /api/admin/users/{id}            Delete user                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── ADMIN: DRUG MANAGEMENT ───────────────────────────────────────────┐  │
│  │  POST   /api/admin/drugs                 Create drug                 │  │
│  │  GET    /api/admin/drugs                 List all drugs (admin)      │  │
│  │  GET    /api/admin/drugs/{id}            Get drug by ID (admin)      │  │
│  │  PUT    /api/admin/drugs/{id}            Update drug                 │  │
│  │  DELETE /api/admin/drugs/{id}            Delete drug                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── ADMIN: REPORTS ───────────────────────────────────────────────────┐  │
│  │  GET    /api/admin/reports/dashboard     Dashboard stats             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Client Request (JSON + JWT Bearer Token)
         │
         ▼
┌─────────────────┐
│   CORS Filter   │  ──► WebConfig (allow all origins)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Spring        │
│   Security      │  ──► SecurityFilterChain
│   Filter Chain  │      CSRF disabled, STATELESS session
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  JwtAuth Filter │  ──► JwtAuthenticationFilter
│  (OncePerReq)   │      Extracts token from Authorization header
└────────┬────────┘      Validates with JwtUtil
         │               Sets SecurityContext
         ▼
┌─────────────────┐
│   Dispatcher    │
│   Servlet       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │  ──► @RestController
│   Handler       │      @RequestMapping
└────────┬────────┘      @GetMapping / @PostMapping / etc.
         │
         ▼
┌─────────────────┐
│   Request Body  │  ──► @RequestBody (JSON to Object)
│   Validation    │      @Valid (Bean Validation)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Service       │  ──► Business logic
│   Layer         │      @Transactional
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Repository    │  ──► Spring Data JPA
│   (DAO)         │      JpaRepository methods
└────────┬────────┘      Custom query methods
         │
         ▼
┌─────────────────┐
│   Database      │  ──► PostgreSQL (Supabase)
│   (JDBC)        │      HikariCP Connection Pool
└─────────────────┘
         │
         ▼
┌─────────────────┐
│   Response      │  ──► ApiResponse<T> wrapper
│   Serialization │      ResponseEntity
└────────┬────────┘      Jackson JSON
         │
         ▼
    Client Response (JSON)
```

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│      Role       │         │      User       │
├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │◄────┐   │ id (UUID) PK    │
│ name (enum)     │     │   │ name            │
│                 │     │   │ email (unique)  │
└─────────────────┘     │   │ password        │
                        │   │ isActive        │
┌─────────────────┐     │   │ isLocked        │
│   UserRole      │     │   │ createdAt       │
├─────────────────┤     │   └────────┬────────┘
│ id (UUID) PK    │     │            │
│ user_id FK ─────│─────┘            │ 1:1
│ role_id FK ─────│──────┐           │
└─────────────────┘      │           ▼
                         │   ┌─────────────────┐
                         │   │     Profile     │
                         │   ├─────────────────┤
                         │   │ id (UUID) PK    │
                         │   │ user_id FK      │
                         │   │ fullName        │
                         │   │ dateOfBirth     │
                         │   │ gender          │
                         │   │ phone           │
                         │   │ address         │
                         │   │ profileImage    │
                         │   │ weight, height  │
                         │   │ bloodGroup      │
                         │   │ allergies       │
                         │   │ chronicDiseases │
                         │   │ emergencyContact│
                         │   │ specialization  │
                         │   │ licenseNumber   │
                         │   │ hospital        │
                         │   │ verified        │
                         │   └─────────────────┘
                         │
                         │
┌─────────────────┐      │   ┌─────────────────┐
│ RefreshToken    │      │   │      Drug       │
├─────────────────┤      │   ├─────────────────┤
│ id (UUID) PK    │      │   │ id (UUID) PK    │
│ user_id FK ─────│──────┘   │ genericName     │
│ token (unique)  │          │ brandName       │
│ expiresAt       │          │ manufacturer    │
│ createdAt       │          │ description     │
└─────────────────┘          │ uses            │
                             │ dosageForm      │
                             │ strength        │
                             │ route           │
                             │ dosage          │
                             │ sideEffects     │
                             │ contraindications│
                             │ pregnancyCategory│
                             │ storage         │
                             │ image           │
                             │ isActive        │
                             └────────┬────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                   │
                    ▼                 ▼                   ▼
        ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
        │AlternativeMed.  │ │DrugInteraction  │ │InteractionHist. │
        ├─────────────────┤ ├─────────────────┤ ├─────────────────┤
        │ id (UUID) PK    │ │ id (UUID) PK    │ │ id (UUID) PK    │
        │ drug_id FK      │ │ drugA_id FK     │ │ user_id FK      │
        │ altDrugName     │ │ drugB_id FK     │ │ drugA_id FK     │
        │ altGenericName  │ │ severity        │ │ drugB_id FK     │
        │ reason          │ │ description     │ │ drugsChecked    │
        └─────────────────┘ └─────────────────┘ │ interactionResult│
                                                │ checkedAt       │
                                                └─────────────────┘

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│      Doctor     │   │  Appointment    │   │MedicationReminder│
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ id (UUID) PK    │   │ id (UUID) PK    │   │ id (UUID) PK    │
│ user_id FK      │   │ patientId FK    │   │ userId FK       │
│ specialization  │   │ doctorId FK     │   │ drugName        │
│ licenseNumber   │   │ doctorName      │   │ dosage          │
│ hospital        │   │ appointmentTime │   │ frequency       │
│ verified        │   │ reason          │   │ reminderTime    │
│ experience      │   │ status (enum)   │   │ notificationEnabled│
│ consultationFee │   │ notes           │   │ isActive        │
│ bio             │   │ createdAt       │   │ createdAt       │
└─────────────────┘   └─────────────────┘   └─────────────────┘

┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│MedicationHistory│   │EducationContent │   │  Notification   │
├─────────────────┤   ├─────────────────┤   ├─────────────────┤
│ id (UUID) PK    │   │ id (UUID) PK    │   │ id (UUID) PK    │
│ userId FK       │   │ title           │   │ userId FK       │
│ drugName        │   │ description     │   │ title           │
│ dosage          │   │ contentType     │   │ message         │
│ status (enum)   │   │ contentUrl      │   │ isRead          │
│ scheduledDate   │   │ contentText     │   │ createdAt       │
│ takenAt         │   │ author          │   └─────────────────┘
│ notes           │   │ category        │
│ createdAt       │   │ createdAt       │
└─────────────────┘   └─────────────────┘

┌─────────────────┐   ┌─────────────────┐
│   AiProvider    │   │    AiHistory    │
├─────────────────┤   ├─────────────────┤
│ id (UUID) PK    │   │ id (UUID) PK    │
│ name            │   │ userId FK       │
│ providerType    │   │ prompt          │
│ isActive        │   │ response        │
│ isSelected      │   │ provider        │
└─────────────────┘   │ requestType     │
                      │ createdAt       │
┌─────────────────┐   └─────────────────┘
│  ChatHistory    │
├─────────────────┤
│ id (UUID) PK    │
│ userId FK       │
│ messageRole     │
│ messageContent  │
│ sessionId       │
│ createdAt       │
└─────────────────┘
```

## Security Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY CONFIGURATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Request                                                                    │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CSRF Protection          → DISABLED (Stateless REST API)           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Session Management       → STATELESS (No server-side sessions)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CORS                     → Allow all origins (development)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Password Encoding        → BCrypt                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  JWT Filter               → JwtAuthenticationFilter                 │   │
│  │                           → Extracts Bearer token                   │   │
│  │                           → Validates with JwtUtil                  │   │
│  │                           → Sets Authentication in SecurityContext   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Authorization Rules:                                                │   │
│  │                                                                      │   │
│  │  PUBLIC:                                                             │   │
│  │    • /actuator/health                                                │   │
│  │    • /api/auth/register, /api/auth/login, /api/auth/refresh-token   │   │
│  │    • OPTIONS /** (CORS preflight)                                    │   │
│  │                                                                      │   │
│  │  ROLE_ADMIN:                                                         │   │
│  │    • /api/admin/**                                                   │   │
│  │                                                                      │   │
│  │  AUTHENTICATED (any role):                                           │   │
│  │    • All other /api/** endpoints                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## JWT Token Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JWT TOKEN FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Register/Login                                                             │
│       │                                                                     │
│       ▼                                                                     │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                     │
│  │  AuthReq    │───►│ AuthService │───►│  AuthResp   │                     │
│  │  (email,    │    │             │    │  accessToken│                     │
│  │   password) │    │ BCrypt check│    │  refreshToken│                    │
│  └─────────────┘    └─────────────┘    │  tokenType  │                     │
│                                        │  email, name│                     │
│                                        │  role       │                     │
│                                        └─────────────┘                     │
│                                                                             │
│  Access Token Payload:                                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  {                                                                  │   │
│  │    "type": "access",                                                │   │
│  │    "sub": "user@email.com",                                         │   │
│  │    "iat": 1784809177,                                               │   │
│  │    "exp": 1784895577                                                │   │
│  │  }                                                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  Refresh Token: UUID stored in refresh_tokens table                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  APPLICATION FRAMEWORK                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ Spring Boot │  │ Spring MVC  │  │   Lombok    │                 │   │
│  │  │    4.1.0    │  │    WebMVC   │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  SECURITY & AUTH                                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Spring    │  │ JWT (jjwt)  │  │   BCrypt    │                 │   │
│  │  │   Security  │  │   0.12.6    │  │  (password) │                 │   │
│  │  │    6.x      │  │             │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PERSISTENCE                                                        │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ Spring Data │  │  Hibernate  │  │   Flyway    │                 │   │
│  │  │     JPA     │  │    7.4.1    │  │ (disabled)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATABASE                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ PostgreSQL  │  │  Supabase   │  │  HikariCP   │                 │   │
│  │  │    17.6     │  │   (Cloud)   │  │    Pool     │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BUILD & RUNTIME                                                    │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Maven     │  │  Java 17    │  │  Actuator   │                 │   │
│  │  │  (mvnw)     │  │             │  │  (health)   │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Build & Run Commands

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BUILD & RUN COMMANDS                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Development                                                                │
│  ──────────────                                                             │
│  $ ./mvnw spring-boot:run          Start with devtools (hot reload)        │
│  $ ./mvnw compile                  Compile only                            │
│                                                                             │
│  Build JAR                                                                  │
│  ────────                                                                   │
│  $ ./mvnw clean package -DskipTests  Build JAR (skip tests)                │
│  $ java -jar target/springRestApi-0.0.1-SNAPSHOT.jar  Run JAR             │
│                                                                             │
│  Testing                                                                    │
│  ───────                                                                    │
│  $ ./mvnw test                     Run unit tests                          │
│  $ curl localhost:8080/actuator/health  Health check                        │
│                                                                             │
│  Database Reset (Supabase)                                                  │
│  ─────────────────────────                                                  │
│  $ psql -h aws-0-ap-northeast-1.pooler.supabase.com ...                    │
│    > DROP SCHEMA public CASCADE;                                            │
│    > CREATE SCHEMA public;                                                  │
│    > GRANT ALL ON SCHEMA public TO postgres;                                │
│    > GRANT ALL ON SCHEMA public TO public;                                  │
│                                                                             │
│  (Tables auto-created by Hibernate ddl-auto: update on startup)             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Count Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE COUNT                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Java Files (com.intellimeds):        107                                   │
│  Controllers:                          16                                   │
│  Services:                             16                                   │
│  Repositories:                         16                                   │
│  Models/Entities:                      14                                   │
│  DTOs:                                 ~20                                  │
│  Config/Security:                       6                                   │
│  Exception:                             2                                   │
│  Resources:                                                                   │
│    application.properties:              1                                   │
│    V1__init_schema.sql:                 1                                   │
│  Build:                                                                  │
│    pom.xml:                             1                                   │
│                                                                             │
│  Total: ~170 files                                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Module Status

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MODULE STATUS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Module                              Status    Tests                        │
│  ──────────────────────────────────  ────────  ──────────────────────────   │
│  1.  Authentication                  ✅ DONE   Register, Login, Refresh     │
│  2.  User/Profile                    ✅ DONE   CRUD + auto-create           │
│  3.  Drug                            ✅ DONE   CRUD + search                │
│  4.  Drug Interaction                ✅ DONE   Check + history              │
│  5.  AI Explanation                  ✅ DONE   Explain endpoint             │
│  6.  AI Provider                     ✅ DONE   4 providers seeded           │
│  7.  AI Chatbot                      ✅ DONE   Symptom responses            │
│  8.  AI History                      ✅ DONE   Auto-save                    │
│  9.  Medication Reminder             ✅ DONE   CRUD                         │
│  10. Medication History              ✅ DONE   GET history                  │
│  11. Doctor                          ✅ DONE   GET doctors                  │
│  12. Appointment                     ✅ DONE   CRUD                         │
│  13. Patient Education               ✅ DONE   CRUD                         │
│  14. Notification                    ✅ DONE   GET/PUT/DELETE               │
│  15. Admin Drug Mgmt                 ✅ DONE   CRUD (ADMIN only)            │
│  16. Admin User Mgmt                 ✅ DONE   CRUD + status toggle         │
│  17. Reports & Analytics             ✅ DONE   Dashboard stats              │
│  18. Search Suggestions              ✅ DONE   Autocomplete                 │
│  19. Download & Share                ✅ DONE   Drug info download           │
│  20. Notification (dedicated)        ✅ DONE   System notifications         │
│                                                                             │
│  All 20 modules: ✅ IMPLEMENTED AND VERIFIED                                │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
