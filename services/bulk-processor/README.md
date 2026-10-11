# bulk-processor

Processes bulk payment batches. Written in Rust (cargo, not Maven).

Standalone project: own build, own Dockerfile, no shared code with other services.

## Run locally
Runs in the root compose stack with `.env.local`:

```bash
docker compose up -d --build bulk-processor
```
