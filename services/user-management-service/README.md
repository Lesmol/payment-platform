# user-management-service

See [docs/services/user-management-service.md](../../docs/services/user-management-service.md) for purpose, ownership, topics and open TODOs.

Standalone project: own build, own Dockerfile, no shared code with other services (ADR 0001).

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build user-management-service
```
