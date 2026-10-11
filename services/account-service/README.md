# account-service

Customers' transactional accounts (multiple per customer), debits and credits.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build account-service
```
