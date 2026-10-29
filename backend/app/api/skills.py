from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.models import Skill, StudentSkillEstimate, StudentProfile, User, CareerRole
from app.api.auth import get_current_user
from app.services.skill_engine import SkillIntelligenceEngine

router = APIRouter(prefix="/skills", tags=["Skills"])

@router.get("")
def list_skills(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)
    skills = query.order_by(Skill.category, Skill.name).all()
    return [{
        "id": s.id,
        "name": s.name,
        "category": s.category,
        "description": s.description
    } for s in skills]

@router.get("/my-skills")
def get_user_skills(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    estimates = db.query(StudentSkillEstimate).filter(StudentSkillEstimate.user_id == current_user.id).all()
    results = []
    for e in estimates:
        sk = db.query(Skill).filter(Skill.id == e.skill_id).first()
        if sk:
            results.append({
                "skill_id": sk.id,
                "name": sk.name,
                "category": sk.category,
                "proficiency": e.proficiency,
                "confidence": e.confidence,
                "source": e.source,
                "assessment_count": e.assessment_count,
                "last_assessed_at": e.last_assessed_at
            })
    return results

@router.get("/gaps")
def get_skill_gaps(
    career_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_id = career_id
    if not target_id:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        target_id = profile.target_career_id if profile else None

    if not target_id:
        # Default to first available career role
        first_career = db.query(CareerRole).first()
        if first_career:
            target_id = first_career.id
        else:
            return {"error": "No career roles available"}

    return SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, target_id)

@router.get("/readiness")
def get_readiness(
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
            return {"readiness_score": 0.0, "career_title": "None"}

    gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, target_id)
    return {
        "career_id": gap_data["career_id"],
        "career_title": gap_data["career_title"],
        "readiness_score": gap_data["readiness_score"],
        "total_required_skills": gap_data["total_required_skills"],
        "assessed_skills_count": gap_data["assessed_skills_count"],
        "strong_skills_count": gap_data["strong_skills_count"],
        "moderate_gap_count": gap_data["moderate_gap_count"],
        "critical_gap_count": gap_data["critical_gap_count"]
    }
