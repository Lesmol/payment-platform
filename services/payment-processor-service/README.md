# payment-processor-service

The Kafka consumer that executes single payments. No public API.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build payment-processor-service
```
