from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List
import os
import shutil
import uuid
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, ResumeRecord, Skill, StudentSkillEstimate, CareerRole, Course
from app.api.auth import get_current_user
from app.services.resume_parser import ResumeParserService
from app.schemas.schemas import ResumeConfirmSkills

router = APIRouter(prefix="/resumes", tags=["Resumes"])

def compute_career_analysis(db: Session, extracted_skills: List[str], career_id: Optional[int]):
    """Compares extracted resume skills against target career benchmark requirements."""
    if not career_id:
        return {
            "career_id": None,
            "career_title": "General Engineering",
            "match_percentage": 0.0,
            "matching_skills": [],
            "missing_skills": [],
            "recommendations": ["Select a target career to compare against required skills."],
            "suggested_courses": []
        }

    career = db.query(CareerRole).filter(CareerRole.id == career_id).first()
    if not career:
        return {
            "career_id": None,
            "career_title": "Target Career",
            "match_percentage": 0.0,
            "matching_skills": [],
            "missing_skills": [],
            "recommendations": [],
            "suggested_courses": []
        }

    extracted_lower = {s.lower() for s in extracted_skills}
    req_skills = career.required_skills
    total_req = len(req_skills)

    matching = []
    missing = []
    for req in req_skills:
        skill_name = req.skill.name if req.skill else ""
        if not skill_name:
            continue
        if skill_name.lower() in extracted_lower:
            matching.append({
                "skill_id": req.skill_id,
                "name": skill_name,
                "category": req.skill.category,
                "required_proficiency": req.required_proficiency,
                "estimated_proficiency": 50.0,  # Unassessed baseline from resume
                "status": "matched"
            })
        else:
            missing.append({
                "skill_id": req.skill_id,
                "name": skill_name,
                "category": req.skill.category,
                "required_proficiency": req.required_proficiency,
                "importance_weight": req.importance_weight,
                "rationale": req.rationale,
                "status": "missing"
            })

    match_pct = round((len(matching) / total_req * 100.0) if total_req > 0 else 0.0, 1)

    # Find relevant suggested courses from course database
    missing_names = {m["name"].lower() for m in missing}
    courses = db.query(Course).all()
    suggested_courses = []
    for c in courses:
        covers = []
        for cs in c.course_skills:
            if cs.skill and cs.skill.name.lower() in missing_names:
                covers.append(cs.skill.name)
        if covers or (c.career_role_id == career.id):
            suggested_courses.append({
                "id": c.id,
                "title": c.title,
                "slug": c.slug,
                "category": c.category,
                "duration_hours": c.duration_hours,
                "difficulty": c.difficulty,
                "rating": c.rating,
                "matching_gaps": covers[:3]
            })

    suggested_courses.sort(key=lambda x: len(x["matching_gaps"]), reverse=True)

    recommendations = []
    if missing:
        top_missing = [m["name"] for m in sorted(missing, key=lambda x: x["importance_weight"], reverse=True)[:3]]
        recommendations.append(f"Prioritize closing high-importance skill gaps in {', '.join(top_missing)}.")
    if match_pct >= 70:
        recommendations.append("Strong foundation! You already demonstrate most requirements for this role.")
    elif match_pct >= 40:
        recommendations.append("Moderate alignment. Follow your personalized roadmap to close critical gaps.")
    else:
        recommendations.append("Beginning transition into this track. We recommend starting with core foundational courses.")

    return {
        "career_id": career.id,
        "career_title": career.title,
        "match_percentage": match_pct,
        "matching_skills": matching,
        "missing_skills": missing,
        "recommendations": recommendations,
        "suggested_courses": suggested_courses[:4]
    }

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    career_id: Optional[int] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX documents are accepted for resume analysis."
        )

    # Save file securely
    unique_name = f"{uuid.uuid4().hex}_{file.filename}"
    upload_path = os.path.join(settings.UPLOAD_DIR, "resumes", unique_name)

    try:
        with open(upload_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Extract text using PyMuPDF or docx
    try:
        extracted_text = ResumeParserService.extract_text(upload_path)
    except Exception:
        extracted_text = ""

    # Parse skills & sections
    parsed = ResumeParserService.extract_skills_and_sections(extracted_text)
    extracted_skills = parsed["extracted_skills"]

    # Determine target career: either explicitly submitted or current student's target career
    target_career_id = career_id or (current_user.profile.target_career_id if current_user.profile else None)
    analysis = compute_career_analysis(db, extracted_skills, target_career_id)

    resume_rec = ResumeRecord(
        user_id=current_user.id,
        filename=file.filename,
        file_path=upload_path,
        extracted_text=extracted_text,
        raw_skills_json=extracted_skills,
        confirmed_skills_json=extracted_skills,
        education_text=parsed["education"],
        experience_text=parsed["experience"],
        target_career_id=analysis.get("career_id"),
        target_career_title=analysis.get("career_title"),
        match_percentage=analysis.get("match_percentage", 0.0),
        matching_skills_json=analysis.get("matching_skills", []),
        missing_skills_json=analysis.get("missing_skills", []),
        recommendations_json=analysis.get("recommendations", []),
        status="processed"
    )
    db.add(resume_rec)
    db.commit()
    db.refresh(resume_rec)

    return {
        "id": resume_rec.id,
        "filename": resume_rec.filename,
        "extracted_skills": extracted_skills,
        "confirmed_skills": extracted_skills,
        "education": parsed["education"],
        "experience": parsed["experience"],
        "char_count": len(extracted_text),
        "status": resume_rec.status,
        "created_at": resume_rec.created_at,
        "analysis": analysis
    }

@router.post("/{id}/analyze")
def analyze_existing_resume(
    id: int,
    career_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-analyzes an existing uploaded resume against a newly selected target career."""
    resume = db.query(ResumeRecord).filter(ResumeRecord.id == id, ResumeRecord.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    skills_to_use = resume.confirmed_skills_json or resume.raw_skills_json or []
    analysis = compute_career_analysis(db, skills_to_use, career_id)

    resume.target_career_id = analysis.get("career_id")
    resume.target_career_title = analysis.get("career_title")
    resume.match_percentage = analysis.get("match_percentage", 0.0)
    resume.matching_skills_json = analysis.get("matching_skills", [])
    resume.missing_skills_json = analysis.get("missing_skills", [])
    resume.recommendations_json = analysis.get("recommendations", [])
    db.commit()
    db.refresh(resume)

    return {
        "id": resume.id,
        "filename": resume.filename,
        "analysis": analysis
    }

@router.get("")
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = db.query(ResumeRecord).filter(ResumeRecord.user_id == current_user.id).order_by(ResumeRecord.created_at.desc()).all()
    results = []
    for r in resumes:
        skills = r.confirmed_skills_json or r.raw_skills_json or []
        analysis = {
            "career_id": r.target_career_id,
            "career_title": r.target_career_title or "General Engineering",
            "match_percentage": r.match_percentage or 0.0,
            "matching_skills": r.matching_skills_json or [],
            "missing_skills": r.missing_skills_json or [],
            "recommendations": r.recommendations_json or []
        }
        results.append({
            "id": r.id,
            "filename": r.filename,
            "status": r.status,
            "extracted_skills": r.raw_skills_json or [],
            "confirmed_skills": r.confirmed_skills_json or [],
            "education": r.education_text,
            "experience": r.experience_text,
            "created_at": r.created_at,
            "analysis": analysis
        })
    return results

@router.get("/{id}")
def get_resume(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(ResumeRecord).filter(ResumeRecord.id == id, ResumeRecord.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    analysis = {
        "career_id": resume.target_career_id,
        "career_title": resume.target_career_title or "General Engineering",
        "match_percentage": resume.match_percentage or 0.0,
        "matching_skills": resume.matching_skills_json or [],
        "missing_skills": resume.missing_skills_json or [],
        "recommendations": resume.recommendations_json or []
    }

    # Fetch suggested courses if missing skills exist
    if resume.missing_skills_json:
        missing_names = {m["name"].lower() for m in resume.missing_skills_json}
        courses = db.query(Course).all()
        suggested = []
        for c in courses:
            covers = [cs.skill.name for cs in c.course_skills if cs.skill and cs.skill.name.lower() in missing_names]
            if covers or (c.career_role_id == resume.target_career_id):
                suggested.append({
                    "id": c.id,
                    "title": c.title,
                    "slug": c.slug,
                    "category": c.category,
                    "duration_hours": c.duration_hours,
                    "difficulty": c.difficulty,
                    "rating": c.rating,
                    "matching_gaps": covers[:3]
                })
        suggested.sort(key=lambda x: len(x["matching_gaps"]), reverse=True)
        analysis["suggested_courses"] = suggested[:4]
    else:
        analysis["suggested_courses"] = []

    return {
        "id": resume.id,
        "filename": resume.filename,
        "extracted_skills": resume.raw_skills_json or [],
        "confirmed_skills": resume.confirmed_skills_json or [],
        "education": resume.education_text,
        "experience": resume.experience_text,
        "created_at": resume.created_at,
        "analysis": analysis
    }

@router.post("/{id}/confirm")
def confirm_skills(
    id: int,
    data: ResumeConfirmSkills,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(ResumeRecord).filter(ResumeRecord.id == id, ResumeRecord.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    resume.confirmed_skills_json = data.skills

    # Save confirmed skills to StudentSkillEstimate as baseline evidence (50.0 proficiency, confidence 0.3)
    for skill_name in data.skills:
        skill = db.query(Skill).filter(Skill.name == skill_name).first()
        if not skill:
            skill = Skill(name=skill_name, category="Technical", description="Skill extracted from resume")
            db.add(skill)
            db.commit()
            db.refresh(skill)

        estimate = db.query(StudentSkillEstimate).filter(
            StudentSkillEstimate.user_id == current_user.id,
            StudentSkillEstimate.skill_id == skill.id
        ).first()

        if not estimate:
            new_est = StudentSkillEstimate(
                user_id=current_user.id,
                skill_id=skill.id,
                proficiency=50.0,
                confidence=0.3,
                source="resume",
                assessment_count=0
            )
            db.add(new_est)

    # Recalculate analysis with confirmed skills if career_id is present
    if resume.target_career_id:
        analysis = compute_career_analysis(db, data.skills, resume.target_career_id)
        resume.match_percentage = analysis.get("match_percentage", 0.0)
        resume.matching_skills_json = analysis.get("matching_skills", [])
        resume.missing_skills_json = analysis.get("missing_skills", [])
        resume.recommendations_json = analysis.get("recommendations", [])

    db.commit()
    return {"message": "Skills confirmed and added to profile.", "confirmed_skills": data.skills}

@router.delete("/{id}")
def delete_resume(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resume = db.query(ResumeRecord).filter(ResumeRecord.id == id, ResumeRecord.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume record not found.")

    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass

    db.delete(resume)
    db.commit()
    return {"message": "Resume record and file deleted."}
