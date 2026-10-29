from sqlalchemy import Column, Integer, String, Boolean, Float, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student" or "admin"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("ResumeRecord", back_populates="user", cascade="all, delete-orphan")
    skill_estimates = relationship("StudentSkillEstimate", back_populates="user", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    roadmap_activities = relationship("LearningRoadmapActivity", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("UploadedLearningDocument", back_populates="user", cascade="all, delete-orphan")
    conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    quizzes = relationship("GeneratedQuiz", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    progress_history = relationship("ProgressHistory", back_populates="user", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    college = Column(String(255), nullable=True)
    degree = Column(String(100), nullable=True)
    branch = Column(String(100), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    bio = Column(Text, nullable=True)
    target_career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    learning_pace = Column(String(50), default="moderate")  # "relaxed", "moderate", "intensive"
    weekly_learning_hours = Column(Integer, default=10)
    preferred_learning_style = Column(String(50), default="hands-on")
    onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")
    target_career = relationship("CareerRole")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    career_requirements = relationship("CareerRequiredSkill", back_populates="skill")
    student_estimates = relationship("StudentSkillEstimate", back_populates="skill")


class SkillPrerequisite(Base):
    __tablename__ = "skill_prerequisites"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    prerequisite_skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    skill = relationship("Skill", foreign_keys=[skill_id])
    prerequisite = relationship("Skill", foreign_keys=[prerequisite_skill_id])


class CareerRole(Base):
    __tablename__ = "career_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), unique=True, index=True, nullable=False)
    slug = Column(String(150), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Engineering")
    suggested_topics = Column(JSON, nullable=True)  # List of string topics
    sample_projects = Column(JSON, nullable=True)   # List of sample project ideas
    created_at = Column(DateTime, default=utc_now)

    required_skills = relationship("CareerRequiredSkill", back_populates="career", cascade="all, delete-orphan")


class CareerRequiredSkill(Base):
    __tablename__ = "career_required_skills"

    id = Column(Integer, primary_key=True, index=True)
    career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    required_proficiency = Column(Float, default=75.0, nullable=False)  # 0 to 100
    importance_weight = Column(Float, default=1.0, nullable=False)     # 1.0 to 5.0
    rationale = Column(String(255), nullable=True)

    career = relationship("CareerRole", back_populates="required_skills")
    skill = relationship("Skill", back_populates="career_requirements")


class StudentSkillEstimate(Base):
    __tablename__ = "student_skill_estimates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    proficiency = Column(Float, default=0.0, nullable=False)  # 0 to 100
    confidence = Column(Float, default=0.2, nullable=False)   # 0.0 to 1.0
    source = Column(String(50), default="self")               # "resume", "self", "assessment", "quiz"
    assessment_count = Column(Integer, default=0)
    last_assessed_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="skill_estimates")
    skill = relationship("Skill", back_populates="student_estimates")


class ResumeRecord(Base):
    __tablename__ = "resume_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    raw_skills_json = Column(JSON, nullable=True)       # list of extracted skill names
    confirmed_skills_json = Column(JSON, nullable=True) # list of confirmed skill names
    education_text = Column(Text, nullable=True)
    experience_text = Column(Text, nullable=True)
    status = Column(String(50), default="processed")    # "pending", "processed", "failed"
    target_career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    target_career_title = Column(String(150), nullable=True)
    match_percentage = Column(Float, default=0.0)
    matching_skills_json = Column(JSON, nullable=True)
    missing_skills_json = Column(JSON, nullable=True)
    recommendations_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="resumes")
    target_career = relationship("CareerRole")


class AssessmentDefinition(Base):
    __tablename__ = "assessment_definitions"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String(50), default="medium")  # "easy", "medium", "hard"
    duration_minutes = Column(Integer, default=15)
    total_questions = Column(Integer, default=10)
    created_at = Column(DateTime, default=utc_now)

    career = relationship("CareerRole")
    skill = relationship("Skill")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessment_definitions.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    correct_option = Column(String(5), nullable=False)  # "A", "B", "C", "D"
    explanation = Column(Text, nullable=True)
    difficulty = Column(String(50), default="medium")

    assessment = relationship("AssessmentDefinition", back_populates="questions")
    skill = relationship("Skill")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessment_definitions.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    score = Column(Float, nullable=False)  # percentage 0 to 100
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    time_spent_seconds = Column(Integer, default=0)
    skill_scores_json = Column(JSON, nullable=True)  # breakdown {skill_id: score}
    completed_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="assessment_attempts")
    assessment = relationship("AssessmentDefinition", back_populates="attempts")
    responses = relationship("AssessmentResponse", back_populates="attempt", cascade="all, delete-orphan")


class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option = Column(String(5), nullable=False)
    is_correct = Column(Boolean, nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="responses")
    question = relationship("AssessmentQuestion")


class LearningResource(Base):
    __tablename__ = "learning_resources"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    topic = Column(String(150), nullable=False)
    resource_type = Column(String(50), default="article")  # "article", "video", "notes", "official_doc"
    url = Column(String(500), nullable=True)
    duration_minutes = Column(Integer, default=30)
    difficulty = Column(String(50), default="medium")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    skill = relationship("Skill")


class LearningRoadmapActivity(Base):
    __tablename__ = "learning_roadmap_activities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)
    topic = Column(String(200), nullable=False)
    learning_objective = Column(Text, nullable=False)
    difficulty = Column(String(50), default="medium")
    recommended_order = Column(Integer, default=1)
    estimated_duration_minutes = Column(Integer, default=60)
    resource_title = Column(String(255), nullable=True)
    resource_type = Column(String(50), default="tutorial")
    resource_url = Column(String(500), nullable=True)
    status = Column(String(50), default="pending")  # "pending", "in_progress", "completed", "skipped"
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="roadmap_activities")
    career = relationship("CareerRole")
    skill = relationship("Skill")


class UploadedLearningDocument(Base):
    __tablename__ = "uploaded_learning_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0)
    char_count = Column(Integer, default=0)
    chunk_count = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("uploaded_learning_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    page_number = Column(Integer, default=1)
    keywords_json = Column(JSON, nullable=True)  # extracted keywords for fast retrieval

    document = relationship("UploadedLearningDocument", back_populates="chunks")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), default="New Learning Session")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="conversations")
    messages = relationship("AIMessage", back_populates="conversation", cascade="all, delete-orphan")


