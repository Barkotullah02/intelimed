# IntelliMeds Project Specifications

## Overview

IntelliMeds is a comprehensive healthcare REST API built with Spring Boot, providing drug management, doctor consultations, AI-powered recommendations, medication reminders, and patient care features.

**Status:** ✅ All 20 modules implemented and verified working

## Architecture

- **Type:** Monolithic Spring Boot REST API
- **Package:** `com.intellimeds`
- **Port:** 8080
- **Architecture Pattern:** Module-based (auth/, drug/, ai/, etc.) with Controller → Service → Repository layers

## Technology Stack

| Technology       | Version   | Purpose                    |
| ---------------- | --------- | -------------------------- |
| Java             | 17        | Programming language       |
| Spring Boot      | 4.1.0     | Application framework      |
| Spring Security  | 6.x       | Security framework         |
| Spring Data JPA  | 7.4.1     | ORM / Database access      |
| Hibernate        | 7.4.1     | JPA implementation         |
| PostgreSQL       | 17.6      | Database                   |
| Flyway           | -         | Database migration (disabled, using ddl-auto) |
| JWT (jjwt)       | 0.12.6    | Token authentication       |
| Lombok           | -         | Code generation            |
| Maven (mvnw)     | -         | Build tool                 |
| Actuator         | -         | Health monitoring          |

## Database

| Property       | Value                                    |
| -------------- | ---------------------------------------- |
| Provider       | Supabase (hosted PostgreSQL)             |
| Version        | 17.6                                     |
| Host           | aws-0-ap-northeast-1.pooler.supabase.com |
| Driver         | PostgreSQL JDBC Driver                   |
| Connection Pool| HikariCP (max pool size: 10)             |
| Schema Mgmt    | Hibernate ddl-auto: update               |
| Migration      | Flyway (disabled)                        |

## Project Structure

```
src/main/java/com/intellimeds/
├── IntelliMedsApplication.java           # Main entry point
│
├── auth/                                 # Authentication module (1)
│   ├── AuthController.java               # POST /api/auth/*
│   ├── AuthService.java                  # JWT + registration logic
│   ├── dto/                              # AuthRequest, AuthResponse, RefreshTokenRequest
│   └── model/                            # RefreshToken entity
│
├── user/                                 # User/Profile module (2)
│   ├── ProfileController.java            # GET/PUT/PATCH/DELETE /api/users/profile
│   └── ProfileService.java
│
├── drug/                                 # Drug module (3)
│   ├── DrugController.java               # CRUD /api/drugs
│   ├── SearchController.java             # Search + suggestions
│   ├── DownloadShareController.java      # Download/share drug info
│   ├── DrugService.java
│   └── dto/
│
├── interaction/                          # Drug Interaction module (4)
│   ├── InteractionController.java        # POST /api/interactions/check, GET history
│   └── InteractionService.java
│
├── ai/                                   # AI modules (5, 6, 8)
│   ├── AiController.java                 # POST /api/ai/explain, GET/PUT providers, GET/DELETE history
│   ├── AiService.java
│   ├── AiProviderService.java
│   ├── AiHistoryService.java
│   ├── dto/                              # AiExplainRequest, AiHistoryResponse, etc.
│   └── model/                            # AiProvider, AiHistory entities
│
├── chatbot/                              # AI Chatbot module (7)
│   ├── ChatbotController.java            # POST /api/chat, GET/DELETE /api/chat/history
│   └── ChatbotService.java
│
├── reminder/                             # Medication Reminder module (9)
│   ├── ReminderController.java           # CRUD /api/reminders
│   └── ReminderService.java
│
├── medication/                           # Medication History module (10)
│   ├── MedicationHistoryController.java  # GET /api/medications/history
│   └── MedicationHistoryService.java
│
├── doctor/                               # Doctor module (11)
│   ├── DoctorController.java             # GET /api/doctors, GET /api/doctors/{id}
│   └── DoctorService.java
│
├── appointment/                          # Appointment module (12)
│   ├── AppointmentController.java        # CRUD /api/appointments
│   └── AppointmentService.java
│
├── education/                            # Patient Education module (13)
│   ├── EducationController.java          # CRUD /api/education
│   └── EducationService.java
│
├── notification/                         # Notification module (14)
│   ├── NotificationController.java       # GET/PUT/DELETE /api/notifications
│   └── NotificationService.java
│
├── admin/                                # Admin modules (15, 16, 17)
│   ├── AdminController.java              # GET /api/admin/users/*, PATCH status
│   ├── AdminDrugController.java          # CRUD /api/admin/drugs/*
│   ├── AdminService.java
│   └── dto/
│
├── config/                               # Configuration
│   ├── SecurityConfig.java               # Spring Security + JWT filter chain
│   ├── DataInitializer.java              # Seeds roles + AI providers on startup
│   └── WebConfig.java                    # CORS configuration
│
├── security/                             # Security components
│   ├── JwtUtil.java                      # JWT token generation/validation
│   ├── JwtAuthenticationFilter.java      # OncePerRequestFilter
│   └── CustomUserDetailsService.java     # UserDetailsService for Spring Security
│
├── exception/                            # Exception handling
│   ├── GlobalExceptionHandler.java       # @RestControllerAdvice
│   └── ErrorResponse.java                # Error response DTO
│
├── dto/                                  # Common DTOs
│   └── ApiResponse.java                  # Standard API response wrapper
│
├── model/                                # Core entities
│   ├── User.java                         # users table
│   ├── Profile.java                      # profiles table (1:1 with User)
│   ├── Role.java                         # roles table
│   ├── Drug.java                         # drugs table
│   ├── AlternativeMedicine.java          # alternative_medicines table
│   ├── DrugInteraction.java              # drug_interactions table
│   ├── InteractionHistory.java           # interaction_history table
│   ├── MedicationReminder.java           # medication_reminders table
│   ├── MedicationHistory.java            # medication_history table
│   ├── Doctor.java                       # doctors table
│   ├── Appointment.java                  # appointments table
│   ├── EducationContent.java             # education_contents table
│   └── Notification.java                 # notifications table
│
└── repository/                           # Data access
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

## Modules

### 1. Authentication Module
- JWT Authentication with Spring Security
- Register Patient / Healthcare Professional / Admin
- Login with email/password
- Password Encryption (BCrypt)
- JWT Access + Refresh Token generation and validation
- Role-based Authorization
- Get current user info

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns tokens |
| POST | `/api/auth/refresh-token` | Public | Refresh access token |
| GET | `/api/auth/me` | JWT | Get current user |

### 2. User/Profile Module
- Users can manage their own profile
- Profile auto-created on registration
- Personal information management
- Medical information (allergies, chronic diseases)
- Emergency contact information
- Doctor specialization fields

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/profile` | JWT | Get profile |
| PUT | `/api/users/profile` | JWT | Update profile (full replace) |
| PATCH | `/api/users/profile` | JWT | Partial update profile |
| DELETE | `/api/users/profile` | JWT | Delete profile |

