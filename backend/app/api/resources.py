from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.models.models import LearningResource, Skill

router = APIRouter(prefix="/resources", tags=["Learning Resources"])

@router.get("")
def list_resources(
    skill_id: Optional[int] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(LearningResource)
    if skill_id:
        query = query.filter(LearningResource.skill_id == skill_id)
    if difficulty:
        query = query.filter(LearningResource.difficulty == difficulty)
    if search:
        query = query.filter(
            (LearningResource.title.ilike(f"%{search}%")) |
            (LearningResource.topic.ilike(f"%{search}%"))
        )

    resources = query.all()
    results = []
    for r in resources:
        sk = db.query(Skill).filter(Skill.id == r.skill_id).first() if r.skill_id else None
        results.append({
            "id": r.id,
            "title": r.title,
            "skill_id": r.skill_id,
            "skill_name": sk.name if sk else "General",
            "topic": r.topic,
            "resource_type": r.resource_type,
            "url": r.url,
            "duration_minutes": r.duration_minutes,
            "difficulty": r.difficulty,
            "description": r.description
        })
    return results
