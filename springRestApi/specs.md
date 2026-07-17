# Project Specifications

## Architecture

- Monolithic Spring Boot REST API
- Layered architecture: Controller -> Service -> Repository -> Database
- Embedded Tomcat server (port 8080)

## Database

| Property       | Value                                    |
| -------------- | ---------------------------------------- |
| Provider       | Supabase (hosted PostgreSQL)             |
| Version        | 17.6                                     |
| Driver         | PostgreSQL JDBC Driver                   |
| Connection Pool| HikariCP (Spring Boot default)           |
| Schema Mgmt    | Flyway auto-migration on startup         |
| Hibernate Mode | validate (checks schema matches entities)|

## Security

- Spring Security enabled (default configuration)
- All endpoints require authentication by default
- Unauthenticated requests return HTTP 401
- Actuator health endpoint is publicly accessible

## Migration Strategy

| Setting                  | Value                          |
| ------------------------ | ------------------------------ |
| Tool                     | Flyway                         |
| Run on startup           | Yes                            |
| Baseline on migrate      | Yes (handles existing tables)  |
| Migration location       | `classpath:db/migration/`      |
| File naming              | `V{N}__{description}.sql`      |
| Applied migrations tracked | `flyway_schema_history` table |

## Configuration

Externalized via `application.properties`:

| Property                              | Purpose                        |
| ------------------------------------- | ------------------------------ |
| `spring.datasource.url`               | JDBC connection URL             |
| `spring.datasource.username`          | Database user                   |
| `spring.datasource.password`          | Database password               |
| `spring.jpa.hibernate.ddl-auto`       | Schema validation mode          |
| `spring.jpa.properties.hibernate.dialect` | PostgreSQL dialect          |
| `spring.flyway.enabled`               | Enable/disable Flyway           |
| `spring.flyway.baseline-on-migrate`   | Baseline existing schema        |

## Dependencies

| Dependency                                   | Purpose                          |
| -------------------------------------------- | -------------------------------- |
| `spring-boot-starter-data-jpa`               | ORM and database access          |
| `spring-boot-starter-security`               | Authentication and authorization|
| `spring-boot-starter-validation`             | Bean validation                  |
| `spring-boot-starter-webmvc`                 | REST API / web layer             |
| `spring-boot-starter-actuator`               | Health checks and monitoring     |
| `spring-boot-devtools`                       | Hot reload in development        |
| `org.postgresql:postgresql`                  | PostgreSQL JDBC driver           |
| `org.flywaydb:flyway-core`                   | Database migration               |
| `org.flywaydb:flyway-database-postgresql`    | PostgreSQL Flyway support        |
| `org.projectlombok:lombok`                   | Boilerplate code reduction       |

## Build & Run

| Command                     | Description                     |
| --------------------------- | ------------------------------- |
| `./mvnw spring-boot:run`    | Start the application           |
| `./mvnw clean install`      | Build the project               |
| `./mvnw compile`            | Compile only                    |

## Testing the API

```bash
# Health check (no auth required)
curl http://localhost:8080/actuator/health

# Any other endpoint (auth required)
curl http://localhost:8080/your-endpoint
# Returns 401 if not authenticated
```
