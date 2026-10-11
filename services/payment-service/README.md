# payment-service

The only payments service clients call: payments, bulk CSV upload and validation, SSE progress, admin view.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build payment-service
```
