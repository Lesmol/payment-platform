# notification-service

Email notifications only (no push), e.g. payment outcomes, invalid payment dates, reset-password emails.

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with the `local` profile (`application-local.yaml`):

```bash
docker compose up -d --build notification-service
```
