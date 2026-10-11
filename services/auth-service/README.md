# auth-service

Thin wrapper around Keycloak and the only service that talks to it: login, refresh, sign-up, and internal gRPC user lookups.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build auth-service
```
