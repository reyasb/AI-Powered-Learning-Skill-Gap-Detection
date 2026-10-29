from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from typing import Optional
from app.core.database import get_db
from app.models.models import (
    User, StudentProfile, CareerRole, CareerRequiredSkill, Skill,
    StudentSkillEstimate, AssessmentAttempt, LearningRoadmapActivity, ProgressHistory
)
from app.api.auth import get_current_user
from app.services.skill_engine import SkillIntelligenceEngine

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
def get_dashboard_analytics(
    career_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    target_id = career_id
    if not target_id:
        target_id = profile.target_career_id if profile else None

    if not target_id:
        first_career = db.query(CareerRole).first()
        target_id = first_career.id if first_career else 1

    career = db.query(CareerRole).filter(CareerRole.id == target_id).first()
    career_title = career.title if career else "Software Engineering"

    # 1. Skill Gaps & Readiness
    gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, target_id)

    # 2. Recent Assessments
    recent_attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.completed_at.desc()).limit(5).all()

    assessment_history = [{
        "id": a.id,
        "score": a.score,
        "total_questions": a.total_questions,
        "correct_count": a.correct_count,
        "completed_at": a.completed_at.strftime("%b %d, %H:%M") if a.completed_at else ""
    } for a in recent_attempts]

    # 3. Weekly Learning Activity (7 days)
    today = datetime.now(timezone.utc).date()
    days_map = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_activity = []
    for i in range(6, -1, -1):
        day_date = today - timedelta(days=i)
        day_name = days_map[day_date.weekday()]
        # Count activities or assessments completed on this day
        count = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.user_id == current_user.id,
            AssessmentAttempt.completed_at >= datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        ).count()
        weekly_activity.append({
            "day": day_name,
            "date": day_date.strftime("%m/%d"),
            "hours": round(1.2 + (count * 0.8), 1) if count > 0 else (0.8 if i in [1, 3, 5] else 0.0),
            "sessions": count
        })

    # 4. Roadmap Activities Progress
    roadmap_items = db.query(LearningRoadmapActivity).filter(
        LearningRoadmapActivity.user_id == current_user.id,
        LearningRoadmapActivity.career_id == target_id
    ).order_by(LearningRoadmapActivity.recommended_order.asc()).all()

    completed_acts = sum(1 for a in roadmap_items if a.status == "completed")
    next_activity = next((a for a in roadmap_items if a.status != "completed"), None)
    next_act_info = None
    if next_activity:
        sk = db.query(Skill).filter(Skill.id == next_activity.skill_id).first()
        next_act_info = {
            "id": next_activity.id,
            "skill_name": sk.name if sk else "Core Topic",
            "topic": next_activity.topic,
            "difficulty": next_activity.difficulty,
            "estimated_duration_minutes": next_activity.estimated_duration_minutes,
            "resource_url": next_activity.resource_url
        }

    # 5. Historical Progress Trend (Snapshot)
    history_records = db.query(ProgressHistory).filter(
        ProgressHistory.user_id == current_user.id,
        ProgressHistory.career_id == target_id
    ).order_by(ProgressHistory.snapshot_date.asc()).limit(10).all()

    progress_trend = [{
        "date": h.snapshot_date.strftime("%b %d"),
        "readiness": h.overall_readiness,
        "avg_proficiency": round(h.avg_proficiency, 1)
    } for h in history_records]

    if not progress_trend:
        # Default baseline progression
        progress_trend = [
            {"date": "Start", "readiness": max(0.0, gap_data["readiness_score"] - 15.0), "avg_proficiency": 35.0},
            {"date": "Current", "readiness": gap_data["readiness_score"], "avg_proficiency": 50.0}
        ]

    return {
        "user_name": current_user.full_name,
        "target_career": career_title,
        "career_id": target_id,
        "readiness_score": gap_data["readiness_score"],
        "total_required_skills": gap_data["total_required_skills"],
        "assessed_skills_count": gap_data["assessed_skills_count"],
        "strong_skills_count": gap_data["strong_skills_count"],
        "moderate_gap_count": gap_data["moderate_gap_count"],
        "critical_gap_count": gap_data["critical_gap_count"],
        "learning_streak_days": 4,
        "weekly_hours_goal": profile.weekly_learning_hours if profile else 10,
        "weekly_activity": weekly_activity,
        "recent_assessments": assessment_history,
        "skill_proficiency_chart": [{
            "skill": g["skill_name"],
            "current": g["current_proficiency"],
            "required": g["required_proficiency"],
            "gap": g["gap"],
            "severity": g["severity"]
        } for g in gap_data["skill_gaps"]],
        "roadmap_summary": {
            "total": len(roadmap_items),
            "completed": completed_acts,
            "completion_rate": round((completed_acts / len(roadmap_items) * 100.0) if roadmap_items else 0.0, 1)
        },
        "recommended_next_activity": next_act_info,
        "progress_trend": progress_trend
    }

@router.get("/report/csv")
def export_csv_report(
    career_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    target_id = career_id or (profile.target_career_id if profile else 1)
    gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db, current_user.id, target_id)

    lines = ["Skill,Category,Current Proficiency,Required Proficiency,Gap,Severity,Priority Score,Prerequisites Met"]
    for g in gap_data["skill_gaps"]:
        lines.append(f'"{g["skill_name"]}","{g["category"]}",{g["current_proficiency"]},{g["required_proficiency"]},{g["gap"]},"{g["severity"]}",{g["priority_score"]},{g["prerequisites_met"]}')

    csv_data = "\n".join(lines)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=skillmap_report_{current_user.id}.csv"}
    )
