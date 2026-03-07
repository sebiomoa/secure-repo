# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [1.3.1] - 2026-03-07

### Fixed
- Audit score no longer exceeds 100 — gitignored env files no longer inflate the passed count

---

## [1.3.0] - 2026-03-07

### Fixed
- Agent instruction files (CLAUDE.md, .cursorrules, etc.) no longer overwrite existing user content — only writes if file doesn't exist or contains ShipSecure boilerplate
- `.env.local` false positive — audit now uses `git check-ignore` to verify if env files are gitignored before flagging

### Added
- Stack preset detection — `init --key` reads `package.json` dependencies and only installs relevant presets (Supabase, Firebase) instead of all

---

## [1.2.0] - 2026-03-05

### Added
- `ACCESSIBILITY.md` — Free template for WCAG 2.1 AA compliance: semantic HTML, keyboard navigation, screen readers, color contrast, font sizes, touch targets

---

## [1.1.0] - 2026-03-05

### Added
- AI agent instruction files — `npx secure-repo init` now generates config files for **Claude**, **Cursor**, **GitHub Copilot**, **Windsurf**, and **Cline** so agents automatically read and follow your security policies

---

## [1.0.0] - 2026-03-05

### Added

#### Free Templates
- `SECURITY.md` — Core security policy: secrets, attack surface, enforced architecture
- `AUTH.md` — Authentication & authorization: tokens, sessions, roles, password rules
- `API.md` — API standards: validation, rate limiting, error handling, endpoint conventions

#### Pro Templates
- `DATABASE.md` — Database policy: RLS patterns, migration safety, table design, function security
- `DEPLOYMENT.md` — Deployment policy: CI/CD, rollback, zero-downtime, migration safety
- `INCIDENT_RESPONSE.md` — Incident response: severity levels, steps, post-mortem template, runbooks
- `OBSERVABILITY.md` — Observability: structured logging, PII redaction, alerting, health checks
- `TESTING.md` — Testing policy: security test patterns, coverage, CI integration
- `ENV_VARIABLES.md` — Environment variables: secrets management, rotation, validation
- `PAYMENTS.md` — Payments security: Stripe integration, webhooks, subscription management
- `DATA_PRIVACY.md` — Data privacy: GDPR, retention schedules, deletion flow, consent
- `FILE_UPLOADS.md` — File uploads: validation, signed URLs, serving rules, image processing
- `RATE_LIMITING.md` — Rate limiting: per-endpoint limits, patterns, abuse detection
- `THIRD_PARTY.md` — Third-party integrations: inventory, webhooks, OAuth, failure handling
- `CONTRIBUTING_SECURITY.md` — Contributor guidelines: PR rules, self-review, dependency policy
- `PR_CHECKLIST.md` — Copy-paste PR checklist for security reviews
- `THREAT_MODEL.md` — Lightweight threat modeling template
- `ACCESS_CONTROL.md` — Roles, permissions, escalation, break-glass procedures
- `LOGGING_PII.md` — PII logging rules and redaction patterns
- `VULNERABILITY_REPORTING.md` — Responsible disclosure policy template
- `POLICY_INDEX.md` — One-page index linking all policies

#### Premium
- `FULL_AUDIT_CHECKLIST.md` — 100+ point production security audit checklist

#### Stack Presets
- `presets/supabase/` — Supabase-specific security, auth, database, testing, and audit templates
- `presets/firebase/` — Firebase-specific security, auth, and database templates

#### Code Examples
- `next-route-handler.ts` — Secure Next.js API route pattern
- `rate-limit.ts` — Rate limiting middleware with Upstash Redis
- `zod-validate.ts` — Reusable Zod validation patterns
- `supabase-rls.sql` — Common RLS policy patterns
- `firebase-rules.txt` — Common Firestore security rules
