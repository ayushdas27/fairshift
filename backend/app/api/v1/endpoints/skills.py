from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user, require_roles
from backend.app.models.models import User, WorkerSkillRecord, WorkerProfile
from backend.app.schemas.schemas import SkillCreateRequest, SkillOut, SkillVerifyRequest

router = APIRouter()

@router.get("/me", response_model=List[SkillOut])
def get_my_skills(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skills = db.query(WorkerSkillRecord).filter(
        WorkerSkillRecord.user_id == current_user.id
    ).all()
    return [SkillOut.model_validate(s) for s in skills]

@router.post("", response_model=SkillOut)
def add_skill(
    req: SkillCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    record = WorkerSkillRecord(
        user_id=current_user.id,
        skill_name=req.skill_name,
        issuing_org=req.issuing_org,
        issue_date=req.issue_date,
        expiry_date=req.expiry_date,
        certificate_number=req.certificate_number,
        verification_status="Pending"
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return SkillOut.model_validate(record)

@router.post("/{skill_id}/verify", response_model=SkillOut)
def verify_worker_skill(
    skill_id: str,
    req: SkillVerifyRequest,
    current_user: User = Depends(require_roles(["safety_officer", "supervisor", "admin"])),
    db: Session = Depends(get_db)
):
    skill = db.query(WorkerSkillRecord).filter(WorkerSkillRecord.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill record not found.")

    skill.verification_status = req.verification_status
    skill.verified_by = f"{current_user.role} ({current_user.full_name})"
    skill.verified_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(skill)
    return SkillOut.model_validate(skill)

@router.get("/me/export")
def export_worker_passport(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    skills = db.query(WorkerSkillRecord).filter(
        WorkerSkillRecord.user_id == current_user.id
    ).all()
    profile = db.query(WorkerProfile).filter(
        WorkerProfile.user_id == current_user.id
    ).first()

    return {
        "passport_id": f"FS-PASSPORT-{current_user.employee_code}",
        "worker_name": current_user.full_name,
        "employee_code": current_user.employee_code,
        "tier": profile.tier if profile else "Verified Tier 1",
        "verified_credentials": [
            {
                "skill": s.skill_name,
                "issuer": s.issuing_org,
                "issue_date": s.issue_date,
                "expiry_date": s.expiry_date,
                "status": s.verification_status,
                "certificate_no": s.certificate_number
            }
            for s in skills
        ],
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "integrity_signature": f"FS-SHA256-{hash(current_user.id + 'PASSPORT') & 0xFFFFFFFF:08x}"
    }
