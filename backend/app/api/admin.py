from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from app.core.database import get_db
from app.models.models import (
    User, CareerRole, CareerRequiredSkill, Skill, AssessmentQuestion,
    AssessmentDefinition, AssessmentAttempt, UploadedLearningDocument
)
from app.api.auth import get_current_admin
from pydantic import BaseModel

router = APIRouter(prefix="/admin", tags=["Administration"])

class AdminCareerCreate(BaseModel):
    title: str
    slug: str
    description: str
    category: str

class AdminSkillCreate(BaseModel):
    name: str
    category: str
    description: str

class AdminRequirementUpdate(BaseModel):
    career_id: int
    skill_id: int
    required_proficiency: float
    importance_weight: float

@router.get("/metrics")
def get_admin_metrics(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_careers = db.query(CareerRole).count()
    total_skills = db.query(Skill).count()
    total_assessments = db.query(AssessmentAttempt).count()
    total_documents = db.query(UploadedLearningDocument).count()
    total_questions = db.query(AssessmentQuestion).count()

    recent_users = db.query(User).order_by(User.created_at.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_careers": total_careers,
        "total_skills": total_skills,
        "total_assessments_taken": total_assessments,
        "total_documents_uploaded": total_documents,
        "total_questions": total_questions,
        "recent_users": [{
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at
        } for u in recent_users]
    }

@router.post("/careers")
def create_career_role(
    data: AdminCareerCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(CareerRole).filter(CareerRole.title == data.title).first()
    if existing:
        raise HTTPException(status_code=400, detail="Career role with this title already exists.")

    new_career = CareerRole(
        title=data.title,
        slug=data.slug,
        description=data.description,
        category=data.category
    )
    db.add(new_career)
    db.commit()
    db.refresh(new_career)
    return {"message": "Career role created.", "id": new_career.id}

@router.post("/skills")
def create_skill(
    data: AdminSkillCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    existing = db.query(Skill).filter(Skill.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists.")

    new_skill = Skill(
        name=data.name,
        category=data.category,
        description=data.description
    )
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)
    return {"message": "Skill added to catalogue.", "id": new_skill.id}

@router.post("/requirements")
def update_career_requirement(
    data: AdminRequirementUpdate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    req = db.query(CareerRequiredSkill).filter(
        CareerRequiredSkill.career_id == data.career_id,
        CareerRequiredSkill.skill_id == data.skill_id
    ).first()

    if req:
        req.required_proficiency = data.required_proficiency
        req.importance_weight = data.importance_weight
    else:
        req = CareerRequiredSkill(
            career_id=data.career_id,
            skill_id=data.skill_id,
            required_proficiency=data.required_proficiency,
            importance_weight=data.importance_weight
        )
        db.add(req)

    db.commit()
    return {"message": "Requirement successfully configured."}
