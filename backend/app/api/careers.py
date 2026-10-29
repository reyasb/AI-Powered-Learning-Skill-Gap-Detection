from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import CareerRole, CareerRequiredSkill, Skill, StudentProfile, User
from app.api.auth import get_current_user

router = APIRouter(prefix="/careers", tags=["Careers"])

@router.get("")
def list_careers(db: Session = Depends(get_db)):
    careers = db.query(CareerRole).all()
    results = []
    for c in careers:
        req_count = db.query(CareerRequiredSkill).filter(CareerRequiredSkill.career_id == c.id).count()
        results.append({
            "id": c.id,
            "title": c.title,
            "slug": c.slug,
            "description": c.description,
            "category": c.category,
            "required_skills_count": req_count,
            "suggested_topics": c.suggested_topics or [],
            "sample_projects": c.sample_projects or []
        })
    return results

@router.get("/{id}")
def get_career_detail(id: int, db: Session = Depends(get_db)):
    career = db.query(CareerRole).filter(CareerRole.id == id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    requirements = db.query(CareerRequiredSkill).filter(CareerRequiredSkill.career_id == career.id).all()
    skills_list = []
    for req in requirements:
        sk = db.query(Skill).filter(Skill.id == req.skill_id).first()
        if sk:
            skills_list.append({
                "skill_id": sk.id,
                "name": sk.name,
                "category": sk.category,
                "required_proficiency": req.required_proficiency,
                "importance_weight": req.importance_weight,
                "rationale": req.rationale
            })

    return {
        "id": career.id,
        "title": career.title,
        "slug": career.slug,
        "description": career.description,
        "category": career.category,
        "suggested_topics": career.suggested_topics or [],
        "sample_projects": career.sample_projects or [],
        "required_skills": skills_list
    }

@router.post("/{id}/select-target")
def select_target_career(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    career = db.query(CareerRole).filter(CareerRole.id == id).first()
    if not career:
        raise HTTPException(status_code=404, detail="Career role not found.")

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id)
        db.add(profile)

    profile.target_career_id = career.id
    db.commit()

    return {"message": f"Successfully selected '{career.title}' as your target career.", "target_career_id": career.id}
