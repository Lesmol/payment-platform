# fraud-service

Optional for the MVP: fraud verdicts that gate a payment before it enters processing.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build fraud-service
```