**Profile Fields:**
- fullName, dateOfBirth, gender, phone, address, profileImage
- weight, height, bloodGroup
- allergies, chronicDiseases
- emergencyContactName, emergencyContactPhone
- specialization, licenseNumber, hospital (for doctors)
- verified

### 3. Drug Module
- Search drugs by keyword
- View drug information
- Drug suggestions/autocomplete
- Drug alternatives

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/drugs` | JWT | List all drugs |
| GET | `/api/drugs/{id}` | JWT | Get drug by ID |
| GET | `/api/drugs/search?keyword=` | JWT | Search drugs |
| GET | `/api/drugs/suggestions?keyword=` | JWT | Autocomplete suggestions |
| GET | `/api/drugs/{id}/alternatives` | JWT | Get alternative medicines |

**Drug Fields:**
- genericName, brandName, manufacturer, description, uses
- dosageForm, strength, route, dosage
- sideEffects, contraindications, warnings
- pregnancyCategory, storage, image, isActive

### 4. Drug Interaction Module
- Check interaction between multiple drugs
- Severity levels: Major, Moderate, Minor
- Interaction history tracking

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/interactions/check` | JWT | Check drug interactions |
| GET | `/api/interactions/history` | JWT | Get interaction check history |
| GET | `/api/interactions/{id}` | JWT | Get interaction by ID |

### 5. AI Explanation Module
- AI-generated explanations for drug interactions
- Simple language output
- Recommendations and warnings

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/explain` | JWT | Get AI explanation |

### 6. AI Provider Module
- Multiple AI provider support
- Dynamic provider switching
- Providers seeded on startup: Offline, Gemini, OpenAI, Ollama

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/providers` | JWT | List all providers |
| PUT | `/api/ai/provider` | JWT | Switch active provider |

### 7. AI Chatbot Module
- Medical symptom chatbot
- AI-powered responses (currently hardcoded symptom responses)
- Conversation history persistence

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/chat` | JWT | Send message, get response |
| GET | `/api/chat/history` | JWT | Get chat history |
| DELETE | `/api/chat/history` | JWT | Clear chat history |

### 8. AI History Module
- Automatic response saving
- Provider tracking

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/ai/history` | JWT | Get AI request history |
| DELETE | `/api/ai/history/{id}` | JWT | Delete history entry |

### 9. Medication Reminder Module
- Create medicine reminders
- Time-based reminders
- Frequency settings (ONCE, DAILY, WEEKLY, MONTHLY)
- Notification enable/disable

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reminders` | JWT | Create reminder |
| GET | `/api/reminders` | JWT | List user's reminders |
| GET | `/api/reminders/{id}` | JWT | Get reminder by ID |
| PUT | `/api/reminders/{id}` | JWT | Update reminder |
| DELETE | `/api/reminders/{id}` | JWT | Delete reminder |

### 10. Medication History Module
- Track medication intake
- Status: COMPLETED, MISSED, SKIPPED

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/medications/history` | JWT | Get medication history |

