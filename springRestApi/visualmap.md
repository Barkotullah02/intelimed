# Visual Map - Intelimed Project

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
│                           CONTROLLER LAYER (14)                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │   Drug   │ │  Doctor  │ │Consultat.│ │Prescript.│ │DrugCat.  │         │
│  │Controller│ │Controller│ │Controller│ │Controller│ │Controller│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │DrugInter.│ │Manufac.  │ │Patient   │ │Medication│ │Favorite  │         │
│  │Controller│ │Controller│ │Allergy   │ │Reminder  │ │Controller│         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                                   │
│  │Notif.    │ │Search    │ │AI Chat   │ │AI Recommend.                    │
│  │Controller│ │History   │ │Controller│ │Controller                       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                           REPOSITORY LAYER (23)                             │
│                    Spring Data JPA Repositories                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                           DATABASE (PostgreSQL)                             │
│                              Supabase Cloud                                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Package Structure

```
com.opu.springrestapi/
│
├── 📁 config/
│   └── SecurityConfig.java              # Security configuration
│
├── 📁 controller/                        # REST API endpoints
│   ├── AiChatHistoryController.java     # /api/ai/chat
│   ├── AiRecommendationController.java  # /api/ai/recommendations
│   ├── ConsultationController.java      # /api/consultations
│   ├── DoctorController.java           # /api/doctors
│   ├── DrugCategoryController.java     # /api/drug-categories
│   ├── DrugController.java             # /api/drugs
│   ├── DrugInteractionController.java  # /api/drug-interactions
│   ├── FavoriteController.java         # /api/favorites
│   ├── ManufacturerController.java     # /api/manufacturers
│   ├── MedicationReminderController.java # /api/reminders
│   ├── NotificationController.java     # /api/notifications
│   ├── PatientAllergyController.java   # /api/allergies
│   ├── PrescriptionController.java     # /api/prescriptions
│   └── SearchHistoryController.java    # /api/search-history
│
├── 📁 dto/                              # Data Transfer Objects
│   ├── ApiResponse.java                 # Standard API response wrapper
│   └── DrugResponse.java               # Drug response DTO
│
├── 📁 exception/                        # Exception handling
│   ├── GlobalExceptionHandler.java      # @RestControllerAdvice
│   └── ResourceNotFoundException.java   # Custom 404 exception
│
├── 📁 model/                            # JPA Entities (23)
│   ├── AiChatHistory.java              # AI chat conversations
│   ├── AiRecommendation.java           # AI recommendations
│   ├── AlternativeMedicine.java        # Alternative medicines
│   ├── ApiProvider.java                # External API configs
│   ├── AuditLog.java                   # System audit logs
│   ├── Consultation.java               # Patient-doctor meetings
│   ├── Doctor.java                     # Doctor profiles
│   ├── Drug.java                       # Drug catalog
│   ├── DrugAlias.java                  # Alternative drug names
│   ├── DrugCategory.java               # Drug classifications
│   ├── DrugCategoryMap.java            # Drug-category links
│   ├── DrugInteraction.java            # Drug-drug interactions
│   ├── Favorite.java                   # User favorites
│   ├── Manufacturer.java               # Drug manufacturers
│   ├── MedicationReminder.java         # Medication reminders
│   ├── Notification.java               # User notifications
│   ├── PatientAllergy.java             # Patient allergies
│   ├── Prescription.java               # Medical prescriptions
│   ├── PrescriptionDrug.java           # Drugs in prescriptions
│   ├── Profile.java                    # User profiles
│   ├── Role.java                       # User roles
│   ├── SearchHistory.java              # Search history
│   └── UserRole.java                   # User-role assignments
│
├── 📁 repository/                       # Data access (23)
│   ├── AiChatHistoryRepository.java
│   ├── AiRecommendationRepository.java
│   ├── AlternativeMedicineRepository.java
│   ├── ApiProviderRepository.java
│   ├── AuditLogRepository.java
│   ├── ConsultationRepository.java
│   ├── DoctorRepository.java
│   ├── DrugAliasRepository.java
│   ├── DrugCategoryMapRepository.java
│   ├── DrugCategoryRepository.java
│   ├── DrugInteractionRepository.java
│   ├── DrugRepository.java
│   ├── FavoriteRepository.java
│   ├── ManufacturerRepository.java
│   ├── MedicationReminderRepository.java
│   ├── NotificationRepository.java
│   ├── PatientAllergyRepository.java
│   ├── PrescriptionDrugRepository.java
│   ├── PrescriptionRepository.java
│   ├── ProfileRepository.java
│   ├── RoleRepository.java
│   ├── SearchHistoryRepository.java
│   └── UserRoleRepository.java
│
├── 📁 service/
│   └── 📁 impl/                         # (Empty - pending implementation)
│
└── SpringRestApiApplication.java        # Main entry point
```

