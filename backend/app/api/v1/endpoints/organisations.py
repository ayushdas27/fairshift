from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.models.models import Organization, OrganizationSettings, User
from backend.app.schemas.schemas import OrganizationOut

router = APIRouter()

@router.get("", response_model=List[OrganizationOut])
def list_organizations(db: Session = Depends(get_db)):
    orgs = db.query(Organization).all()
    return [OrganizationOut.model_validate(o) for o in orgs]

@router.get("/current")
def get_current_organization_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    settings = db.query(OrganizationSettings).filter(OrganizationSettings.org_id == current_user.org_id).first()
    return {
        "organization": OrganizationOut.model_validate(org),
        "settings": {
            "standard_hours_per_day": settings.standard_hours_per_day if settings else 8.0,
            "overtime_multiplier": settings.overtime_multiplier if settings else 1.5,
            "fatigue_threshold_hours": settings.fatigue_threshold_hours if settings else 10.0,
            "require_location": settings.require_location if settings else False,
            "allow_anonymous_grievance": settings.allow_anonymous_grievance if settings else True,
        }
    }
