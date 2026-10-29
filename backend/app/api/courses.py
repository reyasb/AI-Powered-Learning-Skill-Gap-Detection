from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional, List
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.models import (
    Course, Lesson, CourseEnrollment, LessonProgress, CourseSkill,
    Skill, CareerRole, User
)
from app.api.auth import get_current_user
from app.schemas.schemas import CourseCardOut, CourseDetailOut, LessonOut

router = APIRouter(prefix="/courses", tags=["Courses"])

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_optional_user(token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        return None
    try:
        user_id = int(payload.get("sub"))
        return db.query(User).filter(User.id == user_id, User.is_active == True).first()
    except Exception:
        return None

def calc_user_progress(db: Session, user_id: int, course_id: int, total_lessons: int) -> float:
    if total_lessons == 0:
        return 0.0
    completed = db.query(LessonProgress).filter(
        LessonProgress.user_id == user_id,
        LessonProgress.course_id == course_id,
        LessonProgress.completed == True
    ).count()
    return round((completed / total_lessons) * 100.0, 1)

@router.get("", response_model=List[CourseCardOut])
def list_courses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    sort: Optional[str] = "popular",
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    query = db.query(Course)

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            (Course.title.ilike(term)) |
            (Course.short_description.ilike(term)) |
            (Course.description.ilike(term)) |
            (Course.category.ilike(term))
        )

    if category and category.lower() != "all":
        query = query.filter(Course.category.ilike(f"%{category.strip()}%"))

    if difficulty and difficulty.lower() != "all":
        query = query.filter(Course.difficulty.ilike(difficulty.strip()))

    if sort == "title":
        query = query.order_by(Course.title.asc())
    elif sort == "rating":
        query = query.order_by(Course.rating.desc())
    elif sort == "duration":
        query = query.order_by(Course.duration_hours.asc())
    else:  # popular
        query = query.order_by(Course.is_featured.desc(), Course.rating.desc(), Course.id.asc())

    courses = query.all()

    # Pre-fetch user enrollments if logged in
    user_enrolled_map = {}
    if user:
        enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == user.id).all()
        for e in enrollments:
            user_enrolled_map[e.course_id] = e

    results = []
    for c in courses:
        lesson_count = len(c.lessons)
        enrolled = c.id in user_enrolled_map
        progress = 0.0
        if user and enrolled:
            progress = calc_user_progress(db, user.id, c.id, lesson_count)

        results.append(CourseCardOut(
            id=c.id,
            title=c.title,
            slug=c.slug,
            short_description=c.short_description,
            category=c.category,
            difficulty=c.difficulty,
            duration_hours=c.duration_hours,
            estimated_weeks=c.estimated_weeks,
            thumbnail_url=c.thumbnail_url,
            badge=c.badge or "Popular",
            rating=c.rating,
            instructor_name=c.instructor_name,
            is_featured=c.is_featured,
            lesson_count=lesson_count,
            enrolled=enrolled,
            progress_percentage=progress
        ))

    return results

@router.get("/featured", response_model=List[CourseCardOut])
def get_featured_courses(
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).filter(Course.is_featured == True).limit(8).all()
    if not courses:
        courses = db.query(Course).limit(6).all()

    user_enrolled_map = {}
    if user:
        enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.user_id == user.id).all()
        for e in enrollments:
            user_enrolled_map[e.course_id] = e

    results = []
    for c in courses:
        lesson_count = len(c.lessons)
        enrolled = c.id in user_enrolled_map
        progress = 0.0
        if user and enrolled:
            progress = calc_user_progress(db, user.id, c.id, lesson_count)

        results.append(CourseCardOut(
            id=c.id,
            title=c.title,
            slug=c.slug,
            short_description=c.short_description,
            category=c.category,
            difficulty=c.difficulty,
            duration_hours=c.duration_hours,
            estimated_weeks=c.estimated_weeks,
            thumbnail_url=c.thumbnail_url,
            badge=c.badge or "Popular",
            rating=c.rating,
            instructor_name=c.instructor_name,
            is_featured=c.is_featured,
            lesson_count=lesson_count,
            enrolled=enrolled,
            progress_percentage=progress
        ))

    return results

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    courses = db.query(Course).all()
    cat_counts = {}
    for c in courses:
        cat_counts[c.category] = cat_counts.get(c.category, 0) + 1

    return [{"category": k, "count": v} for k, v in sorted(cat_counts.items(), key=lambda x: x[0])]