class AIMessage(Base):
    __tablename__ = "ai_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("ai_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(50), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    sources_json = Column(JSON, nullable=True)  # [{doc_title, chunk_id, snippet, page}]
    created_at = Column(DateTime, default=utc_now)

    conversation = relationship("AIConversation", back_populates="messages")


class GeneratedQuiz(Base):
    __tablename__ = "generated_quizzes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    document_id = Column(Integer, ForeignKey("uploaded_learning_documents.id", ondelete="SET NULL"), nullable=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String(50), default="medium")
    total_questions = Column(Integer, default=5)
    created_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="quizzes")
    document = relationship("UploadedLearningDocument")
    skill = relationship("Skill")
    questions = relationship("GeneratedQuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class GeneratedQuizQuestion(Base):
    __tablename__ = "generated_quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("generated_quizzes.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(300), nullable=False)
    option_b = Column(String(300), nullable=False)
    option_c = Column(String(300), nullable=False)
    option_d = Column(String(300), nullable=False)
    correct_option = Column(String(5), nullable=False)
    explanation = Column(Text, nullable=True)

    quiz = relationship("GeneratedQuiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("generated_quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Float, nullable=False)  # percentage
    total_questions = Column(Integer, nullable=False)
    correct_count = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("GeneratedQuiz", back_populates="attempts")
    responses = relationship("QuizResponse", back_populates="attempt", cascade="all, delete-orphan")


class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("generated_quiz_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option = Column(String(5), nullable=False)
    is_correct = Column(Boolean, nullable=False)

    attempt = relationship("QuizAttempt", back_populates="responses")
    question = relationship("GeneratedQuizQuestion")


class ProgressHistory(Base):
    __tablename__ = "progress_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    career_id = Column(Integer, ForeignKey("career_roles.id", ondelete="CASCADE"), nullable=False)
    overall_readiness = Column(Float, default=0.0)
    assessed_skills_count = Column(Integer, default=0)
    avg_proficiency = Column(Float, default=0.0)
    snapshot_date = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="progress_history")
    career = relationship("CareerRole")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    event_type = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), unique=True, index=True, nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    short_description = Column(String(350), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), default="Beginner")  # "Beginner", "Intermediate", "Advanced"
    duration_hours = Column(Integer, default=20)
    estimated_weeks = Column(Integer, default=4)
    thumbnail_url = Column(String(500), nullable=True)
    badge = Column(String(50), default="Popular")  # "Bestseller", "Hot", "New", "Comprehensive"
    rating = Column(Float, default=4.8)
    instructor_name = Column(String(150), default="SkillMap AI Curriculum Team")
    is_featured = Column(Boolean, default=False)
    learning_outcomes = Column(JSON, nullable=True)  # List of strings
    prerequisites_text = Column(String(300), default="Basic computer literacy")
    career_role_id = Column(Integer, ForeignKey("career_roles.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=utc_now)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.lesson_order")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    course_skills = relationship("CourseSkill", back_populates="course", cascade="all, delete-orphan")
    career_role = relationship("CareerRole")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False)
    lesson_order = Column(Integer, default=1, nullable=False)
    duration_minutes = Column(Integer, default=15)
    content_type = Column(String(50), default="markdown")  # "markdown", "video", "interactive"
    content_body = Column(Text, nullable=False)  # Educational content, code snippets, explanations
    video_url = Column(String(500), nullable=True)
    key_takeaways = Column(JSON, nullable=True)  # List of summary bullets
    created_at = Column(DateTime, default=utc_now)

    course = relationship("Course", back_populates="lessons")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class CourseEnrollment(Base):
    __tablename__ = "course_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    enrolled_at = Column(DateTime, default=utc_now)
    last_accessed_at = Column(DateTime, default=utc_now)
    completed_at = Column(DateTime, nullable=True)
    status = Column(String(50), default="active")  # "active", "completed"

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="lesson_progress")
    lesson = relationship("Lesson", back_populates="progress_records")


class CourseSkill(Base):
    __tablename__ = "course_skills"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False)

    course = relationship("Course", back_populates="course_skills")
    skill = relationship("Skill")

