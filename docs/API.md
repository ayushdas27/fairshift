# FairShift REST API Documentation (v1.0.0)

All endpoints are versioned under `/api/v1` and return strict JSON payloads. Interactive Swagger UI is accessible at `/docs`.

---

## 1. Authentication
- `POST /api/v1/auth/login`: Authenticate worker or administrator with identifier, password, and optional org code.
- `POST /api/v1/auth/logout`: Discard session.
- `GET /api/v1/auth/me`: Retrieve current user profile and role.

## 2. Attendance & Shifts
- `GET /api/v1/attendance`: View attendance history (workers view self; supervisors view organization).
- `POST /api/v1/attendance/check-in`: Clock in with QR token. Guards against duplicate active shifts.
- `POST /api/v1/attendance/check-out`: Clock out. Recalculates regular minutes, overtime minutes, and triggers fatigue rule engine.
- `GET /api/v1/attendance/summary`: Return aggregated duration and active shift telemetry.
- `POST /api/v1/attendance/corrections`: Submit audited attendance adjustment request.

## 3. Transparent Payroll
- `GET /api/v1/payroll/me`: Worker's itemized payslips with overtime parity breakdown.
- `GET /api/v1/payroll/me/{payslip_id}`: Single payslip detail (cross-worker access strictly denied).
- `GET /api/v1/payroll/admin/all`: Authorized HR & Admin view of all organization payslips.
- `POST /api/v1/payroll/periods/{period_id}/calculate`: Batch recalculation with 1.5x overtime multiplier.
- `POST /api/v1/payroll/payslips/{payslip_id}/approve`: Authorize payslip and write to audit log.

## 4. Grievances & Safety Cases
- `POST /api/v1/grievances`: Submit confidential worker report.
- `POST /api/v1/grievances/anonymous`: Unauthenticated zero-identity submission. Returns unique tracking reference and secret.
- `POST /api/v1/grievances/track`: Look up case status and resolution notes using tracking number and secret.
- `GET /api/v1/grievances/me`: Authenticated worker's personal confidential reports.
- `GET /api/v1/grievances/admin/all`: Restricted queue for Safety Officers and Admins.
- `POST /api/v1/grievances/admin/{id}/status`: Advance case through lifecycle (`Submitted` -> `Acknowledged` -> `Under Review` -> `Action in Progress` -> `Resolved`).

## 5. Anonymous Feedback
- `POST /api/v1/feedback`: Record anonymous feedback and star rating (1-5).
- `GET /api/v1/feedback/admin/summary`: Aggregate feedback statistics and sentiment distribution.

## 6. Skill Passport
- `GET /api/v1/skills/me`: View worker skills and verification status.
- `POST /api/v1/skills`: Add certification or training.
- `POST /api/v1/skills/{id}/verify`: Authorized verification by Safety Lead.
- `GET /api/v1/skills/me/export`: Export structured, tamper-evident JSON skill passport.

## 7. Employer Operations Console
- `GET /api/v1/dashboard/overview`: Real-time bento metrics (active workforce, station rate, overtime delta, open safety reports, fatigue alerts, pay equity index).
- `GET /api/v1/organisations`: List organizations and switch industry configuration.