@router.get("/my-learning")
def get_my_learning(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enrollments = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == user.id
    ).order_by(CourseEnrollment.last_accessed_at.desc()).all()

    results = []
    for e in enrollments:
        c = e.course
        if not c:
            continue
        lesson_count = len(c.lessons)
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.user_id == user.id,
            LessonProgress.course_id == c.id,
            LessonProgress.completed == True
        ).count()
        progress = round((completed_lessons / lesson_count * 100.0) if lesson_count > 0 else 0.0, 1)

        # find last accessed or next lesson
        next_lesson = None
        for l in c.lessons:
            lp = db.query(LessonProgress).filter(
                LessonProgress.user_id == user.id,
                LessonProgress.lesson_id == l.id,
                LessonProgress.completed == True
            ).first()
            if not lp:
                next_lesson = {"id": l.id, "title": l.title, "lesson_order": l.lesson_order}
                break

        if not next_lesson and c.lessons:
            next_lesson = {"id": c.lessons[0].id, "title": c.lessons[0].title, "lesson_order": c.lessons[0].lesson_order}

        results.append({
            "course_id": c.id,
            "title": c.title,
            "slug": c.slug,
            "short_description": c.short_description,
            "category": c.category,
            "difficulty": c.difficulty,
            "duration_hours": c.duration_hours,
            "thumbnail_url": c.thumbnail_url,
            "lesson_count": lesson_count,
            "completed_lessons_count": completed_lessons,
            "progress_percentage": progress,
            "enrolled_at": e.enrolled_at,
            "last_accessed_at": e.last_accessed_at,
            "status": e.status,
            "next_lesson": next_lesson
        })

    return results

