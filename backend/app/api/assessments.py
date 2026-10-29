from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    AssessmentDefinition, AssessmentQuestion, AssessmentAttempt,
    AssessmentResponse, User, StudentProfile, Skill, CareerRole, Course
)
from app.api.auth import get_current_user
from app.schemas.schemas import AssessmentSubmitRequest, CustomAssessmentRequest
from app.services.skill_engine import SkillIntelligenceEngine

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("")
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(AssessmentDefinition).all()
    results = []
    for a in assessments:
        q_count = len(a.questions)
        results.append({
            "id": a.id,
            "title": a.title,
            "description": a.description,
            "career_id": a.career_id,
            "difficulty": a.difficulty,
            "duration_minutes": a.duration_minutes,
            "total_questions": q_count
        })
    return results

@router.get("/{id}")
def get_assessment(id: int, db: Session = Depends(get_db)):
    assessment = db.query(AssessmentDefinition).filter(AssessmentDefinition.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    questions = []
    for q in assessment.questions:
        # Crucial security rule from master prompt: DO NOT reveal correct answers before submission!
        questions.append({
            "id": q.id,
            "skill_id": q.skill_id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "difficulty": q.difficulty
        })

    return {
        "id": assessment.id,
        "title": assessment.title,
        "description": assessment.description,
        "career_id": assessment.career_id,
        "difficulty": assessment.difficulty,
        "duration_minutes": assessment.duration_minutes,
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/custom")
def create_custom_assessment(
    data: CustomAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AssessmentQuestion)
    title_parts = []

    if data.skill_id:
        skill = db.query(Skill).filter(Skill.id == data.skill_id).first()
        if skill:
            query = query.filter(AssessmentQuestion.skill_id == data.skill_id)
            title_parts.append(skill.name)
    elif data.career_id:
        career = db.query(CareerRole).filter(CareerRole.id == data.career_id).first()
        if career:
            req_skill_ids = [rs.skill_id for rs in career.required_skills]
            if req_skill_ids:
                query = query.filter(AssessmentQuestion.skill_id.in_(req_skill_ids))
            title_parts.append(career.title)

    if data.difficulty and data.difficulty.lower() != "all":
        query = query.filter(AssessmentQuestion.difficulty.ilike(data.difficulty.lower()))
        title_parts.append(data.difficulty.capitalize())

    all_matching = query.all()

    # Fallback to general questions if no exact match
    if not all_matching:
        all_matching = db.query(AssessmentQuestion).all()

    q_count = min(len(all_matching), data.question_count)
    selected_questions = random.sample(all_matching, q_count) if q_count > 0 else []

    title = f"{' - '.join(title_parts)} Diagnostic Assessment" if title_parts else "Technical Competency Assessment"

    # Create dynamic assessment definition for this session
    ass_def = AssessmentDefinition(
        title=title,
        description=f"Tailored evaluation targeting {len(selected_questions)} questions across core technical competencies.",
        career_id=data.career_id,
        skill_id=data.skill_id,
        difficulty=data.difficulty or "medium",
        duration_minutes=max(5, len(selected_questions) * 2),
        total_questions=len(selected_questions)
    )
    db.add(ass_def)
    db.commit()
    db.refresh(ass_def)

    # Link questions
    for q in selected_questions:
        q_copy = AssessmentQuestion(
            assessment_id=ass_def.id,
            skill_id=q.skill_id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option,
            explanation=q.explanation,
            difficulty=q.difficulty
        )
        db.add(q_copy)
    db.commit()
    db.refresh(ass_def)

    questions_out = []
    for q in ass_def.questions:
        questions_out.append({
            "id": q.id,
            "skill_id": q.skill_id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "difficulty": q.difficulty
        })

    return {
        "id": ass_def.id,
        "title": ass_def.title,
        "description": ass_def.description,
        "career_id": ass_def.career_id,
        "difficulty": ass_def.difficulty,
        "duration_minutes": ass_def.duration_minutes,
        "total_questions": len(questions_out),
        "questions": questions_out
    }

@router.post("/{id}/submit")
def submit_assessment(
    id: int,
    data: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(AssessmentDefinition).filter(AssessmentDefinition.id == id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found.")

    if not data.answers:
        raise HTTPException(status_code=400, detail="No answers provided in submission.")

    # Prevent accidental rapid double submission (within 5 seconds of exact same score)
    recent_attempt = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id,
        AssessmentAttempt.assessment_id == id
    ).order_by(AssessmentAttempt.completed_at.desc()).first()

    now = datetime.now(timezone.utc)

    # Evaluate answers
    question_map = {q.id: q for q in assessment.questions}
    correct_count = 0
    total_q = len(data.answers)
    review = []
    skill_stats = {}  # skill_id -> {"total": 0, "correct": 0}

    # Create Attempt Record
    attempt = AssessmentAttempt(
        user_id=current_user.id,
        assessment_id=assessment.id,
        career_id=assessment.career_id,
        score=0.0,
        total_questions=total_q,
        correct_count=0,
        time_spent_seconds=data.time_spent_seconds,
        completed_at=now
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for ans in data.answers:
        q = question_map.get(ans.question_id)
        if not q:
            continue

        is_correct = (ans.selected_option.strip().upper() == q.correct_option.strip().upper())
        if is_correct:
            correct_count += 1

        if q.skill_id:
            stat = skill_stats.setdefault(q.skill_id, {"total": 0, "correct": 0})
            stat["total"] += 1
            if is_correct:
                stat["correct"] += 1

        db.add(AssessmentResponse(
            attempt_id=attempt.id,
            question_id=q.id,
            selected_option=ans.selected_option,
            is_correct=is_correct
        ))

        review.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "selected_option": ans.selected_option,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    final_score = round((correct_count / total_q * 100.0) if total_q > 0 else 0.0, 1)
    attempt.score = final_score
    attempt.correct_count = correct_count

    # Update skill proficiencies using adaptive Bayesian formula
    skill_breakdown = {}
    for sk_id, stat in skill_stats.items():
        sk_score = (stat["correct"] / stat["total"]) * 100.0
        new_prof = SkillIntelligenceEngine.update_skill_proficiency(
            db=db,
            user_id=current_user.id,
            skill_id=sk_id,
            assessment_score=sk_score,
            source="assessment"
        )
        sk_obj = db.query(Skill).filter(Skill.id == sk_id).first()
        sk_name = sk_obj.name if sk_obj else f"Skill #{sk_id}"
        skill_breakdown[sk_name] = {
            "tested_score": round(sk_score, 1),
            "updated_proficiency": new_prof
        }

    attempt.skill_scores_json = skill_breakdown
    db.commit()

    # Recalculate gaps and update roadmap
    career_id = assessment.career_id
    if not career_id:
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        career_id = profile.target_career_id if profile else None

    updated_readiness = 0.0
    if career_id:
        gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, career_id)
        updated_readiness = gap_data["readiness_score"]
        SkillIntelligenceEngine.generate_or_update_roadmap(db, current_user.id, career_id)

    strengths = []
    areas_to_improve = []
    weak_skill_names = []
    for sk_name, info in skill_breakdown.items():
        if info["tested_score"] >= 70:
            strengths.append(f"{sk_name} ({info['tested_score']}%)")
        else:
            areas_to_improve.append(f"{sk_name} ({info['tested_score']}%)")
            weak_skill_names.append(sk_name.lower())

    # Find recommended courses matching weak skills
    recommended_courses = []
    if weak_skill_names:
        courses = db.query(Course).all()
        for c in courses:
            covers = [cs.skill.name for cs in c.course_skills if cs.skill and cs.skill.name.lower() in weak_skill_names]
            if covers or (career_id and c.career_role_id == career_id):
                recommended_courses.append({
                    "id": c.id,
                    "title": c.title,
                    "slug": c.slug,
                    "category": c.category,
                    "duration_hours": c.duration_hours,
                    "difficulty": c.difficulty,
                    "matching_skills": covers[:3]
                })
        recommended_courses.sort(key=lambda x: len(x["matching_skills"]), reverse=True)

    return {
        "attempt_id": attempt.id,
        "score": final_score,
        "correct_count": correct_count,
        "total_questions": total_q,
        "skill_breakdown": skill_breakdown,
        "updated_readiness": updated_readiness,
        "strengths": strengths,
        "areas_to_improve": areas_to_improve,
        "recommended_courses": recommended_courses[:4],
        "review": review
    }

@router.get("/history")
def get_assessment_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.completed_at.desc()).all()

    results = []
    for att in attempts:
        ass = db.query(AssessmentDefinition).filter(AssessmentDefinition.id == att.assessment_id).first()
        results.append({
            "id": att.id,
            "assessment_id": att.assessment_id,
            "title": ass.title if ass else "Assessment",
            "score": att.score,
            "correct_count": att.correct_count,
            "total_questions": att.total_questions,
            "time_spent_seconds": att.time_spent_seconds,
            "skill_breakdown": att.skill_scores_json or {},
            "completed_at": att.completed_at
        })
    return results
