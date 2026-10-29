from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    GeneratedQuiz, GeneratedQuizQuestion, QuizAttempt, QuizResponse,
    UploadedLearningDocument, DocumentChunk, Skill, User, StudentProfile
)
from app.api.auth import get_current_user
from app.schemas.schemas import GenerateQuizRequest, QuizSubmitRequest
from app.services.quiz_service import QuizGeneratorService
from app.services.skill_engine import SkillIntelligenceEngine

router = APIRouter(prefix="/quizzes", tags=["AI Quizzes"])

@router.post("/generate")
async def generate_quiz(
    data: GenerateQuizRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc_text = ""
    doc_title = "General"
    if data.document_id:
        doc = db.query(UploadedLearningDocument).filter(
            UploadedLearningDocument.id == data.document_id,
            UploadedLearningDocument.user_id == current_user.id
        ).first()
        if doc:
            doc_title = doc.filename
            chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc.id).all()
            doc_text = " ".join([c.content for c in chunks[:10]])

    skill = None
    if data.skill_id:
        skill = db.query(Skill).filter(Skill.id == data.skill_id).first()

    skill_name = skill.name if skill else None
    title = f"{skill_name or doc_title} Practice Quiz"

    raw_questions = await QuizGeneratorService.generate_quiz_from_chunks_or_skill(
        document_text=doc_text,
        skill_name=skill_name,
        topic=data.topic,
        num_questions=max(3, min(data.total_questions, 10)),
        difficulty=data.difficulty
    )

    quiz = GeneratedQuiz(
        user_id=current_user.id,
        title=title,
        document_id=data.document_id,
        skill_id=data.skill_id,
        difficulty=data.difficulty,
        total_questions=len(raw_questions)
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    for q in raw_questions:
        q_obj = GeneratedQuizQuestion(
            quiz_id=quiz.id,
            question_text=q["question_text"],
            option_a=q["option_a"],
            option_b=q["option_b"],
            option_c=q["option_c"],
            option_d=q["option_d"],
            correct_option=q["correct_option"],
            explanation=q["explanation"]
        )
        db.add(q_obj)
    db.commit()

    return {
        "id": quiz.id,
        "title": quiz.title,
        "difficulty": quiz.difficulty,
        "total_questions": len(raw_questions),
        "created_at": quiz.created_at
    }

@router.get("")
def list_quizzes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quizzes = db.query(GeneratedQuiz).filter(
        GeneratedQuiz.user_id == current_user.id
    ).order_by(GeneratedQuiz.created_at.desc()).all()

    results = []
    for q in quizzes:
        attempts = db.query(QuizAttempt).filter(QuizAttempt.quiz_id == q.id).all()
        best_score = max([a.score for a in attempts]) if attempts else None
        results.append({
            "id": q.id,
            "title": q.title,
            "difficulty": q.difficulty,
            "total_questions": q.total_questions,
            "attempts_count": len(attempts),
            "best_score": best_score,
            "created_at": q.created_at
        })
    return results

@router.get("/{id}")
def get_quiz_detail(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    quiz = db.query(GeneratedQuiz).filter(
        GeneratedQuiz.id == id,
        GeneratedQuiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    questions = []
    for q in quiz.questions:
        # Crucial security rule: Hide correct option before submission!
        questions.append({
            "id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d
        })

    return {
        "id": quiz.id,
        "title": quiz.title,
        "difficulty": quiz.difficulty,
        "total_questions": len(questions),
        "questions": questions
    }

@router.post("/{id}/submit")
def submit_quiz(
    id: int,
    data: QuizSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    quiz = db.query(GeneratedQuiz).filter(
        GeneratedQuiz.id == id,
        GeneratedQuiz.user_id == current_user.id
    ).first()

    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found.")

    q_map = {q.id: q for q in quiz.questions}
    correct_count = 0
    total_q = len(data.answers)
    review = []

    attempt = QuizAttempt(
        user_id=current_user.id,
        quiz_id=quiz.id,
        score=0.0,
        total_questions=total_q,
        correct_count=0
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for ans in data.answers:
        q = q_map.get(ans.question_id)
        if not q:
            continue
        is_correct = (ans.selected_option.strip().upper() == q.correct_option.strip().upper())
        if is_correct:
            correct_count += 1

        db.add(QuizResponse(
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

    # Update skill proficiency if this quiz was linked to a skill!
    skill_name = None
    new_prof = None
    if quiz.skill_id:
        new_prof = SkillIntelligenceEngine.update_skill_proficiency(
            db=db,
            user_id=current_user.id,
            skill_id=quiz.skill_id,
            assessment_score=final_score,
            source="quiz"
        )
        sk = db.query(Skill).filter(Skill.id == quiz.skill_id).first()
        skill_name = sk.name if sk else None

        # Re-trigger gap calculation & update roadmap
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile and profile.target_career_id:
            SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, profile.target_career_id)
            SkillIntelligenceEngine.generate_or_update_roadmap(db, current_user.id, profile.target_career_id)

    db.commit()

    return {
        "attempt_id": attempt.id,
        "score": final_score,
        "correct_count": correct_count,
        "total_questions": total_q,
        "skill_updated": skill_name,
        "new_proficiency": new_prof,
        "review": review
    }

@router.get("/history")
def get_quiz_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).all()

    return [{
        "id": a.id,
        "quiz_id": a.quiz_id,
        "title": a.quiz.title if a.quiz else "Quiz",
        "score": a.score,
        "correct_count": a.correct_count,
        "total_questions": a.total_questions,
        "completed_at": a.completed_at
    } for a in attempts]
