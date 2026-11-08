# Backend gaps

Endpoints the UI uses that the backend does not provide yet. With `VITE_USE_MOCKS=false` the gateway answers these with an error `ServiceResult`.

- List the caller's accounts: `GET /api/accounts/v1`
- List the caller's payments and all payments (admin): `GET /api/payments/v1`, `GET /api/payments/v1/all`
- Bulk batch progress: the UI polls `GET /api/payments/v1/bulk/{batchId}/progress` every 600 ms (SSE would need `fetch` streaming or a short-lived ticket, since `EventSource` cannot send a Bearer header)
- User management under `/api/users/v1`: list with `?search=`, `PATCH {id}/block`, `PATCH {id}/role`, `POST invite`, `DELETE {id}`
- Single payment returns no body, so the UI cannot show a payment id
- Single payment: the UI sends `toAccountNumber` and `branchCode` (picked from a bank list), but `SinglePaymentRequest` still expects `toAccountId` (UUID) and has no branch code

Contract mismatches:
- `AccountController` maps `api/account/v1`; the gateway routes `/api/accounts/**`. The client calls `/api/accounts/v1/...`.
- `AccountController.getAccountTransactions` defaults `pageSize=0` and `pageNumber=10`; the client always sends both explicitly.
- `LoginResponse` is snake_case (`access_token`, `refresh_token`, `expires_in`, `token_type`); the client schema matches.

Mock logins (password `password`): `customer@demo.test`, `admin@demo.test`.
