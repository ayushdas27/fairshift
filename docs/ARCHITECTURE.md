# FairShift Architecture Specification
**Theme:** UN Sustainable Development Goal 8: Decent Work & Economic Growth  
**Version:** 1.0.0 (Production Hackathon Prototype)

---

## 1. System Topology

FairShift is structured as a high-integrity modular monolith with strict separation between presentation, application services, domain models, and persistence.

```
                           +------------------------------------------+
                           |           Client Tier (React 19)         |
                           |  - Worker Mobile-First Portal            |
                           |  - Employer Executive Console            |
                           |  - Adaptive Viewport Zoom (80% - 150%)   |
                           |  - Multilingual (EN, HI, BN)             |
                           +--------------------+---------------------+
                                                | HTTPS / JSON
                                                v
                           +------------------------------------------+
                           |          FastAPI API Gateway             |
                           |  - CORS, Rate Limiting, Security Headers |
                           |  - Argon2id Password Hashing / JWT Auth  |
                           |  - Multi-tenant Org Scoping Middleware   |
                           +--------------------+---------------------+
                                                |
               +--------------------------------+--------------------------------+
               |                                |                                |
               v                                v                                v
     +-------------------+            +-------------------+            +-------------------+
     | Attendance & QR   |            | Transparent Wages |            | Confidential      |
     | Engine            |            | & Overtime Logic  |            | Grievances & Safe |
     | - Server-clocked  |            | - Decimal Math    |            | Anonymous Reports |
     | - Duplicate Guard |            | - Salaried/Hourly |            | - Unpredictable ID|
     +---------+---------+            +---------+---------+            +---------+---------+
               |                                |                                |
               +--------------------------------+--------------------------------+
                                                |
                                                v
                           +------------------------------------------+
                           |        SQLAlchemy 2.0 ORM Engine         |
                           |  - Connection Pool                       |
                           |  - Strict Foreign Keys & Unique Indexes  |
                           +--------------------+---------------------+
                                                |
                                                v
                           +------------------------------------------+
                           |    PostgreSQL Database (or SQLite Dev)   |
                           |  - Organisations, Users, Roles           |
                           |  - Shifts, Attendance, Payslips          |
                           |  - Grievances, Skills, Fatigue Alerts    |
                           +------------------------------------------+
```

---

## 2. Core Entities & Relationships

1. **`organisations`**: Multi-tenant boundary (`id`, `name`, `industry` ['construction', 'college'], `created_at`).
2. **`organisation_settings`**: Configurable shift policies, standard hours (e.g. 8h), overtime multiplier (e.g. 1.5x), fatigue threshold (e.g. 10h), check-in geofence radius.
3. **`users`**: Authentication credentials (`id`, `email`, `employee_code`, `hashed_password`, `full_name`, `phone`, `role`, `org_id`, `preferred_lang`, `is_active`).
4. **`worker_profiles`**: Extended worker telemetry (`user_id`, `department_id`, `hourly_rate`, `monthly_base`, `pay_model`, `station_code`).
5. **`departments` & `work_sites`**: Grouping entities for construction zones and university facilities.
6. **`shifts`**: Scheduled shifts with start/end windows.
7. **`attendance_records`**: Clock-in/out telemetry (`id`, `user_id`, `org_id`, `clock_in`, `clock_out`, `duration_minutes`, `regular_minutes`, `overtime_minutes`, `status`, `qr_token`).
8. **`attendance_corrections`**: Supervisor-audited adjustment requests.
9. **`salary_policies`**: Configurable pay guidelines and statutory deduction rules.
10. **`payroll_periods`**: Pay periods (e.g., Oct 1 - Oct 14).
11. **`payslips`**: Immutable, worker-visible calculation breakdowns with decimal arithmetic (`gross_pay`, `overtime_pay`, `allowances`, `deductions`, `net_pay`, `calculation_notes`).
12. **`payslip_line_items`**: Itemized lines (e.g., Base hours, Overtime 1.5x, Safety stipend, Uniform deduction).
13. **`grievances`**: High-privacy reports (`tracking_number`, `tracking_secret_hash`, `org_id`, `is_anonymous`, `reporter_id` [NULL for anonymous], `category`, `description`, `status`, `severity`, `resolution_notes`).
14. **`grievance_status_history`**: Audit trail of stage changes (Submitted -> Acknowledged -> Under Review -> Action in Progress -> Resolved).
15. **`anonymous_feedback`**: Pure unlinked worker sentiment and workplace evaluation.
16. **`skills` & `worker_skill_records`**: Worker-owned portable skill passport (`skill_name`, `issuing_org`, `issue_date`, `expiry_date`, `verification_status`).
17. **`fatigue_alerts`**: Objective work-hour risk events (`user_id`, `rule_triggered`, `severity`, `shift_duration_hours`, `recommended_action`, `status`).

---

## 3. Security Boundary & Privacy Model

- **Multi-tenant Organization Scoping:** Every authenticated database read/write strictly scopes queries with `WHERE org_id = current_user.org_id`.
- **Worker Self-Record Isolation:** Non-admin workers can only access rows where `user_id == current_user.id` (payslips, attendance, skills).
- **Grievance Confidentiality:** Anonymous reports decouple `reporter_id` entirely (stored as `NULL`). Reports are referenced by a high-entropy tracking code + salted hash. General supervisors cannot enumerate or view confidential reporter identities.
- **Financial Precision:** Currency values use `Numeric(12, 2)` or integer cents with Python `Decimal` objects to prevent floating-point calculation errors.
- **Authoritative Server Clock:** Client timestamps are discarded; server UTC timestamps drive all shift calculations.
