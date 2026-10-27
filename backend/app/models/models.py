import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def gen_uuid():
    return str(uuid.uuid4())

class Organization(Base):
    __tablename__ = "organisations"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    name = Column(String(200), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    industry = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    settings = relationship("OrganizationSettings", back_populates="organization", uselist=False)
    departments = relationship("Department", back_populates="organization")
    work_sites = relationship("WorkSite", back_populates="organization")
    users = relationship("User", back_populates="organization")


class OrganizationSettings(Base):
    __tablename__ = "organisation_settings"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False, unique=True)
    standard_hours_per_day = Column(Float, default=8.0)
    overtime_multiplier = Column(Float, default=1.5)
    fatigue_threshold_hours = Column(Float, default=10.0)
    geofence_lat = Column(Float, nullable=True)
    geofence_lng = Column(Float, nullable=True)
    geofence_radius_meters = Column(Float, default=500.0)
    require_location = Column(Boolean, default=False)
    allow_anonymous_grievance = Column(Boolean, default=True)

    organization = relationship("Organization", back_populates="settings")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)

    organization = relationship("Organization", back_populates="departments")


class WorkSite(Base):
    __tablename__ = "work_sites"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    name = Column(String(150), nullable=False)
    code = Column(String(50), nullable=False)
    address = Column(String(255), nullable=True)

    organization = relationship("Organization", back_populates="work_sites")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    employee_code = Column(String(50), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(150), nullable=False)
    phone = Column(String(30), nullable=True)
    role = Column(String(50), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    work_site_id = Column(String(36), ForeignKey("work_sites.id"), nullable=True)
    preferred_lang = Column(String(10), default="en")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    organization = relationship("Organization", back_populates="users")
    profile = relationship("WorkerProfile", back_populates="user", uselist=False)
    attendance_records = relationship("AttendanceRecord", back_populates="user")
    payslips = relationship("Payslip", back_populates="user", foreign_keys="Payslip.user_id")
    skills = relationship("WorkerSkillRecord", back_populates="user")


class WorkerProfile(Base):
    __tablename__ = "worker_profiles"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    hourly_rate = Column(Float, default=22.50)
    monthly_base = Column(Float, default=3200.0)
    pay_model = Column(String(20), default="hourly")
    station_code = Column(String(50), default="Station 4B")
    tier = Column(String(50), default="Charter Verified Tier 1")

    user = relationship("User", back_populates="profile")


class Shift(Base):
    __tablename__ = "shifts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    title = Column(String(100), nullable=False)
    start_time = Column(String(10), nullable=False)
    end_time = Column(String(10), nullable=False)
    work_site_id = Column(String(36), ForeignKey("work_sites.id"), nullable=True)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    work_site_id = Column(String(36), ForeignKey("work_sites.id"), nullable=True)
    clock_in = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    clock_out = Column(DateTime, nullable=True)
    duration_minutes = Column(Integer, default=0)
    regular_minutes = Column(Integer, default=0)
    overtime_minutes = Column(Integer, default=0)
    status = Column(String(30), default="active")
    qr_token = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="attendance_records")
    corrections = relationship("AttendanceCorrection", back_populates="attendance_record")


class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    attendance_id = Column(String(36), ForeignKey("attendance_records.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    requested_clock_in = Column(DateTime, nullable=False)
    requested_clock_out = Column(DateTime, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(30), default="pending")
    reviewed_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime, nullable=True)

    attendance_record = relationship("AttendanceRecord", back_populates="corrections")


class PayrollPeriod(Base):
    __tablename__ = "payroll_periods"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    period_start = Column(DateTime, nullable=False)
    period_end = Column(DateTime, nullable=False)
    label = Column(String(100), nullable=False)
    status = Column(String(30), default="active")
    closed_at = Column(DateTime, nullable=True)

    payslips = relationship("Payslip", back_populates="payroll_period")


class Payslip(Base):
    __tablename__ = "payslips"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    payroll_period_id = Column(String(36), ForeignKey("payroll_periods.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    base_hours = Column(Float, default=0.0)
    base_rate = Column(Float, default=0.0)
    base_pay = Column(Float, default=0.0)
    overtime_hours = Column(Float, default=0.0)
    overtime_rate = Column(Float, default=0.0)
    overtime_earnings = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    gross_pay = Column(Float, default=0.0)
    net_pay = Column(Float, default=0.0)
    
    status = Column(String(30), default="draft")
    calculation_notes = Column(Text, nullable=True)
    approved_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="payslips", foreign_keys=[user_id])
    payroll_period = relationship("PayrollPeriod", back_populates="payslips")
    line_items = relationship("PayslipLineItem", back_populates="payslip")


class PayslipLineItem(Base):
    __tablename__ = "payslip_line_items"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    payslip_id = Column(String(36), ForeignKey("payslips.id"), nullable=False)
    item_type = Column(String(30), nullable=False)
    label = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    rate_or_units = Column(String(50), nullable=True)

    payslip = relationship("Payslip", back_populates="line_items")


class Grievance(Base):
    __tablename__ = "grievances"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    tracking_number = Column(String(50), unique=True, nullable=False)
    tracking_secret_hash = Column(String(255), nullable=False)
    is_anonymous = Column(Boolean, default=False)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(40), default="Submitted")
    severity = Column(String(30), default="Standard")
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    status_history = relationship("GrievanceStatusHistory", back_populates="grievance")


class GrievanceStatusHistory(Base):
    __tablename__ = "grievance_status_history"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    grievance_id = Column(String(36), ForeignKey("grievances.id"), nullable=False)
    status = Column(String(40), nullable=False)
    actor_role = Column(String(50), nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    grievance = relationship("Grievance", back_populates="status_history")


class AnonymousFeedback(Base):
    __tablename__ = "anonymous_feedback"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    category = Column(String(100), nullable=False)
    rating = Column(Integer, default=5)
    feedback_text = Column(Text, nullable=False)
    industry = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class WorkerSkillRecord(Base):
    __tablename__ = "worker_skill_records"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(150), nullable=False)
    issuing_org = Column(String(150), nullable=False)
    issue_date = Column(String(30), nullable=False)
    expiry_date = Column(String(30), nullable=True)
    verification_status = Column(String(30), default="Verified")
    verified_by = Column(String(100), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    certificate_number = Column(String(100), nullable=True)

    user = relationship("User", back_populates="skills")


class FatigueAlert(Base):
    __tablename__ = "fatigue_alerts"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    rule_triggered = Column(String(150), nullable=False)
    severity = Column(String(30), default="Warning")
    work_hours_consecutive = Column(Float, nullable=False)
    recommended_action = Column(String(200), nullable=False)
    status = Column(String(30), default="Active")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=gen_uuid)
    org_id = Column(String(36), ForeignKey("organisations.id"), nullable=False)
    actor_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    resource = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