### 11. Doctor Module
- Doctor profiles with verification
- Search by specialization

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/doctors` | JWT | List all doctors |
| GET | `/api/doctors/{id}` | JWT | Get doctor by ID |

### 12. Appointment Module
- Book doctor consultations
- Appointment status management (PENDING, CONFIRMED, COMPLETED, CANCELLED)

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/appointments` | JWT | Create appointment |
| GET | `/api/appointments` | JWT | List user's appointments |
| GET | `/api/appointments/{id}` | JWT | Get appointment by ID |
| PUT | `/api/appointments/{id}` | JWT | Update appointment |
| DELETE | `/api/appointments/{id}` | JWT | Cancel appointment |

### 13. Patient Education Module
- PDFs, Articles, Videos
- Content types: ARTICLE, VIDEO, PDF, INFOGRAPHIC

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/education` | JWT | Create education content |
| GET | `/api/education` | JWT | List all content |
| GET | `/api/education/{id}` | JWT | Get content by ID |
| PUT | `/api/education/{id}` | JWT | Update content |
| DELETE | `/api/education/{id}` | JWT | Delete content |

### 14. Notification Module
- User notifications
- Mark as read / delete

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | JWT | List notifications |
| PUT | `/api/notifications/{id}/read` | JWT | Mark as read |
| DELETE | `/api/notifications/{id}` | JWT | Delete notification |

### 15. Admin Drug Management
- Full CRUD for drugs (admin only)

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/admin/drugs` | ADMIN | Create drug |
| GET | `/api/admin/drugs` | ADMIN | List all drugs |
| GET | `/api/admin/drugs/{id}` | ADMIN | Get drug by ID |
| PUT | `/api/admin/drugs/{id}` | ADMIN | Update drug |
| DELETE | `/api/admin/drugs/{id}` | ADMIN | Delete drug |

### 16. Admin User Management
- View all users, update status, lock/unlock accounts

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | ADMIN | List all users |
| GET | `/api/admin/users/{id}` | ADMIN | Get user by ID |
| PUT | `/api/admin/users/{id}` | ADMIN | Update user |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | Toggle active/locked |
| DELETE | `/api/admin/users/{id}` | ADMIN | Delete user |

### 17. Reports & Analytics Module
- Dashboard with system statistics

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/reports/dashboard` | ADMIN | Dashboard stats |

**Dashboard Stats:**
- totalUsers, activeUsers, totalDrugs, totalInteractions
- totalAppointments, totalAiRequests
- dailyRequests, monthlyRequests

### 18. Search Suggestions Module
- Autocomplete suggestions from drug names

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/search/suggestions?keyword=` | JWT | Search suggestions |

### 19. Download & Share Module
- Download drug information as text
- Generate shareable links

**APIs:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/download/drug/{id}` | JWT | Download drug info |
| POST | `/api/download/drug/{id}/share` | JWT | Generate share link |

### 20. Notification Module (dedicated)
- Separate from user notifications
- System-level notifications

## Security

- **JWT Filter:** JwtAuthenticationFilter (OncePerRequestFilter)
- **Password Encoding:** BCryptPasswordEncoder
- **Session Management:** STATELESS
- **CSRF:** Disabled (REST API)
- **CORS:** Enabled for all origins (development mode)
- **Roles:** ROLE_PATIENT, ROLE_HEALTHCARE_PROFESSIONAL, ROLE_ADMIN

### Authorization Rules
| Endpoint | Access |
|----------|--------|
| `/actuator/**` | Public |
| `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh-token` | Public |
| `OPTIONS /**` | Public (CORS) |
| `/api/admin/**` | ROLE_ADMIN |
| All other endpoints | Authenticated (JWT) |

## Database Tables

| Table | Description |
|-------|-------------|
| users | User accounts |
| roles | Role definitions (PATIENT, HEALTHCARE_PROFESSIONAL, ADMIN) |
| user_roles | User-role assignments |
| refresh_tokens | JWT refresh tokens |
| profiles | User profiles (1:1 with users) |
| drugs | Drug catalog |
| alternative_medicines | Alternative medicine suggestions |
| drug_interactions | Drug-drug interaction data |
| interaction_history | User interaction check history |
| ai_providers | AI provider configurations |
| ai_history | AI request/response history |
| chat_history | Chatbot conversation history |
| medication_reminders | User medication reminders |
| medication_history | Medication intake tracking |
| doctors | Doctor profiles |
| appointments | Doctor appointments |
| education_contents | Patient education materials |
| notifications | User notifications |

## API Response Format

```json
// Success
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description",
  "data": null
}
```

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Patient | patient@test.com | password123 |
| Doctor | doctor@test.com | password123 |
| Admin | admin@test.com | password123 |

## Build & Run

| Command | Description |
|---------|-------------|
| `./mvnw spring-boot:run` | Start with devtools |
| `java -jar target/springRestApi-0.0.1-SNAPSHOT.jar` | Run JAR |
| `./mvnw clean package -DskipTests` | Build JAR |
| `./mvnw compile` | Compile only |
| `curl localhost:8080/actuator/health` | Health check |
