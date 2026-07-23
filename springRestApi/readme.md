# IntelliMeds - Spring REST API

A comprehensive healthcare REST API built with Spring Boot, featuring JWT authentication, drug management, doctor consultations, AI-powered recommendations, and more.

## Tech Stack

- **Language:** Java 17
- **Framework:** Spring Boot 4.1.0
- **ORM:** Spring Data JPA + Hibernate 7.4.1
- **Database:** PostgreSQL 17.6 (Supabase)
- **Migration:** Flyway
- **Security:** Spring Security 6 + JWT (jjwt 0.12.6)
- **Code Generation:** Lombok
- **Build:** Maven

## Features

- **JWT Authentication** - Secure login, registration, refresh tokens
- **Role-Based Access Control** - Patient, Healthcare Professional, Admin
- **Drug Management** - Complete drug catalog with search, categories, interactions, alternatives
- **Doctor Consultations** - Doctor profiles, verification, appointment booking
- **AI Integration** - Chat history, AI explanations, multiple AI providers (Gemini, OpenAI, Ollama, Offline)
- **Medication Reminders** - Create, manage, and track medication schedules
- **Patient Features** - Allergies, chronic diseases, emergency contacts
- **Education Content** - PDFs, articles, videos for patient education
- **Notifications** - Real-time notifications with read/unread status
- **Admin Dashboard** - User management, reports, analytics

## Quick Start

### Prerequisites

- Java 17+
- Maven (or use `./mvnw` wrapper)
- PostgreSQL database (or Supabase account)

### Setup

1. Clone the repository

```bash
git clone <repository-url>
cd intelimed/springRestApi
```

2. Configure database in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://<host>:5432/postgres
spring.datasource.username=<username>
spring.datasource.password=<password>
```

3. Run the application:

```bash
./mvnw spring-boot:run
```

4. Verify the application is running:

```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

## Project Structure

```
src/main/java/com/intellimeds/
├── IntelliMedsApplication.java          # Main entry point
├── auth/                                 # Authentication module
│   ├── AuthController.java
│   ├── AuthService.java
│   └── dto/
├── user/                                 # User/Profile module
│   ├── ProfileController.java
│   ├── ProfileService.java
│   └── dto/
├── drug/                                 # Drug module
│   ├── DrugController.java
│   ├── DrugService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── interaction/                          # Drug Interaction module
│   ├── InteractionController.java
│   ├── InteractionService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── ai/                                   # AI module
│   ├── AiController.java
│   ├── AiService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── chatbot/                              # AI Chatbot module
│   ├── ChatbotController.java
│   ├── ChatbotService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── reminder/                             # Medication Reminder module
│   ├── ReminderController.java
│   ├── ReminderService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── medication/                           # Medication History module
│   ├── MedicationHistoryController.java
│   ├── MedicationHistoryService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── doctor/                               # Doctor module
│   ├── DoctorController.java
│   ├── DoctorService.java
│   ├── model/
│   └── repository/
├── appointment/                          # Appointment module
│   ├── AppointmentController.java
│   ├── AppointmentService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── education/                            # Education Content module
│   ├── EducationController.java
│   ├── EducationService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── notification/                         # Notification module
│   ├── NotificationController.java
│   ├── NotificationService.java
│   ├── model/
│   ├── repository/
│   └── dto/
├── admin/                                # Admin module
│   ├── AdminController.java
│   ├── AdminService.java
│   └── dto/
├── config/                               # Configuration
│   └── SecurityConfig.java
├── security/                             # Security components
│   ├── JwtUtil.java
│   ├── JwtAuthenticationFilter.java
│   └── CustomUserDetailsService.java
├── exception/                            # Exception handling
│   ├── GlobalExceptionHandler.java
│   ├── ResourceNotFoundException.java
│   └── ErrorResponse.java
├── dto/                                  # Common DTOs
│   └── ApiResponse.java
└── model/                                # Core entities
    ├── User.java
    ├── Role.java
    ├── Profile.java
    └── RefreshToken.java
```

## API Endpoints

### Authentication
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| POST   | `/api/auth/register` | Register user | Public |
| POST   | `/api/auth/login` | Login | Public |
| POST   | `/api/auth/refresh-token` | Refresh token | Public |
| POST   | `/api/auth/logout` | Logout | Authenticated |
| GET    | `/api/auth/me` | Get current user | Authenticated |

### Users/Profile
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/users/profile` | Get profile | Authenticated |
| PUT    | `/api/users/profile` | Update profile | Authenticated |
| PATCH  | `/api/users/profile/image` | Update image | Authenticated |
| DELETE | `/api/users/profile` | Delete profile | Authenticated |

### Drugs
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/drugs` | Get all drugs | Authenticated |
| GET    | `/api/drugs/{id}` | Get drug by ID | Authenticated |
| GET    | `/api/drugs/search?keyword=` | Search drugs | Authenticated |
| GET    | `/api/drugs/suggestions?keyword=` | Get suggestions | Authenticated |
| GET    | `/api/drugs/{id}/alternatives` | Get alternatives | Authenticated |
| POST   | `/api/drugs` | Create drug | Admin |
| PUT    | `/api/drugs/{id}` | Update drug | Admin |
| DELETE | `/api/drugs/{id}` | Delete drug | Admin |

