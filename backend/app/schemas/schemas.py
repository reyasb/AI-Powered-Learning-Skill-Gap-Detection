from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Auth & User Schemas ---
class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=2)
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    college: Optional[str] = None
    degree: Optional[str] = None
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    bio: Optional[str] = None
    target_career_id: Optional[int] = None
    learning_pace: Optional[str] = None
    weekly_learning_hours: Optional[int] = None
    preferred_learning_style: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=6)

# --- Skill Schemas ---
class SkillBase(BaseModel):
    id: int
    name: str
    category: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class CareerRoleBase(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    category: str
    suggested_topics: Optional[List[str]] = None
    sample_projects: Optional[List[str]] = None

    class Config:
        from_attributes = True

class CareerRoleDetail(CareerRoleBase):
    required_skills: List[Dict[str, Any]] = []

class SkillGapItem(BaseModel):
    skill_id: int
    skill_name: str
    category: str
    current_proficiency: float
    required_proficiency: float
    gap: float
    gap_percentage: float
    importance_weight: float
    priority_score: float
    severity: str  # "critical", "moderate", "strong"
    rationale: Optional[str] = None
    prerequisites_met: bool = True
    missing_prerequisites: List[str] = []

class CareerReadinessResponse(BaseModel):
    career_id: int
    career_title: str
    readiness_score: float  # 0 to 100
    total_required_skills: int
    assessed_skills_count: int
    strong_skills_count: int
    moderate_gap_count: int
    critical_gap_count: int
    skill_gaps: List[SkillGapItem]

# --- Resume Schemas ---
class ResumeExtractResponse(BaseModel):
    resume_id: int
    filename: str
    extracted_skills: List[str]
    education: Optional[str] = None
    experience: Optional[str] = None
    status: str

class ResumeConfirmSkills(BaseModel):
    skills: List[str]

# --- Assessment Schemas ---
class QuestionOut(BaseModel):
    id: int
    skill_id: Optional[int]
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    difficulty: str

class AssessmentDetailOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    career_id: Optional[int]
    difficulty: str
    duration_minutes: int
    total_questions: int
    questions: List[QuestionOut]

class AssessmentSubmitAnswer(BaseModel):
    question_id: int
    selected_option: str  # "A", "B", "C", "D"

class AssessmentSubmitRequest(BaseModel):
    answers: List[AssessmentSubmitAnswer]
    time_spent_seconds: int = 0

class CustomAssessmentRequest(BaseModel):
    career_id: Optional[int] = None
    skill_id: Optional[int] = None
    difficulty: Optional[str] = "all"
    question_count: int = 10

class AssessmentResultResponse(BaseModel):
    attempt_id: int
    score: float
    correct_count: int
    total_questions: int
    skill_breakdown: Dict[str, Dict[str, Any]]
    updated_readiness: float
    review: List[Dict[str, Any]]

# --- Roadmap Schemas ---
class RoadmapActivityOut(BaseModel):
    id: int
    skill_id: int
    skill_name: str
    topic: str
    learning_objective: str
    difficulty: str
    recommended_order: int
    estimated_duration_minutes: int
    resource_title: Optional[str]
    resource_type: Optional[str]
    resource_url: Optional[str]
    status: str
    completed_at: Optional[datetime]

class RoadmapActivityUpdate(BaseModel):
    status: str  # "pending", "in_progress", "completed", "skipped"

# --- RAG & Chat Schemas ---
class ChatMessageRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    document_ids: Optional[List[int]] = None

class ChatMessageResponse(BaseModel):
    conversation_id: int
    response: str
    sources: List[Dict[str, Any]] = []

# --- Quiz Schemas ---
class GenerateQuizRequest(BaseModel):
    document_id: Optional[int] = None
    skill_id: Optional[int] = None
    topic: Optional[str] = None
    total_questions: int = 5
    difficulty: str = "medium"

class QuizQuestionOut(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str

class QuizDetailOut(BaseModel):
    id: int
    title: str
    difficulty: str
    total_questions: int
    questions: List[QuizQuestionOut]

class QuizSubmitRequest(BaseModel):
    answers: List[AssessmentSubmitAnswer]

class QuizResultResponse(BaseModel):
    attempt_id: int
    score: float
    correct_count: int
    total_questions: int
    skill_updated: Optional[str] = None
    new_proficiency: Optional[float] = None
    review: List[Dict[str, Any]]

# --- Course & Learning Schemas ---
class LessonOut(BaseModel):
    id: int
    course_id: int
    title: str
    slug: str
    lesson_order: int
    duration_minutes: int
    content_type: str
    content_body: str
    video_url: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    completed: bool = False

class CourseCardOut(BaseModel):
    id: int
    title: str
    slug: str
    short_description: str
    category: str
    difficulty: str
    duration_hours: int
    estimated_weeks: int
    thumbnail_url: Optional[str] = None
    badge: str
    rating: float
    instructor_name: str
    is_featured: bool
    lesson_count: int
    enrolled: bool = False
    progress_percentage: float = 0.0

class CourseDetailOut(BaseModel):
    id: int
    title: str
    slug: str
    short_description: str
    description: str
    category: str
    difficulty: str
    duration_hours: int
    estimated_weeks: int
    thumbnail_url: Optional[str] = None
    badge: str
    rating: float
    instructor_name: str
    is_featured: bool
    learning_outcomes: Optional[List[str]] = None
    prerequisites_text: Optional[str] = None
    career_role_id: Optional[int] = None
    career_role_title: Optional[str] = None
    skills_covered: List[str] = []
    lessons: List[LessonOut] = []
    enrolled: bool = False
    progress_percentage: float = 0.0
    completed_lessons_count: int = 0

