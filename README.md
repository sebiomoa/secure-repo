# Secure Repo

**Drop production-grade security standards into any repository in 30 seconds.**

```bash
npx secure-repo init
```

That's it. Your repo now has battle-tested security policies, checklists, and enforcement rules used in real production SaaS applications.

---

## Audit Your Repo

Not sure where you stand? Run an instant security audit:

```bash
npx secure-repo audit
```

```
  secure-repo audit

  Scanning repository for security issues...

  Policy files:
    [FAIL] SECURITY.md — missing (high priority)
    [FAIL] AUTH.md — missing (high priority)
    [FAIL] API.md — missing (high priority)
    [warn] DATABASE.md — missing
    [warn] DEPLOYMENT.md — missing

  Environment files:
    [pass] .env is in .gitignore
    [pass] .env.example exists

  Secret scanning:
    [pass] No obvious secrets found in source files

  ────────────────────────────────────
  Results: 3 passed, 2 warnings, 3 issues
  ────────────────────────────────────

  3 issue(s) found. Fix these before shipping.
  Run: npx secure-repo init
```

Zero setup. Zero dependencies. Just run it.

---

## The Problem

You're building a SaaS app. You know you should have security policies, but:

- Writing them from scratch takes days
- You don't know what you're missing until something breaks
- AI coding agents generate insecure code when there's no policy file to guide them
- Your team has no shared standard for "how we handle auth" or "what counts as a safe API endpoint"

## The Solution

```bash
npx secure-repo init
```

```
  secure-repo - Adding production standards to your project

  Free templates:
    [done] SECURITY.md
    [done] AUTH.md
    [done] API.md

  Done! 3 files added.
```

Every template is:

- **Opinionated** — makes decisions so you don't have to
- **Actionable** — every rule is verifiable, every pattern is copy-pastable
- **AI-agent friendly** — coding agents read these files and write safer code

---

## What You Get (Free)

Three templates that cover the foundations:

**SECURITY.md** — No secrets in code. Privileged keys server-side only. Database access control mandatory. Server endpoints for all writes. Incident response steps.

**AUTH.md** — JWT verification rules. Token storage (httpOnly cookies, not localStorage). Password hashing (bcrypt/argon2). Rate limiting on login. Session revocation. Role-based access.

**API.md** — Input validation on every endpoint. Rate limiting on all public routes. Error responses that don't leak internals. Endpoint conventions. CORS rules. Pagination enforcement.

Each file includes:
- Rules marked "MUST FOLLOW"
- Code patterns to copy
- A "Required Checks Before Merge" checklist

---

## Pro Pack

27 additional files for teams that want complete coverage. Sold separately.

### Pro Templates (18 files)

| Template | What it covers |
|----------|---------------|
| `DATABASE.md` | Access control patterns, migration safety, table design |
| `DEPLOYMENT.md` | CI/CD pipeline, rollback procedures, zero-downtime deploys |
| `INCIDENT_RESPONSE.md` | Severity levels, response steps, post-mortem template, runbooks |
| `OBSERVABILITY.md` | Structured logging, PII redaction, alerting rules, health checks |
| `TESTING.md` | Security test patterns with code examples |
| `ENV_VARIABLES.md` | Secrets management, rotation, client vs server vars |
| `PAYMENTS.md` | Stripe webhooks, subscription management, PCI rules |
| `DATA_PRIVACY.md` | GDPR, retention schedules, account deletion flow |
| `FILE_UPLOADS.md` | Upload validation, signed URLs, serving rules |
| `RATE_LIMITING.md` | Per-endpoint limits, implementation patterns |
| `THIRD_PARTY.md` | Integration inventory, webhook security, OAuth |
| `ACCESS_CONTROL.md` | Roles, permissions, escalation, break-glass procedures |
| `LOGGING_PII.md` | What to log, what to redact, compliance rules |
| `PR_CHECKLIST.md` | Copy-paste security checklist for every PR |
| `THREAT_MODEL.md` | Lightweight threat modeling template |
| `VULNERABILITY_REPORTING.md` | Responsible disclosure policy |
| `CONTRIBUTING_SECURITY.md` | Contributor security rules |
| `POLICY_INDEX.md` | One-page index linking all policies |

### Premium: 100+ Point Security Audit

`FULL_AUDIT_CHECKLIST.md` — Complete production security audit with severity ratings, explanations for every item, and an audit summary template. This is what security consultants charge thousands to produce.

### Stack Presets

- **Supabase** — RLS policies, `auth.uid()` patterns, service role rules, function hardening (6 files)
- **Firebase** — Firestore security rules, Firebase Auth, Cloud Functions, custom claims (3 files)

### Code Examples

- `next-route-handler.ts` — Secure API route with auth + validation + error handling
- `rate-limit.ts` — Rate limiting middleware (in-memory + Redis)
- `zod-validate.ts` — Reusable validation schemas
- `supabase-rls.sql` — 8 RLS policy patterns
- `firebase-rules.txt` — 8 Firestore rule patterns

**Get the pro pack:** [sebiomoa.gumroad.com](https://sebiomoa.gumroad.com)

After purchase, install with one command:

```bash
npx secure-repo init --key <your-license-key>
```

---

## Commands

```bash
npx secure-repo init              # Add free security templates
npx secure-repo init --key <key>  # Add free + pro templates (with license key)
npx secure-repo audit             # Scan your repo for security issues
npx secure-repo import <zip>      # Import pro templates from zip (offline)
npx secure-repo check             # Check if your templates are outdated
npx secure-repo list              # Show all available templates
```

---

## Free vs Pro

| | Free | Pro Pack |
|--|------|---------|
| Security audit command | Included | Included |
| Core security policies (3 files) | Included | Included |
| Deep engineering standards (18 files) | - | Included |
| 100+ point audit checklist | - | Included |
| Stack presets (Supabase, Firebase) | - | Included |
| Code examples (5 files) | - | Included |
| **Total policy files** | **3** | **30** |

---

## Why This Matters for AI-Assisted Development

If you use Cursor, Claude Code, Copilot, or any AI coding agent — these files change how the agent writes code in your repo.

When an AI agent sees `SECURITY.md` in your project root, it follows those rules. When it sees `API.md`, it validates input and handles errors correctly. When it sees `AUTH.md`, it checks tokens server-side.

**Without policy files:** The agent guesses. It writes code that works but may not be secure.

**With policy files:** The agent follows your standards. Every generated endpoint validates input, checks auth, and handles errors safely.

Secure Repo gives your AI agents the rules they need to write production-safe code.

---

## Support This Project

If Secure Repo helps you ship safer software, consider [sponsoring development](https://github.com/sponsors/sebiomoa).

---

## License

Free templates (`templates/free/`) are [MIT licensed](LICENSE).

Pro pack templates are licensed for personal and commercial use by the purchaser.

---

*This is not legal advice. These templates do not replace professional security audits for regulated industries. They are practical engineering tools for building more secure applications.*
