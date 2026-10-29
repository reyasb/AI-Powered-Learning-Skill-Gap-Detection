from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.models import (
    CareerRole, CareerRequiredSkill, Skill, StudentSkillEstimate,
    SkillPrerequisite, LearningRoadmapActivity, LearningResource, ProgressHistory
)

class SkillIntelligenceEngine:
    @staticmethod
    def calculate_skill_gaps(db: Session, user_id: int, career_id: int) -> Dict[str, Any]:
        """
        Calculates deterministic skill gaps and career readiness for a student.
        - gap = max(0, required_proficiency - current_proficiency)
        - priority_score = (gap / 100) * importance_weight * prerequisite_factor * confidence_urgency
        """
        career = db.query(CareerRole).filter(CareerRole.id == career_id).first()
        if not career:
            return {
                "career_id": career_id,
                "career_title": "Unknown Role",
                "readiness_score": 0.0,
                "total_required_skills": 0,
                "assessed_skills_count": 0,
                "strong_skills_count": 0,
                "moderate_gap_count": 0,
                "critical_gap_count": 0,
                "skill_gaps": []
            }

        required_skills = db.query(CareerRequiredSkill).filter(
            CareerRequiredSkill.career_id == career_id
        ).all()

        # Map user's existing estimates
        estimates = db.query(StudentSkillEstimate).filter(
            StudentSkillEstimate.user_id == user_id
        ).all()
        user_skills_map = {e.skill_id: e for e in estimates}

        # Prerequisites lookup
        prereqs = db.query(SkillPrerequisite).all()
        prereq_map = {}  # skill_id -> list of prerequisite_skill_ids
        for p in prereqs:
            prereq_map.setdefault(p.skill_id, []).append(p.prerequisite_skill_id)

        skill_gaps = []
        total_weighted_proficiency = 0.0
        total_max_weighted = 0.0
        assessed_count = 0
        strong_count = 0
        moderate_count = 0
        critical_count = 0

        for req in required_skills:
            skill = db.query(Skill).filter(Skill.id == req.skill_id).first()
            if not skill:
                continue

            estimate = user_skills_map.get(req.skill_id)
            curr_prof = float(estimate.proficiency) if estimate else 0.0
            confidence = float(estimate.confidence) if estimate else 0.1
            if estimate and estimate.assessment_count > 0:
                assessed_count += 1

            req_prof = float(req.required_proficiency)
            weight = float(req.importance_weight)

            # Core Gap Formula: gap = max(0, required - current)
            raw_gap = max(0.0, req_prof - curr_prof)
            gap_pct = (raw_gap / req_prof * 100.0) if req_prof > 0 else 0.0

            # Prerequisite Check
            required_prereqs = prereq_map.get(req.skill_id, [])
            missing_prereqs = []
            for pid in required_prereqs:
                p_est = user_skills_map.get(pid)
                p_prof = float(p_est.proficiency) if p_est else 0.0
                if p_prof < 60.0:
                    p_skill = db.query(Skill).filter(Skill.id == pid).first()
                    missing_prereqs.append(p_skill.name if p_skill else f"Skill #{pid}")

            prereqs_met = len(missing_prereqs) == 0
            prereq_priority_boost = 1.3 if not prereqs_met else 1.0

            # Severity Categorization
            if raw_gap >= 35.0:
                severity = "critical"
                critical_count += 1
            elif raw_gap >= 15.0:
                severity = "moderate"
                moderate_count += 1
            else:
                severity = "strong"
                strong_count += 1

            # Priority Score Calculation
            # High gap + high importance weight + low confidence (needs assessment) prioritized
            confidence_factor = 1.0 + (1.0 - confidence) * 0.3
            priority_score = round(
                (raw_gap / 100.0) * weight * 20.0 * prereq_priority_boost * confidence_factor, 1
            )

            # Weighted career readiness contributions
            capped_curr = min(curr_prof, req_prof)
            total_weighted_proficiency += (capped_curr * weight)
            total_max_weighted += (req_prof * weight)

            skill_gaps.append({
                "skill_id": skill.id,
                "skill_name": skill.name,
                "category": skill.category,
                "current_proficiency": round(curr_prof, 1),
                "required_proficiency": round(req_prof, 1),
                "gap": round(raw_gap, 1),
                "gap_percentage": round(gap_pct, 1),
                "importance_weight": weight,
                "priority_score": priority_score,
                "severity": severity,
                "rationale": req.rationale or f"Essential skill for {career.title}",
                "prerequisites_met": prereqs_met,
                "missing_prerequisites": missing_prereqs
            })

        # Sort by priority score descending
        skill_gaps.sort(key=lambda x: x["priority_score"], reverse=True)

        readiness_score = round(
            (total_weighted_proficiency / total_max_weighted * 100.0) if total_max_weighted > 0 else 0.0,
            1
        )

        return {
            "career_id": career.id,
            "career_title": career.title,
            "readiness_score": readiness_score,
            "total_required_skills": len(required_skills),
            "assessed_skills_count": assessed_count,
            "strong_skills_count": strong_count,
            "moderate_gap_count": moderate_count,
            "critical_gap_count": critical_count,
            "skill_gaps": skill_gaps
        }

    @staticmethod
    def update_skill_proficiency(
        db: Session,
        user_id: int,
        skill_id: int,
        assessment_score: float,
        source: str = "assessment"
    ) -> float:
        """
        Bayesian / Evidence-Weighted Proficiency Update:
        Combines prior estimated proficiency with new assessment score.
        alpha = min(0.7, 0.3 + 0.1 * prior_count)
        new_proficiency = alpha * prior + (1 - alpha) * assessment_score
        """
        estimate = db.query(StudentSkillEstimate).filter(
            StudentSkillEstimate.user_id == user_id,
            StudentSkillEstimate.skill_id == skill_id
        ).first()

        now = datetime.now(timezone.utc)
        if not estimate:
            new_proficiency = round(float(assessment_score), 1)
            new_estimate = StudentSkillEstimate(
                user_id=user_id,
                skill_id=skill_id,
                proficiency=new_proficiency,
                confidence=0.5,
                source=source,
                assessment_count=1,
                last_assessed_at=now
            )
            db.add(new_estimate)
            db.commit()
            return new_proficiency

        prior_prof = float(estimate.proficiency)
        count = estimate.assessment_count

        # Adaptive alpha: initial assessments cause larger updates, repeated assessments stabilize
        alpha = min(0.75, 0.30 + (count * 0.10))
        new_proficiency = round(alpha * prior_prof + (1.0 - alpha) * float(assessment_score), 1)

        # Confidence increases with assessments up to 0.95
        estimate.confidence = round(min(0.95, float(estimate.confidence) + 0.15), 2)
        estimate.proficiency = new_proficiency
        estimate.assessment_count += 1
        estimate.source = source
        estimate.last_assessed_at = now
        db.commit()
        return new_proficiency

    @staticmethod
    def generate_or_update_roadmap(db: Session, user_id: int, career_id: int):
        """
        Recomputes dynamic learning activities for the user based on prioritized skill gaps.
        Preserves completed and in-progress activities.
        """
        gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db, user_id, career_id)
        skill_gaps = gap_data["skill_gaps"]

        # Filter gaps where gap > 0
        actionable_gaps = [g for g in skill_gaps if g["gap"] > 5.0]

        existing_activities = db.query(LearningRoadmapActivity).filter(
            LearningRoadmapActivity.user_id == user_id,
            LearningRoadmapActivity.career_id == career_id
        ).all()
        existing_skill_ids = {a.skill_id for a in existing_activities}

        order = len(existing_activities) + 1
        for gap in actionable_gaps:
            if gap["skill_id"] in existing_skill_ids:
                continue

            # Find matching learning resource
            resource = db.query(LearningResource).filter(
                LearningResource.skill_id == gap["skill_id"]
            ).first()

            duration = 90 if gap["severity"] == "critical" else 60
            difficulty = "hard" if gap["severity"] == "critical" else "medium"

            new_activity = LearningRoadmapActivity(
                user_id=user_id,
                career_id=career_id,
                skill_id=gap["skill_id"],
                topic=resource.topic if resource else f"Mastering {gap['skill_name']}",
                learning_objective=f"Bridge skill gap of {gap['gap']}% to meet {gap['required_proficiency']}% target for your target career role.",
                difficulty=difficulty,
                recommended_order=order,
                estimated_duration_minutes=duration,
                resource_title=resource.title if resource else f"Core Guide: {gap['skill_name']}",
                resource_type=resource.resource_type if resource else "tutorial",
                resource_url=resource.url if resource else f"https://developer.mozilla.org/search?q={gap['skill_name']}",
                status="pending"
            )
            db.add(new_activity)
            order += 1

        # Also record snapshot in progress history
        snapshot = ProgressHistory(
            user_id=user_id,
            career_id=career_id,
            overall_readiness=gap_data["readiness_score"],
            assessed_skills_count=gap_data["assessed_skills_count"],
            avg_proficiency=sum(g["current_proficiency"] for g in skill_gaps) / max(1, len(skill_gaps)),
            snapshot_date=datetime.now(timezone.utc)
        )
        db.add(snapshot)
        db.commit()

        return db.query(LearningRoadmapActivity).filter(
            LearningRoadmapActivity.user_id == user_id,
            LearningRoadmapActivity.career_id == career_id
        ).order_by(LearningRoadmapActivity.recommended_order.asc()).all()
