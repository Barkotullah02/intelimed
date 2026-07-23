# IntelliMeds Project Specifications

## Overview

IntelliMeds is a comprehensive healthcare REST API built with Spring Boot, providing drug management, doctor consultations, AI-powered recommendations, and patient care features.

## Architecture

- **Type:** Monolithic Spring Boot REST API
- **Package:** `com.intellimeds`
- **Port:** 8080
- **Architecture Pattern:** Layered (Controller -> Service -> Repository -> Database)

## Technology Stack

| Technology       | Version  | Purpose                    |
| ---------------- | -------- | -------------------------- |
| Java             | 17       | Programming language       |
| Spring Boot      | 4.1.0    | Application framework      |
| Spring Security  | 6.x      | Security framework         |
| Spring Data JPA  | 7.4.1    | ORM / Database access      |
| Hibernate        | 7.4.1    | JPA implementation         |
| PostgreSQL       | 17.6     | Database                   |
| Flyway           | -        | Database migration         |
| JWT (jjwt)       | 0.12.6   | Token authentication       |
| Lombok           | -        | Code generation            |
| Maven            | -        | Build tool                 |

## Database

| Property       | Value                                    |
| -------------- | ---------------------------------------- |
| Provider       | Supabase (hosted PostgreSQL)             |
| Version        | 17.6                                     |
| Driver         | PostgreSQL JDBC Driver                   |
| Connection Pool| HikariCP (max pool size: 10)             |
| Schema Mgmt    | Hibernate ddl-auto: validate             |
| Migration      | Flyway                                   |

## Project Structure

```
src/main/java/com/intellimeds/
├── IntelliMedsApplication.java
├── auth/                 # Authentication module
├── user/                 # User/Profile module
├── drug/                 # Drug module
├── interaction/          # Drug Interaction module
├── ai/                   # AI module
├── chatbot/              # AI Chatbot module
├── reminder/             # Medication Reminder module
├── medication/           # Medication History module
├── doctor/               # Doctor module
├── appointment/          # Appointment module
├── education/            # Education Content module
├── notification/         # Notification module
├── admin/                # Admin module
├── config/               # Configuration
├── security/             # Security components
├── exception/            # Exception handling
├── dto/                  # Common DTOs
└── model/                # Core entities
```

## Modules

### 1. Authentication Module
- JWT Authentication with Spring Security
- Register Patient
- Register Healthcare Professional
- Login with email/password
- Password Encryption (BCrypt)
- JWT Token generation and validation
- Role-based Authorization
- Refresh Token mechanism
- Logout (token revocation)

**APIs:**
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/refresh-token`
- POST `/api/auth/logout`
- GET `/api/auth/me`

### 2. User/Profile Module
- Users can manage their own profile
- Profile image upload
- Personal information management
- Medical information (allergies, chronic diseases)
- Emergency contact information

**APIs:**
- GET `/api/users/profile`
- PUT `/api/users/profile`
- PATCH `/api/users/profile/image`
- DELETE `/api/users/profile`

**Fields:**
- Name, Email, Password
- Gender, DOB, Weight, Height
- Allergies, Chronic Diseases
- Emergency Contact
- Blood Group
- Specialization (for healthcare professionals)
- License Number, Hospital

### 3. Drug Module
- Search drugs by keyword
- View drug information
- Drug suggestions/autocomplete
- Drug alternatives

**APIs:**
- GET `/api/drugs`
- GET `/api/drugs/search?keyword=`
- GET `/api/drugs/{id}`
- GET `/api/drugs/suggestions?keyword=`
- GET `/api/drugs/{id}/alternatives`

**Drug Information:**
- Generic Name, Brand Name
- Manufacturer
- Description, Uses
- Dosage, Side Effects
- Contraindications
- Pregnancy Safety
- Storage, Image

### 4. Drug Interaction Module
- Check interaction between multiple drugs
- Severity levels: Major, Moderate, Minor
- Interaction history tracking

**APIs:**
- POST `/api/interactions/check`
- GET `/api/interactions/history`
- GET `/api/interactions/{id}`

### 5. AI Explanation Module
- AI-generated explanations for drug interactions
- Simple language output
- Recommendations and warnings

**APIs:**
- POST `/api/ai/explain`

### 6. AI Provider Module
- Multiple AI provider support
- Dynamic provider switching

**Supported Providers:**
- Offline LLM
- Gemini API
- OpenAI
- Ollama

**APIs:**
- GET `/api/ai/providers`
- PUT `/api/ai/provider`

### 7. AI Chatbot Module
- Medical symptom chatbot
- AI-powered responses
- Conversation history

**APIs:**
- POST `/api/chat`
- GET `/api/chat/history`
- DELETE `/api/chat/history`

### 8. AI History Module
- Automatic response saving
- Provider tracking

**APIs:**
- GET `/api/ai/history`
- DELETE `/api/ai/history/{id}`

### 9. Alternative Medicine Module
- Similar drug suggestions
- Generic alternatives
- Brand alternatives

**APIs:**
- GET `/api/drugs/{id}/alternatives`

### 10. Medication Reminder Module
- Create medicine reminders
- Time-based reminders
- Frequency settings
- Notification enable/disable

**APIs:**
- POST `/api/reminders`
- GET `/api/reminders`
- GET `/api/reminders/{id}`
- PUT `/api/reminders/{id}`
- DELETE `/api/reminders/{id}`

### 11. Medication History Module
- Track medication intake
- Status: Completed, Missed, Skipped

**APIs:**
- GET `/api/medications/history`

### 12. Doctor Consultation Module
- Book doctor consultations
- Doctor profiles with verification
- Appointment management

**APIs:**
- GET `/api/doctors`
- GET `/api/doctors/{id}`
- POST `/api/appointments`
- GET `/api/appointments`
- PUT `/api/appointments/{id}`
- DELETE `/api/appointments/{id}`

### 13. Patient Education Module
- PDFs, Articles, Videos
- Download and share functionality

**APIs:**
- GET `/api/education`
- GET `/api/education/{id}`
- GET `/api/education/download/{id}`
- GET `/api/education/share/{id}`

### 14. Search Suggestion Module
- Autocomplete suggestions
- Real-time search

**APIs:**
- GET `/api/search/suggestions?keyword=`

### 15. Download & Share Module
- Download drug information
- Share drug information

**APIs:**
- GET `/api/drugs/{id}/download`
- POST `/api/drugs/{id}/share`

### 16. Admin Module
- User management
- Drug management
- Interaction management
- Reports and analytics

**APIs:**
- GET `/api/admin/users`
- GET `/api/admin/users/{id}`
- PATCH `/api/admin/users/{id}/status`
- PUT `/api/admin/users/{id}`
- DELETE `/api/admin/users/{id}`
- GET `/api/admin/reports/dashboard`

## Security Requirements

- Spring Security 6
- JWT Authentication (Access + Refresh tokens)
- BCrypt Password Encoding
- Role-Based Access Control (RBAC)
- CORS Configuration
- Request Validation (Bean Validation)
- Global Exception Handling

## Database Tables

- users
- roles
- user_roles
- refresh_tokens
- profiles
- drugs
- drug_categories
- drug_alternatives
- drug_interactions
- interaction_history
- ai_providers
- ai_history
- chat_history
- medication_reminders
- medication_history
- doctors
- appointments
- education_contents
- notifications

## Build & Run

| Command                     | Description                     |
| --------------------------- | ------------------------------- |
| `./mvnw spring-boot:run`    | Start the application           |
| `./mvnw clean install`      | Build the project               |
| `./mvnw compile`            | Compile only                    |
| `./mvnw test`               | Run tests                       |
