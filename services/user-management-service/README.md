# user-management-service

Owns the platform user record (keyed by the Keycloak user id), roles, status and admin operations.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build user-management-service
```
