# payment-platform

A Kafka-based payments platform. Browser -> Spring Cloud Gateway -> services over gRPC (sync) and Kafka (events). Auth is Keycloak.

The monorepo is for **organisation only**: every service under `services/` is a standalone project with its own build, Dockerfile and database. No shared code.

## Layout
```
services/
  gateway/                 Spring Cloud Gateway (WebFlux), edge auth          :8080
  auth-service/            thin Keycloak wrapper, gRPC client + server        :8081 / gRPC 9081
  user-management-service/ user record, roles, admin ops; outbox             :8082 / gRPC 9082
  account-service/         accounts, debits/credits; outbox + inbox           :8083 / gRPC 9083
  payment-service/         client payments API, bulk CSV, SSE; outbox + inbox :8084
  payment-processor-service/ rails (mock), no public API; outbox + inbox     :8085
  notification-service/    email; inbox                                       :8086
  fraud-service/           optional fraud gate; outbox + inbox                :8087
  bulk-processor/          Rust (cargo); inbox + outbox
infra/                     Postgres init + replica, Kafka topic creation
frontend/                  placeholder
docker-compose.yml         the whole local stack
```

Each producer owns its contracts in `services/<service>/contracts/`. A consumer copies the file into its own `src/main/protobuf/` (never imports it).

## Stack
- Java 25, Spring Boot 4.1.1 on every service (gateway adds Spring Cloud 2025.1.3, which supports Boot 4.0-4.1), Maven per service; root `pom.xml` is an aggregator only
- Spring for Apache Kafka, Spring gRPC (Boot starters), Spring Data JPA, Flyway, PostgreSQL 18
- Rust 2024 edition: tokio, rdkafka, sqlx
- Kafka 4.3 (KRaft), Keycloak 26.7, Mailpit for local email

## Run locally
```bash
cp .env.example .env
```

Keycloak imports the `payments` realm (`infra/keycloak/realms/payments-realm.json`) on first start, and Postgres creates the `keycloak` database only when its volume is new. If your Postgres volume was created before the `keycloak` database existed, reset it once with `docker compose down -v`.

Infra only (run the services from your IDE or `mvn spring-boot:run` / `cargo run`):
```bash
docker compose up -d postgres postgres-replica kafka kafka-init keycloak mailpit
```

Everything, built from source:
```bash
docker compose up -d --build
```

Add the optional fraud-service with `--profile fraud`.

### Configuration
- `application.yaml` holds shared config. Every environment-specific value (database, Kafka, gRPC targets, Keycloak, mail) is an env var with no default, so a non-local deployment must supply it.
- `application-local.yaml` holds the local values, addressed by compose network hostnames (`postgres`, `kafka`, `keycloak`, `<service>:<port>`). Compose runs every Spring service with `SPRING_PROFILES_ACTIVE=local`.
- bulk-processor reads `services/bulk-processor/.env.local` (compose `env_file`, and `dotenvy` for `cargo run`).
- Running a service from the IDE against the compose infra: use the `local` profile and override hosts with env vars, e.g. `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/payment`, `SPRING_KAFKA_BOOTSTRAP_SERVERS=localhost:9092`.

Ports are the same everywhere (host and compose network); only the gateway is published to the host.

| Service | HTTP | gRPC |
|---|---|---|
| gateway | 8080 | |
| auth-service | 8081 | 9081 |
| user-management-service | 8082 | 9082 |
| account-service | 8083 | 9083 |
| payment-service | 8084 | |
| payment-processor-service | 8085 | |
| notification-service | 8086 | |
| fraud-service | 8087 | |

### External REST APIs
auth-service calls Keycloak over REST (no admin-client SDK): `app.keycloak.base-url` (local `http://keycloak:8180`), realm `payments`, confidential client `auth-service`. The gateway validates tokens against the realm JWKS (`KEYCLOAK_JWKS_URI`).

Gateway routes are under `spring.cloud.gateway.server.webflux.routes`: `/api/auth/**`, `/api/users/**`, `/api/accounts/**`, `/api/payments/**`. Base config takes each target from an env var (`AUTH_SERVICE_URI`, `USER_MANAGEMENT_SERVICE_URI`, `ACCOUNT_SERVICE_URI`, `PAYMENT_SERVICE_URI`); the local profile defaults them to the compose hostnames.

| Endpoint | URL |
|---|---|
| Gateway | http://localhost:8080 |
| Keycloak (admin console: admin / `KEYCLOAK_ADMIN_PASSWORD`) | http://localhost:8180 |
| Postgres primary / replica | localhost:5432 / localhost:5433 |
| Kafka | localhost:9092 |
| Mailpit UI | http://localhost:8025 |

## Build one service
```bash
cd services/payment-service && mvn verify
```

```bash
cd services/bulk-processor && cargo build
```

CI runs one workflow per service, triggered only by changes under that service's folder (`.github/workflows/`).

## What's scaffolded vs. built
Scaffolded: build files with dependencies, Dockerfiles, `application.yaml` config, Flyway/sqlx migrations for the `outbox`/`inbox` tables, empty `outbox/` and `inbox/` packages, proto contracts with the agreed `CreateUser` RPC (message fields left empty), compose stack.

Implemented so far: Keycloak auth (gateway token validation and route security; auth-service login, refresh, sign-up and internal `GetUser`/`ListUsers`), user-management `CreateUser`. Not implemented yet: outbox relays, Kafka consumers, payments, accounts, notifications and the frontend.

Note: the gateway includes the OAuth2 resource-server starter, so until you add a `SecurityWebFilterChain` Spring Security's defaults protect every route.
