from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user
from backend.app.core.security import verify_password, create_access_token
from backend.app.models.models import User, Organization, WorkerProfile
from backend.app.schemas.schemas import LoginRequest, Token, UserOut

router = APIRouter()

def user_to_out(user: User, db: Session) -> UserOut:
    org = db.query(Organization).filter(Organization.id == user.org_id).first()
    profile = db.query(WorkerProfile).filter(WorkerProfile.user_id == user.id).first()
    return UserOut(
        id=user.id,
        org_id=user.org_id,
        email=user.email,
        employee_code=user.employee_code,
        full_name=user.full_name,
        phone=user.phone,
        role=user.role,
        department_id=user.department_id,
        work_site_id=user.work_site_id,
        preferred_lang=user.preferred_lang,
        is_active=user.is_active,
        station_code=profile.station_code if profile else None,
        tier=profile.tier if profile else None,
        org_name=org.name if org else None,
        org_industry=org.industry if org else None
    )

@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    # Look up by email or employee_code
    query = db.query(User).filter(
        (User.email == req.identifier) | (User.employee_code == req.identifier)
    )
    if req.org_code:
        org = db.query(Organization).filter(Organization.code == req.org_code.upper()).first()
        if org:
            query = query.filter(User.org_id == org.id)
            
    user = query.first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or site code. Please check your details."
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated."
        )

    access_token = create_access_token(subject=user.id)
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user_to_out(user, db)
    )

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return user_to_out(current_user, db)

@router.post("/logout")
def logout():
    return {"message": "Successfully logged out. Client should discard tokens."}