@router.get("/{id_or_slug}", response_model=CourseDetailOut)
def get_course_detail(
    id_or_slug: str,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    course = None
    if id_or_slug.isdigit():
        course = db.query(Course).filter(Course.id == int(id_or_slug)).first()
    if not course:
        course = db.query(Course).filter(Course.slug == id_or_slug).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Check enrollment & progress
    enrolled = False
    progress = 0.0
    completed_ids = set()
    if user:
        enr = db.query(CourseEnrollment).filter(
            CourseEnrollment.user_id == user.id,
            CourseEnrollment.course_id == course.id
        ).first()
        if enr:
            enrolled = True
            comp_records = db.query(LessonProgress).filter(
                LessonProgress.user_id == user.id,
                LessonProgress.course_id == course.id,
                LessonProgress.completed == True
            ).all()
            completed_ids = {r.lesson_id for r in comp_records}
            if course.lessons:
                progress = round((len(completed_ids) / len(course.lessons)) * 100.0, 1)

    # Skills covered
    skills = []
    for cs in course.course_skills:
        if cs.skill:
            skills.append(cs.skill.name)

    # Lessons
    lessons_out = []
    for l in course.lessons:
        lessons_out.append(LessonOut(
            id=l.id,
            course_id=l.course_id,
            title=l.title,
            slug=l.slug,
            lesson_order=l.lesson_order,
            duration_minutes=l.duration_minutes,
            content_type=l.content_type,
            content_body=l.content_body,
            video_url=l.video_url,
            key_takeaways=l.key_takeaways or [],
            completed=l.id in completed_ids
        ))

    career_title = course.career_role.title if course.career_role else None

    return CourseDetailOut(
        id=course.id,
        title=course.title,
        slug=course.slug,
        short_description=course.short_description,
        description=course.description,
        category=course.category,
        difficulty=course.difficulty,
        duration_hours=course.duration_hours,
        estimated_weeks=course.estimated_weeks,
        thumbnail_url=course.thumbnail_url,
        badge=course.badge or "Popular",
        rating=course.rating,
        instructor_name=course.instructor_name,
        is_featured=course.is_featured,
        learning_outcomes=course.learning_outcomes or [],
        prerequisites_text=course.prerequisites_text,
        career_role_id=course.career_role_id,
        career_role_title=career_title,
        skills_covered=skills,
        lessons=lessons_out,
        enrolled=enrolled,
        progress_percentage=progress,
        completed_lessons_count=len(completed_ids)
    )

@router.post("/{id}/enroll")
def enroll_in_course(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == user.id,
        CourseEnrollment.course_id == id
    ).first()

    now = datetime.now(timezone.utc)
    if not enrollment:
        enrollment = CourseEnrollment(
            user_id=user.id,
            course_id=id,
            enrolled_at=now,
            last_accessed_at=now,
            status="active"
        )
        db.add(enrollment)
        db.commit()
        db.refresh(enrollment)
    else:
        enrollment.last_accessed_at = now
        db.commit()

    return {
        "message": f"Successfully enrolled in '{course.title}'",
        "course_id": course.id,
        "enrolled": True,
        "first_lesson_id": course.lessons[0].id if course.lessons else None
    }

@router.get("/{id}/learn")
def get_learning_interface(
    id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Auto-enroll if not enrolled
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == user.id,
        CourseEnrollment.course_id == id
    ).first()

    now = datetime.now(timezone.utc)
    if not enrollment:
        enrollment = CourseEnrollment(
            user_id=user.id,
            course_id=id,
            enrolled_at=now,
            last_accessed_at=now,
            status="active"
        )
        db.add(enrollment)
        db.commit()
    else:
        enrollment.last_accessed_at = now
        db.commit()

    # Get completed lesson IDs
    progress_records = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.course_id == id,
        LessonProgress.completed == True
    ).all()
    completed_ids = {r.lesson_id for r in progress_records}

    lessons_data = []
    first_incomplete_id = None
    for l in course.lessons:
        is_done = l.id in completed_ids
        if not is_done and first_incomplete_id is None:
            first_incomplete_id = l.id
        lessons_data.append({
            "id": l.id,
            "title": l.title,
            "slug": l.slug,
            "lesson_order": l.lesson_order,
            "duration_minutes": l.duration_minutes,
            "content_type": l.content_type,
            "content_body": l.content_body,
            "video_url": l.video_url,
            "key_takeaways": l.key_takeaways or [],
            "completed": is_done
        })

    progress = round((len(completed_ids) / len(course.lessons) * 100.0) if course.lessons else 0.0, 1)

    return {
        "course": {
            "id": course.id,
            "title": course.title,
            "slug": course.slug,
            "category": course.category,
            "difficulty": course.difficulty,
            "duration_hours": course.duration_hours,
        },
        "lessons": lessons_data,
        "completed_count": len(completed_ids),
        "total_lessons": len(course.lessons),
        "progress_percentage": progress,
        "current_lesson_id": first_incomplete_id or (course.lessons[0].id if course.lessons else None)
    }

@router.post("/{id}/lessons/{lesson_id}/complete")
def complete_lesson(
    id: int,
    lesson_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.course_id == id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found in this course")

    now = datetime.now(timezone.utc)
    rec = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.course_id == id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if not rec:
        rec = LessonProgress(
            user_id=user.id,
            course_id=id,
            lesson_id=lesson_id,
            completed=True,
            completed_at=now
        )
        db.add(rec)
    else:
        rec.completed = not rec.completed  # toggle completion state
        rec.completed_at = now if rec.completed else None

    # update enrollment last accessed
    enrollment = db.query(CourseEnrollment).filter(
        CourseEnrollment.user_id == user.id,
        CourseEnrollment.course_id == id
    ).first()
    if enrollment:
        enrollment.last_accessed_at = now

    db.commit()

    total_lessons = db.query(Lesson).filter(Lesson.course_id == id).count()
    completed_count = db.query(LessonProgress).filter(
        LessonProgress.user_id == user.id,
        LessonProgress.course_id == id,
        LessonProgress.completed == True
    ).count()

    progress = round((completed_count / total_lessons * 100.0) if total_lessons > 0 else 0.0, 1)

    if progress >= 100.0 and enrollment:
        enrollment.status = "completed"
        enrollment.completed_at = now
        db.commit()

    return {
        "lesson_id": lesson_id,
        "completed": rec.completed,
        "progress_percentage": progress,
        "completed_count": completed_count,
        "total_lessons": total_lessons
    }