## Entity Relationship Diagram

```
┌─────────────────┐         ┌─────────────────┐
│     Profile     │         │      Role       │
├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │         │ id (UUID) PK    │
│ full_name       │         │ role_name       │
│ age             │         └────────┬────────┘
│ gender          │                  │
│ created_at      │         ┌────────┴────────┐
└────────┬────────┘         │    UserRole     │
         │                  ├─────────────────┤
         │                  │ id (UUID) PK    │
         │                  │ user_id FK      │
         │                  │ role_id FK      │
         │                  └─────────────────┘
         │
         ├────────────────────────────────────────────────────────────┐
         │                            │                               │
         ▼                            ▼                               ▼
┌─────────────────┐         ┌─────────────────┐           ┌─────────────────┐
│     Doctor      │         │ Consultation    │           │   Prescription  │
├─────────────────┤         ├─────────────────┤           ├─────────────────┤
│ id (UUID) PK    │◄────────│ doctor_id FK    │           │ id (UUID) PK    │
│ user_id FK      │         │ patient_id FK   │◄──────────│ patient_id FK   │
│ specialization  │         │ appointment_time│           │ diagnosis       │
│ license_number  │         │ status          │           │ notes           │
│ hospital        │         │ notes           │           │ created_at      │
│ verified        │         │ created_at      │           └────────┬────────┘
│ created_at      │         └─────────────────┘                    │
└─────────────────┘                                                │
                                                                   ▼
┌─────────────────┐         ┌─────────────────┐           ┌─────────────────┐
│      Drug       │         │  DrugCategory   │           │PrescriptionDrug │
├─────────────────┤         ├─────────────────┤           ├─────────────────┤
│ id (UUID) PK    │         │ id (UUID) PK    │           │ id (UUID) PK    │
│ drug_name       │         │ category_name   │           │ prescription_id │
│ generic_name    │         └────────┬────────┘           │ drug_id FK      │
│ brand_name      │                  │                    │ dosage          │
│ description     │         ┌────────┴────────┐           │ frequency       │
│ drug_class      │         │DrugCategoryMap  │           │ duration        │
│ dosage_form     │         ├─────────────────┤           └─────────────────┘
│ strength        │         │ id (UUID) PK    │
│ route           │         │ drug_id FK      │
│ pregnancy_cat   │         │ category_id FK  │
│ contraindications│        └─────────────────┘
│ side_effects    │
│ warnings        │         ┌─────────────────┐
│ storage         │         │DrugInteraction  │
│ manufacturer_id │──┐      ├─────────────────┤
│ created_at      │  │      │ id (UUID) PK    │
└─────────────────┘  │      │ drug_a_id FK    │
         │           │      │ drug_b_id FK    │
         │           │      │ severity        │
         │           │      │ description     │
         │           │      │ created_at      │
         │           │      └─────────────────┘
         │           │
         │           ▼
         │  ┌─────────────────┐
         │  │  Manufacturer   │
         │  ├─────────────────┤
         └─►│ id (UUID) PK    │
            │ name            │
            │ country         │
            │ website         │
            └─────────────────┘

┌─────────────────┐         ┌─────────────────┐
│ PatientAllergy  │         │MedicationReminder│
├─────────────────┤         ├─────────────────┤
│ id (UUID) PK    │         │ id (UUID) PK    │
│ patient_id FK   │         │ patient_id FK   │
│ drug_id FK      │         │ drug_id FK      │
│ severity        │         │ dosage          │
│ reaction        │         │ frequency       │
│ created_at      │         │ reminder_time   │
└─────────────────┘         │ active          │
                            │ created_at      │
┌─────────────────┐         └─────────────────┘
│    Favorite     │
├─────────────────┤         ┌─────────────────┐
│ id (UUID) PK    │         │  Notification   │
│ user_id FK      │         ├─────────────────┤
│ item_type       │         │ id (UUID) PK    │
│ item_id         │         │ user_id FK      │
│ created_at      │         │ title           │
└─────────────────┘         │ message         │
                            │ read            │
┌─────────────────┐         │ created_at      │
│  SearchHistory  │         └─────────────────┘
├─────────────────┤
│ id (UUID) PK    │         ┌─────────────────┐
│ user_id FK      │         │ AiChatHistory   │
│ query           │         ├─────────────────┤
│ created_at      │         │ id (UUID) PK    │
└─────────────────┘         │ user_id FK      │
                            │ message_role    │
┌─────────────────┐         │ message_content │
│AiRecommendation │         │ created_at      │
├─────────────────┤         └─────────────────┘
│ id (UUID) PK    │
│ user_id FK      │
│ recommendation_ │
│   type          │
│ content         │
│ context_data    │
│ created_at      │
└─────────────────┘
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
│  ┌─── DRUGS ────────────────────────────────────────────────────────────┐  │
│  │  GET    /api/drugs                    List all drugs                 │  │
│  │  GET    /api/drugs/{id}               Get drug by ID                 │  │
│  │  GET    /api/drugs/search?q=          Search drugs                   │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DOCTORS ──────────────────────────────────────────────────────────┐  │
│  │  GET    /api/doctors                  List all doctors               │  │
│  │  GET    /api/doctors/{id}             Get doctor by ID               │  │
│  │  GET    /api/doctors/verified         Get verified doctors           │  │
│  │  GET    /api/doctors/search?spec=     Search by specialization       │  │
│  │  POST   /api/doctors                  Create doctor                  │  │
│  │  PUT    /api/doctors/{id}             Update doctor                  │  │
│  │  DELETE /api/doctors/{id}             Delete doctor                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── CONSULTATIONS ────────────────────────────────────────────────────┐  │
│  │  GET    /api/consultations            List all                       │  │
│  │  GET    /api/consultations/{id}       Get by ID                      │  │
│  │  GET    /api/consultations/patient/{id} Get by patient               │  │
│  │  GET    /api/consultations/doctor/{id}  Get by doctor                │  │
│  │  GET    /api/consultations/status/{s}   Get by status                │  │
│  │  POST   /api/consultations            Create                         │  │
│  │  PUT    /api/consultations/{id}       Update                         │  │
│  │  DELETE /api/consultations/{id}       Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── PRESCRIPTIONS ────────────────────────────────────────────────────┐  │
│  │  GET    /api/prescriptions            List all                       │  │
│  │  GET    /api/prescriptions/{id}       Get by ID                      │  │
│  │  GET    /api/prescriptions/patient/{id} Get by patient               │  │
│  │  GET    /api/prescriptions/{id}/drugs  Get prescription drugs        │  │
│  │  POST   /api/prescriptions            Create                         │  │
│  │  PUT    /api/prescriptions/{id}       Update                         │  │
│  │  DELETE /api/prescriptions/{id}       Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DRUG CATEGORIES ──────────────────────────────────────────────────┐  │
│  │  GET    /api/drug-categories          List all                       │  │
│  │  GET    /api/drug-categories/{id}     Get by ID                      │  │
│  │  POST   /api/drug-categories          Create                         │  │
│  │  PUT    /api/drug-categories/{id}     Update                         │  │
│  │  DELETE /api/drug-categories/{id}     Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── DRUG INTERACTIONS ────────────────────────────────────────────────┐  │
│  │  GET    /api/drug-interactions        List all                       │  │
│  │  GET    /api/drug-interactions/{id}   Get by ID                      │  │
│  │  GET    /api/drug-interactions/drug/{id} Get by drug                 │  │
│  │  POST   /api/drug-interactions        Create                         │  │
│  │  DELETE /api/drug-interactions/{id}   Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── MANUFACTURERS ────────────────────────────────────────────────────┐  │
│  │  GET    /api/manufacturers            List all                       │  │
│  │  GET    /api/manufacturers/{id}       Get by ID                      │  │
│  │  POST   /api/manufacturers            Create                         │  │
│  │  PUT    /api/manufacturers/{id}       Update                         │  │
│  │  DELETE /api/manufacturers/{id}       Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── PATIENT ALLERGIES ────────────────────────────────────────────────┐  │
│  │  GET    /api/allergies/patient/{id}   Get by patient                 │  │
│  │  POST   /api/allergies                Add allergy                    │  │
│  │  DELETE /api/allergies/{id}           Remove allergy                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── MEDICATION REMINDERS ─────────────────────────────────────────────┐  │
│  │  GET    /api/reminders/patient/{id}   Get by patient                 │  │
│  │  GET    /api/reminders/patient/{id}/active Get active reminders      │  │
│  │  POST   /api/reminders                Create                         │  │
│  │  PUT    /api/reminders/{id}           Update                         │  │
│  │  DELETE /api/reminders/{id}           Delete                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── FAVORITES ────────────────────────────────────────────────────────┐  │
│  │  GET    /api/favorites/user/{id}      Get user favorites             │  │
│  │  POST   /api/favorites                Add favorite                   │  │
│  │  DELETE /api/favorites/{id}           Remove favorite                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── NOTIFICATIONS ────────────────────────────────────────────────────┐  │
│  │  GET    /api/notifications/user/{id}  Get all notifications          │  │
│  │  GET    /api/notifications/user/{id}/unread Get unread               │  │
│  │  PUT    /api/notifications/{id}/read  Mark as read                   │  │
│  │  DELETE /api/notifications/{id}       Delete notification            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── SEARCH HISTORY ───────────────────────────────────────────────────┐  │
│  │  GET    /api/search-history/user/{id} Get user search history        │  │
│  │  POST   /api/search-history           Record search                  │  │
│  │  DELETE /api/search-history/{id}      Delete search record           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌─── AI FEATURES ──────────────────────────────────────────────────────┐  │
│  │  GET    /api/ai/chat/user/{id}        Get chat history               │  │
│  │  POST   /api/ai/chat                  Save chat message              │  │
│  │  GET    /api/ai/recommendations/user/{id} Get recommendations        │  │
│  │  POST   /api/ai/recommendations       Create recommendation          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           REQUEST FLOW                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Client Request
         │
         ▼
┌─────────────────┐
│   Spring        │
│   Security      │  ──► SecurityFilterChain (CSRF disabled, STATELESS)
│   Filter Chain  │
└────────┬────────┘
         │
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

## Response Format

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUCCESS RESPONSE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  {                                                                          │
│    "success": true,                                                         │
│    "message": "Drugs retrieved successfully",                               │
│    "data": [                                                                │
│      {                                                                      │
│        "id": "uuid",                                                        │
│        "drugName": "Aspirin",                                               │
│        "genericName": "Acetylsalicylic acid",                               │
│        ...                                                                  │
│      }                                                                      │
│    ]                                                                        │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                         ERROR RESPONSE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  {                                                                          │
│    "success": false,                                                        │
│    "message": "Drug not found with id: '123e4567-e89b-12d3-a456-426614174000'",│
│    "data": null                                                             │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TECHNOLOGY STACK                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PRESENTATION / CLIENT                                              │   │
│  │  • Mobile Apps (iOS/Android)                                        │   │
│  │  • Web Applications                                                 │   │
│  │  • Third-party Integrations                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  APPLICATION LAYER                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ Spring Boot │  │ Spring MVC  │  │   Lombok    │                 │   │
│  │  │    4.1.0    │  │    WebMVC   │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │   Spring    │  │  Validation │  │   Actuator  │                 │   │
│  │  │   Security  │  │             │  │             │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PERSISTENCE LAYER                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ Spring Data │  │  Hibernate  │  │   Flyway    │                 │   │
│  │  │     JPA     │  │    7.4.1    │  │ (disabled)  │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  DATABASE                                                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │   │
│  │  │ PostgreSQL  │  │  Supabase   │  │  HikariCP   │                 │   │
│  │  │    17.6     │  │   (Cloud)   │  │    Pool     │                 │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  BUILD TOOLS                                                       │   │
│  │  ┌─────────────┐  ┌─────────────┐                                  │   │
│  │  │   Maven     │  │  Java 17    │                                  │   │
│  │  │  (mvnw)     │  │             │                                  │   │
│  │  └─────────────┘  └─────────────┘                                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Security Configuration

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SECURITY CONFIGURATION                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Request                                                                    │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  CSRF Protection          → DISABLED (Stateless API)                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Session Management       → STATELESS (No server-side sessions)     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Password Encoding        → BCrypt                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│     │                                                                       │
│     ▼                                                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Authorization Rules:                                                │   │
│  │  • /actuator/health      → permitAll (Public)                       │   │
│  │  • OPTIONS /**           → permitAll (CORS)                         │   │
│  │  • Any other request     → permitAll (Development mode)             │   │
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
│  $ ./mvnw spring-boot:run          Start with hot reload                    │
│  $ ./mvnw compile                  Compile only                            │
│                                                                             │
│  Build                                                                      │
│  ─────                                                                      │
│  $ ./mvnw clean install            Clean build + tests                     │
│  $ ./mvnw clean package           Create JAR                              │
│                                                                             │
│  Testing                                                                    │
│  ───────                                                                    │
│  $ ./mvnw test                     Run unit tests                          │
│  $ curl localhost:8080/actuator/health  Health check                       │
│                                                                             │
│  Database                                                                   │
│  ────────                                                                   │
│  $ ./mvnw flyway:migrate           Run migrations (when enabled)          │
│  $ ./mvnw flyway:info              Show migration status                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File Count Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FILE COUNT SUMMARY                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Controllers       │  14 files  │  REST API endpoints                      │
│  Models            │  23 files  │  JPA entities                            │
│  Repositories      │  23 files  │  Data access layer                       │
│  DTOs              │   2 files  │  Data transfer objects                   │
│  Exceptions        │   2 files  │  Error handling                          │
│  Config            │   1 file   │  Security configuration                  │
│  Application       │   1 file   │  Main entry point                        │
│  ──────────────────────────────────────────────────────────────────────     │
│  TOTAL             │  66 Java files                                         │
│                                                                             │
│  Resources                                                                  │
│  ─────────                                                                  │
│  application.properties │   1 file   │  App configuration                  │
│  V1__init_schema.sql    │   1 file   │  Database migration                 │
│                                                                             │
│  Build                                                                      │
│  ─────                                                                      │
│  pom.xml            │   1 file   │  Maven configuration                    │
│  mvnw / mvnw.cmd    │   2 files  │  Maven wrapper                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```
