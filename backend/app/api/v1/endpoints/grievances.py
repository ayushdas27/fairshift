import secrets
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user, require_roles
from backend.app.core.security import hash_tracking_secret, verify_tracking_secret
from backend.app.models.models import (
    User, Grievance, GrievanceStatusHistory, Organization, AuditLog
)
from backend.app.schemas.schemas import (
    GrievanceCreateRequest, AnonymousGrievanceCreateRequest, GrievanceSubmissionReceipt,
    GrievanceOut, GrievanceTrackRequest, GrievanceStatusUpdateRequest
)

router = APIRouter()

def generate_case_credentials() -> tuple[str, str]:
    # Unpredictable random 6-digit code + high-entropy secret
    case_num = f"FS-{secrets.randbelow(899999) + 100000}"
    case_secret = f"SEC-{secrets.token_urlsafe(16)}"
    return case_num, case_secret

@router.post("", response_model=GrievanceSubmissionReceipt)
def submit_confidential_grievance(
    req: GrievanceCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    case_num, case_secret = generate_case_credentials()
    secret_hash = hash_tracking_secret(case_secret)

    grievance = Grievance(
        org_id=current_user.org_id,
        tracking_number=case_num,
        tracking_secret_hash=secret_hash,
        is_anonymous=False,
        reporter_id=current_user.id,
        category=req.category,
        description=req.description,
        severity=req.severity or "Standard",
        status="Submitted"
    )
    db.add(grievance)
    db.flush()

    history = GrievanceStatusHistory(
        grievance_id=grievance.id,
        status="Submitted",
        actor_role="Worker (Confidential)",
        notes="Case registered into FairShift integrity queue."
    )
    db.add(history)
    db.commit()

    return GrievanceSubmissionReceipt(
        tracking_number=case_num,
        tracking_secret=case_secret,
        message="Confidential workplace issue submitted securely.",
        instructions="Save your Tracking Number and Secret Key. You will need both to view status updates."
    )

@router.post("/anonymous", response_model=GrievanceSubmissionReceipt)
def submit_anonymous_grievance(
    req: AnonymousGrievanceCreateRequest,
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.code == req.org_code.upper()).first()
    if not org:
        raise HTTPException(
            status_code=404,
            detail=f"Facility/Site Code '{req.org_code}' not recognized."
        )

    case_num, case_secret = generate_case_credentials()
    secret_hash = hash_tracking_secret(case_secret)

    grievance = Grievance(
        org_id=org.id,
        tracking_number=case_num,
        tracking_secret_hash=secret_hash,
        is_anonymous=True,
        reporter_id=None,  # STRICT PRIVACY: NULL
        category=req.category,
        description=req.description,
        severity=req.severity or "Standard",
        status="Submitted"
    )
    db.add(grievance)
    db.flush()

    history = GrievanceStatusHistory(
        grievance_id=grievance.id,
        status="Submitted",
        actor_role="Anonymous Reporter",
        notes="Zero-identity report registered."
    )
    db.add(history)
    db.commit()

    return GrievanceSubmissionReceipt(
        tracking_number=case_num,
        tracking_secret=case_secret,
        message="Anonymous safety report submitted with full identity decoupling.",
        instructions="Store your Tracking Number and Secret Key securely. No login or email is linked."
    )

@router.post("/track", response_model=GrievanceOut)
def track_report_status(
    req: GrievanceTrackRequest,
    db: Session = Depends(get_db)
):
    grievance = db.query(Grievance).filter(
        Grievance.tracking_number == req.tracking_number.strip().upper()
    ).first()
    if not grievance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found. Please verify tracking number."
        )

    if not verify_tracking_secret(req.tracking_secret.strip(), grievance.tracking_secret_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid tracking secret. Access denied."
        )

    return GrievanceOut.model_validate(grievance)

@router.get("/me", response_model=List[GrievanceOut])
def get_my_confidential_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    records = db.query(Grievance).filter(
        Grievance.reporter_id == current_user.id,
        Grievance.org_id == current_user.org_id
    ).order_by(Grievance.created_at.desc()).all()
    return [GrievanceOut.model_validate(r) for r in records]

@router.get("/admin/all", response_model=List[GrievanceOut])
def get_all_cases_admin(
    current_user: User = Depends(require_roles(["safety_officer", "admin"])),
    db: Session = Depends(get_db)
):
    records = db.query(Grievance).filter(
        Grievance.org_id == current_user.org_id
    ).order_by(Grievance.created_at.desc()).all()
    return [GrievanceOut.model_validate(r) for r in records]

@router.post("/admin/{grievance_id}/status", response_model=GrievanceOut)
def update_case_status(
    grievance_id: str,
    req: GrievanceStatusUpdateRequest,
    current_user: User = Depends(require_roles(["safety_officer", "admin"])),
    db: Session = Depends(get_db)
):
    valid_statuses = ["Submitted", "Acknowledged", "Under Review", "Action in Progress", "Resolved"]
    if req.status not in valid_statuses:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status '{req.status}'. Allowed: {valid_statuses}"
        )

    grievance = db.query(Grievance).filter(
        Grievance.id == grievance_id,
        Grievance.org_id == current_user.org_id
    ).first()
    if not grievance:
        raise HTTPException(status_code=404, detail="Case not found.")

    grievance.status = req.status
    grievance.updated_at = datetime.now(timezone.utc)
    if req.resolution_notes:
        grievance.resolution_notes = req.resolution_notes

    history = GrievanceStatusHistory(
        grievance_id=grievance.id,
        status=req.status,
        actor_role=f"{current_user.role} ({current_user.full_name})",
        notes=req.notes or f"Status advanced to {req.status}"
    )
    db.add(history)

    audit = AuditLog(
        org_id=current_user.org_id,
        actor_id=current_user.id,
        action="UPDATE_GRIEVANCE_STATUS",
        resource=f"Grievance:{grievance.tracking_number}",
        details=f"Status set to {req.status}"
    )
    db.add(audit)
    db.commit()
    db.refresh(grievance)

    return GrievanceOut.model_validate(grievance)
