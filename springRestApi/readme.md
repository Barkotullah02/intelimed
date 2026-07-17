# SpringRestApi

Spring Boot REST API with Supabase PostgreSQL and Flyway auto-migration.

## Tech Stack

- Java 17
- Spring Boot 4.1.0
- Spring Data JPA + Hibernate 7.4.1
- PostgreSQL 17.6 (Supabase)
- Flyway (auto-migration)
- Spring Security
- Lombok
- Maven

## Quick Start

### Prerequisites

- Java 17+
- Maven (or use `./mvnw` wrapper)

### Setup

1. Clone the repo
2. Configure `src/main/resources/application.properties` with your Supabase credentials:

```properties
spring.datasource.url=jdbc:postgresql://<host>:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=<your-password>
```

3. Run:

```bash
./mvnw spring-boot:run
```

### Verify

```bash
curl http://localhost:8080/actuator/health
# Expected: {"status":"UP"}
```

## API Endpoints

| Endpoint           | Method | Description  | Auth         |
| ------------------ | ------ | ------------ | ------------ |
| `/actuator/health` | GET    | Health check | Public       |
| `/*`               | ANY    | All others   | Requires auth|

## Database Migrations

Flyway runs automatically on every startup.

- Location: `src/main/resources/db/migration/`
- Naming convention: `V{version}__{description}.sql`
- Example: `V2__create_users_table.sql`

### Adding a new migration

1. Create a new file in `db/migration/`:

```sql
V2__create_users_table.sql
```

2. Write your SQL:

```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

3. Restart the app — Flyway applies it automatically.

## Project Structure

```
src/main/java/com/opu/springrestapi/
├── SpringRestApiApplication.java

src/main/resources/
├── application.properties
├── db/migration/
│   └── V1__init_schema.sql
```

## Configuration

All config is in `src/main/resources/application.properties`:

```properties
# App
spring.application.name=springRestApi

# Supabase PostgreSQL
spring.datasource.url=jdbc:postgresql://db.pigfzwkcjwxscpccfvhx.supabase.co:5432/postgres
spring.datasource.username=postgres
spring.datasource.password=<your-password>

# JPA
spring.jpa.hibernate.ddl-auto=validate

# Flyway
spring.flyway.enabled=true
spring.flyway.baseline-on-migrate=true
```
