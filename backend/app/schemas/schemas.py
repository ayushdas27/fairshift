from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"

class LoginRequest(BaseModel):
    identifier: str
    password: str
    org_code: Optional[str] = None

class UserOut(BaseModel):
    id: str
    org_id: str
    email: str
    employee_code: str
    full_name: str
    phone: Optional[str] = None
    role: str
    department_id: Optional[str] = None
    work_site_id: Optional[str] = None
    preferred_lang: str
    is_active: bool
    station_code: Optional[str] = None
    tier: Optional[str] = None
    org_name: Optional[str] = None
    org_industry: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

# Attendance Schemas
class AttendanceCheckInRequest(BaseModel):
    qr_token: Optional[str] = None
    work_site_id: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None

class AttendanceCheckOutRequest(BaseModel):
    notes: Optional[str] = None

class AttendanceOut(BaseModel):
    id: str
    user_id: str
    org_id: str
    clock_in: datetime
    clock_out: Optional[datetime] = None
    duration_minutes: int
    regular_minutes: int
    overtime_minutes: int
    status: str
    qr_token: Optional[str] = None
    notes: Optional[str] = None
    worker_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class AttendanceSummaryOut(BaseModel):
    total_hours: float
    regular_hours: float
    overtime_hours: float
    active_shift: Optional[AttendanceOut] = None
    attendance_count: int

class AttendanceCorrectionRequest(BaseModel):
    attendance_id: str
    requested_clock_in: datetime
    requested_clock_out: datetime
    reason: str

class AttendanceCorrectionOut(BaseModel):
    id: str
    attendance_id: str
    user_id: str
    requested_clock_in: datetime
    requested_clock_out: datetime
    reason: str
    status: str
    reviewed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Payroll Schemas
class PayslipLineItemOut(BaseModel):
    id: str
    item_type: str
    label: str
    amount: float
    rate_or_units: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PayslipOut(BaseModel):
    id: str
    org_id: str
    payroll_period_id: str
    user_id: str
    worker_name: Optional[str] = None
    period_label: Optional[str] = None
    base_hours: float
    base_rate: float
    base_pay: float
    overtime_hours: float
    overtime_rate: float
    overtime_earnings: float
    allowances: float
    deductions: float
    gross_pay: float
    net_pay: float
    status: str
    calculation_notes: Optional[str] = None
    approved_at: Optional[datetime] = None
    line_items: List[PayslipLineItemOut] = []

    model_config = ConfigDict(from_attributes=True)

class PayrollCalculateRequest(BaseModel):
    period_id: str

class PayrollPeriodOut(BaseModel):
    id: str
    org_id: str
    label: str
    period_start: datetime
    period_end: datetime
    status: str

    model_config = ConfigDict(from_attributes=True)

# Grievance Schemas
class GrievanceCreateRequest(BaseModel):
    category: str
    description: str
    severity: Optional[str] = "Standard"

class AnonymousGrievanceCreateRequest(BaseModel):
    org_code: str
    category: str
    description: str
    severity: Optional[str] = "Standard"

class GrievanceSubmissionReceipt(BaseModel):
    tracking_number: str
    tracking_secret: str
    message: str
    instructions: str

class GrievanceStatusHistoryOut(BaseModel):
    id: str
    status: str
    actor_role: str
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class GrievanceOut(BaseModel):
    id: str
    tracking_number: str
    is_anonymous: bool
    category: str
    description: str
    status: str
    severity: str
    resolution_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status_history: List[GrievanceStatusHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)

class GrievanceTrackRequest(BaseModel):
    tracking_number: str
    tracking_secret: str

class GrievanceStatusUpdateRequest(BaseModel):
    status: str
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None

# Feedback Schemas
class FeedbackCreateRequest(BaseModel):
    org_code: str
    category: str
    rating: int
    feedback_text: str

class FeedbackSummaryOut(BaseModel):
    total_responses: int
    average_rating: float
    sentiment_distribution: dict
    categories: dict
    industry: str

# Skills Schemas
class SkillCreateRequest(BaseModel):
    skill_name: str
    issuing_org: str
    issue_date: str
    expiry_date: Optional[str] = None
    certificate_number: Optional[str] = None

class SkillOut(BaseModel):
    id: str
    user_id: str
    skill_name: str
    issuing_org: str
    issue_date: str
    expiry_date: Optional[str] = None
    verification_status: str
    certificate_number: Optional[str] = None
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class SkillVerifyRequest(BaseModel):
    verification_status: str

# Dashboard Overview Schemas
class DashboardOverviewOut(BaseModel):
    active_workforce: int
    scheduled_workforce: int
    station_rate: float
    overtime_hours_logged: float
    overtime_delta: str
    open_safety_reports: int
    safety_severity_split: str
    fatigue_alerts_count: int
    pay_equity_index: float
    industry: str
    org_name: str
    recent_attendance: List[AttendanceOut] = []
    fatigue_alerts: List[dict] = []

# Organization Schemas
class OrganizationOut(BaseModel):
    id: str
    name: str
    code: str
    industry: str

    model_config = ConfigDict(from_attributes=True)
