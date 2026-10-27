from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from backend.app.core.security import hash_password, hash_tracking_secret
from backend.app.models.models import (
    Organization, OrganizationSettings, Department, WorkSite, User, WorkerProfile,
    Shift, AttendanceRecord, PayrollPeriod, Payslip, PayslipLineItem,
    Grievance, GrievanceStatusHistory, AnonymousFeedback, WorkerSkillRecord, FatigueAlert
)

def seed_demo_data(db: Session):
    # Check if already seeded
    if db.query(Organization).first():
        return

    # ==========================================
    # 1. CONSTRUCTION COMPANY: Apex Buildcon
    # ==========================================
    org_const = Organization(
        name="Apex Buildcon Infrastructure",
        code="APEX-BLD",
        industry="construction"
    )
    db.add(org_const)
    db.flush()

    settings_const = OrganizationSettings(
        org_id=org_const.id,
        standard_hours_per_day=8.0,
        overtime_multiplier=1.5,
        fatigue_threshold_hours=10.0,
        geofence_lat=40.7128,
        geofence_lng=-74.0060,
        geofence_radius_meters=500.0,
        require_location=True,
        allow_anonymous_grievance=True
    )
    db.add(settings_const)

    dept_const_1 = Department(org_id=org_const.id, name="Structural Steel & Scaffolding", code="STEEL")
    dept_const_2 = Department(org_id=org_const.id, name="Heavy Equipment Operations", code="HEAVY")
    dept_const_3 = Department(org_id=org_const.id, name="Site Safety & Health", code="SAFETY")
    db.add_all([dept_const_1, dept_const_2, dept_const_3])
    db.flush()

    site_const = WorkSite(
        org_id=org_const.id,
        name="Downtown SkyTower Construction Hub B",
        code="HUB-B",
        address="Sector 14, Commercial Corridor"
    )
    db.add(site_const)
    db.flush()

    # Construction Admin
    admin_const = User(
        org_id=org_const.id,
        email="m.adams@facility.fairshift.org",
        employee_code="ADM-7104",
        hashed_password=hash_password("FairShift@2026"),
        full_name="Morgan Vance",
        phone="+1 (555) 019-1100",
        role="admin",
        department_id=dept_const_3.id,
        work_site_id=site_const.id,
        preferred_lang="en"
    )
    db.add(admin_const)

    # Construction Worker: Elena Rostova
    worker_const = User(
        org_id=org_const.id,
        email="elena.rostova@facility.fairshift.org",
        employee_code="EMP-88204",
        hashed_password=hash_password("FairShift@2026"),
        full_name="Elena Rostova",
        phone="+1 (555) 019-2831",
        role="worker",
        department_id=dept_const_2.id,
        work_site_id=site_const.id,
        preferred_lang="en"
    )
    db.add(worker_const)
    db.flush()

    worker_const_profile = WorkerProfile(
        user_id=worker_const.id,
        hourly_rate=22.50,
        monthly_base=3600.0,
        pay_model="hourly",
        station_code="Station 4B",
        tier="Charter Verified Tier 1"
    )
    db.add(worker_const_profile)

    # Active Shift for Elena Rostova
    now = datetime.now(timezone.utc)
    active_att = AttendanceRecord(
        user_id=worker_const.id,
        org_id=org_const.id,
        work_site_id=site_const.id,
        clock_in=now - timedelta(hours=4, minutes=18),
        duration_minutes=258,
        regular_minutes=258,
        overtime_minutes=0,
        status="active",
        qr_token="FS-HUB-B-STATION-4B",
        notes="Geo-fence Verified: Hub B Perimeter • Station 4B"
    )
    db.add(active_att)

    # Previous Completed Shifts
    for days_ago, dur, ot in [(1, 510, 30), (2, 480, 0), (3, 540, 60), (4, 480, 0), (5, 480, 0)]:
        c_in = now - timedelta(days=days_ago, hours=8)
        c_out = c_in + timedelta(minutes=dur)
        db.add(AttendanceRecord(
            user_id=worker_const.id,
            org_id=org_const.id,
            work_site_id=site_const.id,
            clock_in=c_in,
            clock_out=c_out,
            duration_minutes=dur,
            regular_minutes=dur - ot,
            overtime_minutes=ot,
            status="completed",
            qr_token="FS-HUB-B-GATE",
            notes="Biometric scanner validated"
        ))

    # Payroll Period
    period_start = now - timedelta(days=14)
    period_end = now
    period = PayrollPeriod(
        org_id=org_const.id,
        period_start=period_start,
        period_end=period_end,
        label="Oct 1 – Oct 14",
        status="active"
    )
    db.add(period)
    db.flush()

    # Transparent Payslip matching UI design
    # Base: 76.0 hrs @ $22.50 = $1,710.00
    # Overtime: 4.5 hrs @ $33.75 (1.5x) = $151.88
    # Meal / Site Allowance: $40.00
    # Gross: $1,901.88
    # Statutory Deductions: $59.38
    # Net: $1,842.50
    payslip = Payslip(
        org_id=org_const.id,
        payroll_period_id=period.id,
        user_id=worker_const.id,
        base_hours=76.0,
        base_rate=22.50,
        base_pay=1710.00,
        overtime_hours=4.5,
        overtime_rate=33.75,
        overtime_earnings=151.88,
        allowances=40.00,
        deductions=59.38,
        gross_pay=1901.88,
        net_pay=1842.50,
        status="approved",
        calculation_notes="Accumulated across 10 completed cycles + verified overtime parity (1.5x). Payout scheduled Friday via Direct Deposit (••9021).",
        approved_by=admin_const.id,
        approved_at=now - timedelta(days=1)
    )
    db.add(payslip)
    db.flush()

    db.add_all([
        PayslipLineItem(
            payslip_id=payslip.id,
            item_type="base",
            label="Base Hourly Standard Tier",
            amount=1710.00,
            rate_or_units="76.0 hrs @ $22.50/hr"
        ),
        PayslipLineItem(
            payslip_id=payslip.id,
            item_type="overtime",
            label="Overtime Parity (1.5x Multiplier)",
            amount=151.88,
            rate_or_units="4.5 hrs @ $33.75/hr"
        ),
        PayslipLineItem(
            payslip_id=payslip.id,
            item_type="allowance",
            label="Mandatory Meal & Safety Stipend",
            amount=40.00,
            rate_or_units="Bi-weekly allotment"
        ),
        PayslipLineItem(
            payslip_id=payslip.id,
            item_type="deduction",
            label="Statutory Safety Insurance Contribution",
            amount=59.38,
            rate_or_units="State labor rate"
        )
    ])

    # Grievances
    g1 = Grievance(
        org_id=org_const.id,
        tracking_number="FS-88419",
        tracking_secret_hash=hash_tracking_secret("SEC-demo-secret-1"),
        is_anonymous=False,
        reporter_id=worker_const.id,
        category="Workplace Safety Hazard",
        description="Scaffolding guard rails on 14th floor exterior platform have missing locking pins. High wind hazard.",
        status="Under Review",
        severity="High"
    )
    db.add(g1)
    db.flush()
    db.add(GrievanceStatusHistory(
        grievance_id=g1.id,
        status="Under Review",
        actor_role="Safety Officer (K. Miller)",
        notes="Inspected perimeter; temporary scaffolding halted pending replacement pins."
    ))

    g2 = Grievance(
        org_id=org_const.id,
        tracking_number="FS-91044",
        tracking_secret_hash=hash_tracking_secret("SEC-demo-secret-2"),
        is_anonymous=True,
        reporter_id=None,
        category="Missing Protective Equipment",
        description="Respirator filters for spray insulation ran out on Wednesday.",
        status="Resolved",
        severity="Standard",
        resolution_notes="New NIOSH N95/P100 filter batch restocked in Safety Locker #2."
    )
    db.add(g2)
    db.flush()
    db.add(GrievanceStatusHistory(
        grievance_id=g2.id,
        status="Resolved",
        actor_role="Facility Manager",
        notes="Full supply replenished."
    ))

    # Worker Skills
    db.add_all([
        WorkerSkillRecord(
            user_id=worker_const.id,
            skill_name="Heavy Crane & Rigging Specialist",
            issuing_org="National Commission for Heavy Certification",
            issue_date="2024-03-15",
            expiry_date="2027-03-15",
            verification_status="Verified",
            verified_by="Safety Lead (K. Miller)",
            certificate_number="NCC-RIG-90812"
        ),
        WorkerSkillRecord(
            user_id=worker_const.id,
            skill_name="OSHA 30-Hour Construction Safety",
            issuing_org="Occupational Safety & Health Administration",
            issue_date="2023-11-10",
            expiry_date="2028-11-10",
            verification_status="Verified",
            verified_by="Auditor General",
            certificate_number="OSHA-30-77192"
        ),
        WorkerSkillRecord(
            user_id=worker_const.id,
            skill_name="Scaffolding Hazard Awareness Level 2",
            issuing_org="Guild of Safety Engineers",
            issue_date="2024-08-01",
            expiry_date="2026-08-01",
            verification_status="Pending",
            certificate_number="SCAF-LVL2-441"
        )
    ])

    # Fatigue Alert
    db.add(FatigueAlert(
        org_id=org_const.id,
        user_id=worker_const.id,
        rule_triggered="Repeated 10h+ shift without mandatory 12h turnaround",
        severity="Warning",
        work_hours_consecutive=10.5,
        recommended_action="Mandatory 12-hour rest window enforced before next shift.",
        status="Active"
    ))

    # Anonymous Feedback
    db.add_all([
        AnonymousFeedback(
            org_id=org_const.id,
            category="Workplace Safety",
            rating=5,
            feedback_text="Immediate action on guard rail reports gave our crew real peace of mind.",
            industry="construction"
        ),
        AnonymousFeedback(
            org_id=org_const.id,
            category="Salary Transparency",
            rating=5,
            feedback_text="Being able to see base and overtime calculations clearly on the phone eliminates wage doubt.",
            industry="construction"
        ),
        AnonymousFeedback(
            org_id=org_const.id,
            category="Shift Scheduling",
            rating=4,
            feedback_text="Shift rotations are fair and predictable.",
            industry="construction"
        )
    ])

    # ==========================================
    # 2. COLLEGE / UNIVERSITY: Metropolitan University
    # ==========================================
    org_college = Organization(
        name="Metropolitan University Campus Services",
        code="METRO-UNI",
        industry="college"
    )
    db.add(org_college)
    db.flush()

    settings_college = OrganizationSettings(
        org_id=org_college.id,
        standard_hours_per_day=8.0,
        overtime_multiplier=1.5,
        fatigue_threshold_hours=10.0,
        require_location=False,
        allow_anonymous_grievance=True
    )
    db.add(settings_college)

    dept_col_1 = Department(org_id=org_college.id, name="Campus Security & Patrol", code="SEC")
    dept_col_2 = Department(org_id=org_college.id, name="Environmental Housekeeping", code="HOUSE")
    dept_col_3 = Department(org_id=org_college.id, name="Groundskeeping & Facilities Maintenance", code="GROUND")
    db.add_all([dept_col_1, dept_col_2, dept_col_3])
    db.flush()

    site_col = WorkSite(
        org_id=org_college.id,
        name="Central Quad & Science Complex",
        code="QUAD-MAIN",
        address="University Avenue, Gate 3"
    )
    db.add(site_col)
    db.flush()

    # College Admin
    admin_college = User(
        org_id=org_college.id,
        email="admin@metrouni.edu",
        employee_code="ADM-8801",
        hashed_password=hash_password("FairShift@2026"),
        full_name="Dr. Patricia Chen",
        phone="+1 (555) 018-9922",
        role="admin",
        department_id=dept_col_1.id,
        work_site_id=site_col.id,
        preferred_lang="en"
    )
    db.add(admin_college)

    # College Worker: Rahul Sharma
    worker_college = User(
        org_id=org_college.id,
        email="rahul.sharma@metrouni.edu",
        employee_code="EMP-91402",
        hashed_password=hash_password("FairShift@2026"),
        full_name="Rahul Sharma",
        phone="+1 (555) 018-4421",
        role="worker",
        department_id=dept_col_2.id,
        work_site_id=site_col.id,
        preferred_lang="hi"
    )
    db.add(worker_college)
    db.flush()

    worker_college_profile = WorkerProfile(
        user_id=worker_college.id,
        hourly_rate=19.50,
        monthly_base=3120.0,
        pay_model="hourly",
        station_code="Zone C-3 Science Hall",
        tier="Campus Services Staff"
    )
    db.add(worker_college_profile)

    # College Payslip
    period_col = PayrollPeriod(
        org_id=org_college.id,
        period_start=period_start,
        period_end=period_end,
        label="Oct 1 – Oct 14",
        status="active"
    )
    db.add(period_col)
    db.flush()

    payslip_col = Payslip(
        org_id=org_college.id,
        payroll_period_id=period_col.id,
        user_id=worker_college.id,
        base_hours=80.0,
        base_rate=19.50,
        base_pay=1560.00,
        overtime_hours=2.0,
        overtime_rate=29.25,
        overtime_earnings=58.50,
        allowances=30.00,
        deductions=48.50,
        gross_pay=1648.50,
        net_pay=1600.00,
        status="approved",
        calculation_notes="Standard bi-weekly staff cycle. Night maintenance shift differential included.",
        approved_by=admin_college.id,
        approved_at=now - timedelta(days=2)
    )
    db.add(payslip_col)

    # College Feedback
    db.add(AnonymousFeedback(
        org_id=org_college.id,
        category="Facilities & Workload",
        rating=5,
        feedback_text="Fair shift rotation has made student exam-week cleanups much more manageable.",
        industry="college"
    ))

    db.commit()
