from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user, require_roles
from backend.app.models.models import (
    User, AttendanceRecord, AttendanceCorrection, OrganizationSettings, FatigueAlert
)
from backend.app.schemas.schemas import (
    AttendanceCheckInRequest, AttendanceCheckOutRequest, AttendanceOut,
    AttendanceSummaryOut, AttendanceCorrectionRequest, AttendanceCorrectionOut
)

router = APIRouter()

@router.get("", response_model=List[AttendanceOut])
def get_attendance_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Workers only see their own attendance; supervisors/admins see org attendance
    query = db.query(AttendanceRecord).filter(AttendanceRecord.org_id == current_user.org_id)
    if current_user.role == "worker":
        query = query.filter(AttendanceRecord.user_id == current_user.id)
    records = query.order_by(AttendanceRecord.clock_in.desc()).limit(limit).all()
    
    # Enrich with worker names
    result = []
    for r in records:
        out = AttendanceOut.model_validate(r)
        u = db.query(User).filter(User.id == r.user_id).first()
        out.worker_name = u.full_name if u else "Worker"
        result.append(out)
    return result

@router.post("/check-in", response_model=AttendanceOut)
def check_in(
    req: AttendanceCheckInRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Guard against duplicate active shifts
    active = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.status == "active"
    ).first()
    if active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duplicate check-in rejected: You already have an active shift clocked in."
        )

    # 2. QR Verification if supplied
    if req.qr_token and not (req.qr_token.startswith("FS-") or req.qr_token.startswith("QR-")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid QR check-in token."
        )

    now = datetime.now(timezone.utc)
    record = AttendanceRecord(
        user_id=current_user.id,
        org_id=current_user.org_id,
        work_site_id=req.work_site_id or current_user.work_site_id,
        clock_in=now,
        status="active",
        qr_token=req.qr_token or "STATION-VERIFIED",
        notes="Clock-in verified via server telemetry"
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    out = AttendanceOut.model_validate(record)
    out.worker_name = current_user.full_name
    return out

@router.post("/check-out", response_model=AttendanceOut)
def check_out(
    req: AttendanceCheckOutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Must have an active shift
    record = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.status == "active"
    ).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active shift found. You cannot check out without checking in first."
        )

    now = datetime.now(timezone.utc)
    record.clock_out = now
    record.status = "completed"
    if req.notes:
        record.notes = (record.notes or "") + " | Out: " + req.notes

    # 2. Authoritative duration calculation
    delta = record.clock_out - record.clock_in
    duration_mins = max(1, int(delta.total_seconds() / 60))
    record.duration_minutes = duration_mins

    # Load organization settings for standard shift thresholds
    settings = db.query(OrganizationSettings).filter(
        OrganizationSettings.org_id == current_user.org_id
    ).first()
    standard_mins = int((settings.standard_hours_per_day if settings else 8.0) * 60)

    if duration_mins <= standard_mins:
        record.regular_minutes = duration_mins
        record.overtime_minutes = 0
    else:
        record.regular_minutes = standard_mins
        record.overtime_minutes = duration_mins - standard_mins

    # 3. Fatigue Rule Engine Check
    fatigue_threshold = (settings.fatigue_threshold_hours if settings else 10.0) * 60
    if duration_mins >= fatigue_threshold:
        alert = FatigueAlert(
            org_id=current_user.org_id,
            user_id=current_user.id,
            rule_triggered="Excessive consecutive hours (>10h threshold)",
            severity="Warning" if duration_mins < 720 else "Critical",
            work_hours_consecutive=round(duration_mins / 60.0, 1),
            recommended_action="Mandatory 12-hour recovery rest before next scheduled shift.",
            status="Active"
        )
        db.add(alert)

    db.commit()
    db.refresh(record)

    out = AttendanceOut.model_validate(record)
    out.worker_name = current_user.full_name
    return out

@router.get("/summary", response_model=AttendanceSummaryOut)
def get_attendance_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    active = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.status == "active"
    ).first()
    
    completed = db.query(AttendanceRecord).filter(
        AttendanceRecord.user_id == current_user.id,
        AttendanceRecord.status == "completed"
    ).all()

    total_mins = sum(r.duration_minutes for r in completed)
    regular_mins = sum(r.regular_minutes for r in completed)
    ot_mins = sum(r.overtime_minutes for r in completed)

    active_out = None
    if active:
        active_out = AttendanceOut.model_validate(active)
        active_out.worker_name = current_user.full_name

    return AttendanceSummaryOut(
        total_hours=round(total_mins / 60.0, 2),
        regular_hours=round(regular_mins / 60.0, 2),
        overtime_hours=round(ot_mins / 60.0, 2),
        active_shift=active_out,
        attendance_count=len(completed)
    )

@router.post("/corrections", response_model=AttendanceCorrectionOut)
def request_correction(
    req: AttendanceCorrectionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attendance = db.query(AttendanceRecord).filter(
        AttendanceRecord.id == req.attendance_id,
        AttendanceRecord.org_id == current_user.org_id
    ).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found.")

    if current_user.role == "worker" and attendance.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot request corrections for another worker.")

    correction = AttendanceCorrection(
        attendance_id=req.attendance_id,
        user_id=current_user.id,
        requested_clock_in=req.requested_clock_in,
        requested_clock_out=req.requested_clock_out,
        reason=req.reason,
        status="pending"
    )
    db.add(correction)
    db.commit()
    db.refresh(correction)
    return AttendanceCorrectionOut.model_validate(correction)