### Drug Interactions
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| POST   | `/api/interactions/check` | Check interactions | Authenticated |
| GET    | `/api/interactions/history` | Get history | Authenticated |
| GET    | `/api/interactions/{id}` | Get interaction | Authenticated |

### AI Features
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/ai/providers` | Get AI providers | Authenticated |
| PUT    | `/api/ai/provider` | Update provider | Authenticated |
| POST   | `/api/ai/explain` | Get AI explanation | Authenticated |
| GET    | `/api/ai/history` | Get AI history | Authenticated |
| DELETE | `/api/ai/history/{id}` | Delete AI history | Authenticated |

### AI Chatbot
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| POST   | `/api/chat` | Send message | Authenticated |
| GET    | `/api/chat/history` | Get chat history | Authenticated |
| DELETE | `/api/chat/history` | Delete chat history | Authenticated |

### Medication Reminders
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/reminders` | Get all reminders | Authenticated |
| GET    | `/api/reminders/{id}` | Get reminder | Authenticated |
| POST   | `/api/reminders` | Create reminder | Authenticated |
| PUT    | `/api/reminders/{id}` | Update reminder | Authenticated |
| DELETE | `/api/reminders/{id}` | Delete reminder | Authenticated |

### Medication History
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/medications/history` | Get history | Authenticated |

### Doctors
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/doctors` | Get all doctors | Authenticated |
| GET    | `/api/doctors/{id}` | Get doctor | Authenticated |
| GET    | `/api/doctors/verified` | Get verified doctors | Authenticated |
| GET    | `/api/doctors/search?keyword=` | Search doctors | Authenticated |

### Appointments
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/appointments` | Get appointments | Authenticated |
| GET    | `/api/appointments/{id}` | Get appointment | Authenticated |
| POST   | `/api/appointments` | Create appointment | Authenticated |
| PUT    | `/api/appointments/{id}` | Update appointment | Authenticated |
| DELETE | `/api/appointments/{id}` | Delete appointment | Authenticated |

### Education
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/education` | Get all content | Authenticated |
| GET    | `/api/education/{id}` | Get content | Authenticated |
| GET    | `/api/education/download/{id}` | Download content | Authenticated |
| GET    | `/api/education/share/{id}` | Share content | Authenticated |

### Notifications
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/notifications` | Get all notifications | Authenticated |
| GET    | `/api/notifications/unread` | Get unread | Authenticated |
| PUT    | `/api/notifications/{id}/read` | Mark as read | Authenticated |
| DELETE | `/api/notifications/{id}` | Delete notification | Authenticated |

### Search
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/search/suggestions?keyword=` | Get suggestions | Authenticated |

### Download & Share
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/drugs/{id}/download` | Download drug info | Authenticated |
| POST   | `/api/drugs/{id}/share` | Share drug info | Authenticated |
| GET    | `/api/drugs/{id}/alternatives` | Get alternatives | Authenticated |

### Admin
| Method | Endpoint           | Description  | Auth |
| ------ | ------------------ | ------------ | ---- |
| GET    | `/api/admin/users` | Get all users | Admin |
| GET    | `/api/admin/users/{id}` | Get user | Admin |
| PATCH  | `/api/admin/users/{id}/status` | Update user status | Admin |
| PUT    | `/api/admin/users/{id}` | Update user | Admin |
| DELETE | `/api/admin/users/{id}` | Delete user | Admin |
| GET    | `/api/admin/reports/dashboard` | Get dashboard | Admin |

## Configuration

All configuration is in `src/main/resources/application.properties`:

```properties
# Application
spring.application.name=intellimeds

# Supabase PostgreSQL
spring.datasource.url=jdbc:postgresql://<host>:5432/postgres
spring.datasource.username=<username>
spring.datasource.password=<password>
spring.datasource.hikari.maximum-pool-size=10

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.open-in-view=false

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true

# JWT Configuration
jwt.secret=<your-secret>
jwt.expiration=86400000
jwt.refresh-expiration=604800000
```

## Response Format

All API responses follow a consistent format:

```json
{
    "success": true,
    "message": "Description of the result",
    "data": { ... }
}
```

Error responses:

```json
{
    "success": false,
    "message": "Error description",
    "data": null
}
```

## Security

- JWT Authentication with access and refresh tokens
- BCrypt password encoding
- Role-based access control (RBAC)
- Stateless session management
- CORS configuration
- Global exception handling

## License

See [LICENSE](../LICENSE) for details.
