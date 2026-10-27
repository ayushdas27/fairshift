from collections import Counter
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.api.deps import get_db, get_current_user, require_roles
from backend.app.models.models import User, AnonymousFeedback, Organization
from backend.app.schemas.schemas import FeedbackCreateRequest, FeedbackSummaryOut

router = APIRouter()

@router.post("")
def submit_feedback(req: FeedbackCreateRequest, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(Organization.code == req.org_code.upper()).first()
    if not org:
        raise HTTPException(status_code=404, detail="Site or Facility Code not found.")

    fb = AnonymousFeedback(
        org_id=org.id,
        category=req.category,
        rating=max(1, min(5, req.rating)),
        feedback_text=req.feedback_text,
        industry=org.industry
    )
    db.add(fb)
    db.commit()
    return {"message": "Anonymous feedback recorded successfully with identity decoupling."}

@router.get("/admin/summary", response_model=FeedbackSummaryOut)
def get_feedback_summary(
    current_user: User = Depends(require_roles(["hr_payroll", "safety_officer", "admin"])),
    db: Session = Depends(get_db)
):
    items = db.query(AnonymousFeedback).filter(
        AnonymousFeedback.org_id == current_user.org_id
    ).all()
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()

    total = len(items)
    if total == 0:
        return FeedbackSummaryOut(
            total_responses=0,
            average_rating=5.0,
            sentiment_distribution={"positive": 0, "neutral": 0, "negative": 0},
            categories={},
            industry=org.industry if org else "general"
        )

    avg_rating = round(sum(i.rating for i in items) / total, 2)
    sentiment_dist = {
        "positive": sum(1 for i in items if i.rating >= 4),
        "neutral": sum(1 for i in items if i.rating == 3),
        "negative": sum(1 for i in items if i.rating <= 2)
    }
    cat_counts = dict(Counter(i.category for i in items))

    return FeedbackSummaryOut(
        total_responses=total,
        average_rating=avg_rating,
        sentiment_distribution=sentiment_dist,
        categories=cat_counts,
        industry=org.industry if org else "general"
    )
