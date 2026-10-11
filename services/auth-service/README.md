# auth-service

See [docs/services/auth-service.md](../../docs/services/auth-service.md) for purpose, ownership, topics and open TODOs.

Standalone project: own build, own Dockerfile, no shared code with other services (ADR 0001).

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build auth-service
```
