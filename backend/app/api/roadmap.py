from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from app.core.database import get_db
from app.models.models import LearningRoadmapActivity, StudentProfile, User, CareerRole, Skill
from app.api.auth import get_current_user
from app.services.skill_engine import SkillIntelligenceEngine
from app.schemas.schemas import RoadmapActivityUpdate

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.get("")
def get_roadmap(
    career_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = career_id
    if not target_id:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        target_id = profile.target_career_id if profile else None

    if not target_id:
        first_career = db.query(CareerRole).first()
        if first_career:
            target_id = first_career.id
        else:
            return {"activities": []}

    activities = db.query(LearningRoadmapActivity).filter(
        LearningRoadmapActivity.user_id == current_user.id,
        LearningRoadmapActivity.career_id == target_id
    ).order_by(LearningRoadmapActivity.recommended_order.asc()).all()

    if not activities:
        activities = SkillIntelligenceEngine.generate_or_update_roadmap(db, current_user.id, target_id)

    results = []
    for a in activities:
        sk = db.query(Skill).filter(Skill.id == a.skill_id).first()
        results.append({
            "id": a.id,
            "skill_id": a.skill_id,
            "skill_name": sk.name if sk else f"Skill #{a.skill_id}",
            "topic": a.topic,
            "learning_objective": a.learning_objective,
            "difficulty": a.difficulty,
            "recommended_order": a.recommended_order,
            "estimated_duration_minutes": a.estimated_duration_minutes,
            "resource_title": a.resource_title,
            "resource_type": a.resource_type,
            "resource_url": a.resource_url,
            "status": a.status,
            "completed_at": a.completed_at
        })

    completed_count = sum(1 for a in results if a["status"] == "completed")
    return {
        "career_id": target_id,
        "total_activities": len(results),
        "completed_count": completed_count,
        "completion_rate": round((completed_count / len(results) * 100.0) if results else 0.0, 1),
        "activities": results
    }

@router.post("/recalculate")
def recalculate_roadmap(
    career_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = career_id
    if not target_id:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        target_id = profile.target_career_id if profile else None

    if not target_id:
        first_career = db.query(CareerRole).first()
        if first_career:
            target_id = first_career.id
        else:
            raise HTTPException(status_code=400, detail="No career selected.")

    activities = SkillIntelligenceEngine.generate_or_update_roadmap(db, current_user.id, target_id)
    return {"message": "Roadmap recalculated successfully based on current skill gaps.", "activity_count": len(activities)}

@router.patch("/activities/{id}")
def update_activity_status(
    id: int,
    data: RoadmapActivityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    activity = db.query(LearningRoadmapActivity).filter(
        LearningRoadmapActivity.id == id,
        LearningRoadmapActivity.user_id == current_user.id
    ).first()

    if not activity:
        raise HTTPException(status_code=404, detail="Roadmap activity not found.")

    activity.status = data.status
    if data.status == "completed":
        activity.completed_at = datetime.now(timezone.utc)
    else:
        activity.completed_at = None

    db.commit()
    return {"message": f"Activity status updated to '{data.status}'", "id": activity.id, "status": activity.status}
