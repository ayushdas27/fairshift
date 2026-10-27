# FairShift Application Security & Privacy Architecture
**Focus:** UN SDG 8 — Zero-Retaliation, Worker Identity Privacy, and Tamper-Proof Wages

---

## 1. Threat Model & Key Assets

1. **Worker Anonymity & Protection Against Retaliation:** Workers reporting hazardous scaffolding, missing protective equipment, or excessive hours must have complete guarantee that reports cannot be traced back to their employment profile unless they deliberately select confidential mode.
2. **Wage Integrity:** Payslips and overtime multiplier records (1.5x) must be immune to client manipulation. All durations and earnings calculations are executed server-side using UTC timestamps and strict decimal arithmetic.
3. **Multi-Tenant Scoping:** Cross-tenant leakage between organisations (e.g. Construction vs University) is strictly prevented at the ORM query level (`WHERE org_id = current_user.org_id`).

---

## 2. Implemented Security Controls

- **Password Hashing:** Argon2id (`$argon2id$v=19$m=65536,t=3,p=4`) via `argon2-cffi` with salt generation and constant-time comparison.
- **Session & Identity Tokens:** Standard JWT Bearer tokens signed with HMAC-SHA256 and configurable expiry (`ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Zero-Identity Anonymous Reporting:**
  - `reporter_id` column is explicitly set to `NULL` in the database.
  - Tracking numbers (`FS-XXXXXX`) and secrets (`SEC-XXXX`) are generated using Python's cryptographically secure pseudo-random number generator (`secrets.token_urlsafe(16)`).
  - Only the SHA-256 salted hash of the tracking secret (`hash_tracking_secret`) is persisted in the database, preventing tracking credential leaks even in the event of database dumps.
- **Role-Based Access Control (RBAC):**
  - Roles: `worker`, `supervisor`, `hr_payroll`, `safety_officer`, `admin`.
  - Enforced via FastAPI dependencies (`require_roles([...])`).
  - Workers attempting to view another worker's payslip or access admin case queues receive HTTP 403 Forbidden.
- **Tamper-Proof Financial Math:**
  - All overtime and wage computations utilize Python `Decimal` with `ROUND_HALF_UP` to prevent floating-point rounding errors.
  - Workers cannot alter approved payroll states.
- **Server Clock Authority:**
  - Client-submitted clock timestamps are discarded. All attendance clock-ins and clock-outs are timestamped using authoritative server UTC time.
