# gateway

Spring Cloud Gateway: the single entry point, routing and Keycloak token validation. Must stream SSE without buffering.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build gateway
```
