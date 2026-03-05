# Security Policy

This repository handles production user data and privileged database access. Treat security requirements as **non-optional**.

## Agent Rules (MUST FOLLOW)

- **No secrets in code**
  - Never commit: Database passwords, JWT secrets, API keys, service account keys, or admin credentials.
  - Client-side env vars must be limited to public-safe values only (e.g. public API URLs, publishable keys).

- **Assume public keys are public**
  - Anyone can extract client-side keys from a web app.
  - All data protection must be enforced via database access control, safe RPCs, and server-side checks.

- **Privileged key usage**
  - Admin or service-level keys may only be used in:
    - Server-side route handlers (e.g. Next.js `src/app/api/**`, Express routes)
    - Serverless functions or edge functions
    - Trusted backend workers
  - Never expose privileged keys to the browser.

- **Database access control is mandatory**
  - Any table with user data must have access control (row-level security, middleware checks, or ORM-level policies).
  - Avoid permissive write rules that allow any user to insert or modify any row.

- **Prefer server endpoints for public write actions**
  - Any endpoint that records data (analytics, clicks, form submissions) must:
    - Validate input (e.g. zod)
    - Apply rate limits
    - Use server-side database writes with privileged credentials
  - Client components must not write to the database directly. Use a server route.

- **Function and procedure hardening**
  - Database functions that run with elevated privileges must:
    - Have a fixed, safe execution context.
    - Restrict execution to the roles that need it.

- **Do not increase attack surface**
  - Do not attach privileged objects to `window` or global scope unless strictly required.
  - Avoid broad CORS (`*`) except where explicitly intended and reviewed.

## Required Checks Before Merge

- **Repository scan**
  - Search for leaked keys:
    - Database passwords or connection strings
    - JWTs (`eyJ...`)
    - Any secret keys, tokens, or credentials

- **Database review** (required after any DB/access control change)
  - Verify access control policies cover new tables and columns.
  - Run security and performance checks available in your database platform.

- **Verify public write paths**
  - Confirm no tables allow anonymous inserts without validation/rate limiting.
  - Confirm any public write action is routed through a server endpoint.

## Patterns To Use

- **Server-side event tracking**
  - Use a server API route with rate limiting and privileged database writes.
  - Example endpoints:
    - `/api/track-click` -> records event via server-side DB client
    - `/api/track-event` -> records event via server-side DB client

- **Restrict direct database function execution**
  - Sensitive database functions must not be callable by anonymous or public roles.
  - Execution should be restricted to server-side service accounts.

- **Public analytics**
  - Prefer a server endpoint that accepts sanitized payloads and enforces bot checks.

- **Admin-only actions**
  - Admin endpoints must use privileged database credentials and proper authorization.
  - Avoid using public/anonymous database clients inside admin routes.

## Enforced Architecture

### Option A: Server routes for any privileged writes

- Direct writes to protected tables from client code are not allowed.
- All privileged writes must go through server-side route handlers.
- Server routes must:
  - Validate input (e.g. zod)
  - Rate limit
  - Authenticate via `Authorization: Bearer <JWT>` or session cookie
  - Use privileged credentials for DB writes

### Option B: Anonymous activity is local-only

- Anonymous activity must remain local until login.
- Cloud state for user data is **authenticated-only**:
  - User lists and collections
  - Recently viewed items
  - Progress tracking
  - Any user-specific data

## Database Hardening Rules

- **Protected tables**
  - Admin tables, user tokens, user data tables, and any sensitive business data.

- **Access control and grants**
  - Admin tables are accessible only via privileged server-side credentials.
  - Public tables allow read-only access where appropriate.
  - Table writes are server-side only (via server endpoints).

- **Function grants + hardening**
  - Sensitive database functions are restricted to privileged roles only.
  - Functions with elevated privileges must have a fixed, safe execution context.

## Incident Response (If a key is exposed)

1. Rotate impacted keys immediately.
2. Audit access control policies and function grants.
3. Review logs for unusual access patterns.
4. Add a regression test/checklist entry to prevent recurrence.
