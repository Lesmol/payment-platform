# frontend

React + Vite + TypeScript + Tailwind + shadcn/ui. Roles: customer and admin; dark mode only. The browser talks only to the gateway (`http://localhost:8080`).

## Run

```bash
npm install
npm run dev
```

Mocks are on by default (in-memory, reset on reload). Set `VITE_USE_MOCKS=false` and `VITE_API_URL=http://localhost:8080` to call the gateway. Mock logins, password `password`: `customer@demo.test`, `admin@demo.test`.

## Structure

- `src/api/api-paths.ts`: base path per gateway prefix.
- `src/api/services/HttpService.ts`: base class with `get`/`post`/`put`/`patch`/`delete`, zod response parsing, `ServiceResult` (`ok` or `error`) and 401 token refresh.
- `src/api/services/<domain>/`: `*-endpoints.ts`, `*-request-schema.ts`, `*-response-schema.ts`, `*-types.ts`, `*-service.ts` (singleton), for `login`, `account`, `payment`, `user`.
- `src/api/mock/`: mock adapter used by `HttpService` when mocks are on; routes in `mock-handlers.ts`, data in `mock-db.ts`.
- `src/context/`: auth context; `*-context-types.ts` holds the context object.
- `src/hooks/`: `useAsyncAction`, `useAuth`, `useServices`.
- `src/modules/<feature>/`: `pages`, `components`, `context`, `hooks`, `schemas` for `login`, `accounts`, `payments`, `admin`.
- `AppRouter.tsx` and `routes.ts`: lazy pages with public, protected and admin route guards.

Endpoints the UI uses that the backend does not have yet are listed in `src/api/GAPS.md`.
