# API Standards

All API endpoints in this repository must follow these rules. Insecure or unvalidated endpoints are the most common attack vector in modern web apps.

## Rules (MUST FOLLOW)

- **Validate all input**
  - Every endpoint must validate request body, query params, and path params.
  - Use a schema validation library (e.g. zod, yup, joi).
  - Reject invalid payloads with 400 and a safe error message.
  - Never pass raw user input to database queries or system commands.

- **Rate limit all public endpoints**
  - Login, signup, password reset: strict limits (5-10 req/min per IP).
  - Public read endpoints: moderate limits (60-120 req/min per IP).
  - Authenticated endpoints: per-user limits where appropriate.
  - Return 429 when limits are exceeded.

- **Authenticate before processing**
  - Protected endpoints must verify auth before any business logic runs.
  - Check auth first, validate input second, then process.
  - Return 401 for missing auth, 403 for insufficient permissions.

- **Never expose internal errors**
  - Return generic error messages to clients (e.g. "Something went wrong").
  - Log full error details server-side only.
  - Never leak stack traces, SQL errors, or internal paths in responses.

- **Use consistent error format**
  ```json
  {
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Email is required."
    }
  }
  ```

- **Idempotency for write operations**
  - POST endpoints that create resources should support idempotency keys where possible.
  - PUT and DELETE must be idempotent by design.

## Endpoint Conventions

### Naming

```
GET    /api/resources          -> list
GET    /api/resources/:id      -> get one
POST   /api/resources          -> create
PUT    /api/resources/:id      -> update (full replace)
PATCH  /api/resources/:id      -> update (partial)
DELETE /api/resources/:id      -> delete
```

### Response codes

| Code | Use |
|------|-----|
| 200 | Successful read or update |
| 201 | Successful creation |
| 204 | Successful deletion (no body) |
| 400 | Invalid input |
| 401 | Not authenticated |
| 403 | Not authorized |
| 404 | Resource not found |
| 409 | Conflict (duplicate, version mismatch) |
| 429 | Rate limited |
| 500 | Server error (never expose details) |

## Request/Response Rules

- **Content-Type**: Always set and check `Content-Type: application/json` for JSON endpoints.
- **CORS**: Only allow specific origins. Never use `*` on authenticated endpoints.
- **Pagination**: List endpoints must support pagination. Default limit: 20-50. Max limit: 100.
- **Filtering**: Validate filter params against an allowlist. Never pass raw filter values to queries.

## Server Route Pattern (Next.js)

Every API route should follow this structure:

```typescript
export async function POST(request: Request) {
  // 1. Authenticate
  const session = await verifySession(request);
  if (!session) return Response.json({ error: { code: "UNAUTHORIZED" } }, { status: 401 });

  // 2. Validate input
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return Response.json({ error: { code: "VALIDATION_ERROR" } }, { status: 400 });

  // 3. Process
  const result = await doTheThing(parsed.data);

  // 4. Respond
  return Response.json(result, { status: 200 });
}
```

## Required Checks Before Merge

Before merging any API changes:

- [ ] All inputs are validated with a schema
- [ ] Rate limiting is configured for public endpoints
- [ ] Auth is checked before business logic
- [ ] Error responses do not leak internal details
- [ ] CORS is configured for specific origins only
- [ ] New endpoints are documented
- [ ] No raw user input reaches database queries or shell commands
