# Authentication & Authorization Policy

This repository handles authenticated user sessions and role-based access. Authentication mistakes can expose user data or privileged operations.

Treat all authentication logic as **security-critical**.

## Rules (MUST FOLLOW)

- **Never trust client authentication state**
  - The server must always verify tokens or sessions.
  - Client-side auth state is for UI rendering only.

- **JWT tokens must be verified server-side**
  - Verify signature against your secret/public key.
  - Verify expiration (`exp` claim).
  - Verify issuer (`iss`) and audience (`aud`) if applicable.
  - Reject tokens that fail any check.

- **Use short-lived access tokens**
  - Access tokens: 15 minutes or less.
  - Refresh tokens: rotate on every use, invalidate old ones.
  - Never reuse refresh tokens.

- **Do not store tokens in localStorage**
  - Prefer `httpOnly`, `Secure`, `SameSite=Strict` cookies.
  - If localStorage is unavoidable, document the risk and compensate with short TTLs.

- **Session revocation must be supported**
  - Users must be able to log out of all devices.
  - Token revocation or session invalidation must be server-enforced.

- **Password rules**
  - Minimum 8 characters. No maximum below 128.
  - Use bcrypt, scrypt, or argon2 for hashing. Never SHA-256 or MD5 for passwords.
  - Enforce rate limiting on login attempts (max 5 per minute per IP/account).

- **Magic link / OTP rules**
  - Links and codes expire within 10 minutes.
  - Single use only. Invalidate after first use.
  - Rate limit generation (max 3 per 15 minutes per email).

## Authorization Model

Use role-based access control (RBAC).

### Default roles:

| Role | Description |
|------|-------------|
| `anonymous` | Unauthenticated visitor. Read-only public data. |
| `authenticated` | Logged-in user. Access own data only. |
| `admin` | Full access. Verified server-side. |

### Rules:

- Admin actions must require server-side role verification.
- Never trust role claims sent from the client.
- Roles must be validated against database state, not just JWT claims.
- Role escalation (user -> admin) must require re-authentication.

## Protected Endpoints

All endpoints requiring authentication must:

1. Verify session or JWT before processing.
2. Validate request input with a schema (e.g. zod).
3. Enforce role-based permissions.
4. Return 401 for missing auth, 403 for insufficient permissions.

### Endpoint patterns:

```
/api/user/**     -> requires authenticated role
/api/account/**  -> requires authenticated role + ownership check
/api/admin/**    -> requires admin role (verified server-side)
```

## Common Auth Vulnerabilities To Avoid

- Accepting expired or malformed tokens
- Storing tokens in unsafe storage (localStorage, query params, cookies without httpOnly)
- Trusting client-provided role claims
- Allowing unauthenticated password reset flows
- Missing brute-force protections on login
- Not invalidating sessions on password change
- Open redirect after login (validate redirect URLs server-side)
- CSRF on state-changing auth endpoints (use SameSite cookies or CSRF tokens)

## Required Checks Before Merge

Before merging any authentication-related changes:

- [ ] Session/token verification works correctly server-side
- [ ] Protected endpoints reject anonymous users with 401
- [ ] Admin routes require and verify admin role server-side
- [ ] Tokens expire correctly and cannot be reused after expiration
- [ ] Password changes invalidate existing sessions
- [ ] Rate limiting is active on login and token generation endpoints
- [ ] No auth tokens appear in URLs, logs, or error messages
