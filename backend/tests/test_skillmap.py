import pytest
import os
import sys

# Ensure backend folder is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.database import SessionLocal, Base, engine
from app.models.models import User, StudentProfile, Skill, CareerRole, CareerRequiredSkill, StudentSkillEstimate
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.services.skill_engine import SkillIntelligenceEngine
from app.services.resume_parser import ResumeParserService
from app.services.rag_service import chunk_text, RAGService

@pytest.fixture(scope="module")
def db_session():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    yield db
    db.close()

def test_password_hashing():
    pwd = "SecureStudentPass@123"
    hashed = get_password_hash(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_tokens():
    token = create_access_token(subject=999, role="student")
    payload = decode_access_token(token)
    assert payload is not None
    assert payload["sub"] == "999"
    assert payload["role"] == "student"

def test_resume_parser_skills_and_aliases():
    sample_resume_text = (
        "John Doe - Senior Software Engineer\n"
        "Experience in building scalable web apps with React, Python, and TypeScript.\n"
        "Experienced in backend architectures using FastAPI, PostgreSQL, and Docker containerization.\n"
        "Also applied ML and Scikit-Learn for data classification and K8s orchestration."
    )
    res = ResumeParserService.extract_skills_and_sections(sample_resume_text)
    extracted = res["extracted_skills"]
    assert "React" in extracted
    assert "Python" in extracted
    assert "TypeScript" in extracted
    assert "FastAPI" in extracted
    assert "PostgreSQL" in extracted
    assert "Docker" in extracted
    # Alias tests
    assert "Machine Learning" in extracted  # from "ML"
    assert "Kubernetes" in extracted        # from "K8s"

def test_skill_gap_calculation(db_session):
    # Retrieve demo user and full stack career
    demo = db_session.query(User).filter(User.email == "demo@skillmap.ai").first()
    assert demo is not None

    career = db_session.query(CareerRole).filter(CareerRole.slug == "full-stack-developer").first()
    assert career is not None

    gap_data = SkillIntelligenceEngine.calculate_skill_gaps(db_session, demo.id, career.id)
    assert "readiness_score" in gap_data
    assert "skill_gaps" in gap_data
    assert len(gap_data["skill_gaps"]) > 0

    first_gap = gap_data["skill_gaps"][0]
    assert "gap" in first_gap
    assert "priority_score" in first_gap
    assert "severity" in first_gap
    assert first_gap["severity"] in ["critical", "moderate", "strong"]

def test_bayesian_proficiency_update(db_session):
    demo = db_session.query(User).filter(User.email == "demo@skillmap.ai").first()
    python_skill = db_session.query(Skill).filter(Skill.name == "Python").first()

    # Initial assessment score = 80
    new_prof = SkillIntelligenceEngine.update_skill_proficiency(
        db=db_session,
        user_id=demo.id,
        skill_id=python_skill.id,
        assessment_score=80.0,
        source="assessment"
    )
    assert new_prof > 0.0

    # Subsequent score
    next_prof = SkillIntelligenceEngine.update_skill_proficiency(
        db=db_session,
        user_id=demo.id,
        skill_id=python_skill.id,
        assessment_score=100.0,
        source="assessment"
    )
    # Check that repeated evidence updates smoothly
    assert next_prof >= new_prof

def test_rag_chunking_and_retrieval():
    doc_text = (
        "FastAPI is a modern, fast web framework for building APIs with Python 3.8+ based on standard Python type hints. "
        "The key features are fast performance, rapid development velocity, fewer bugs, intuitive editor support, and automatic interactive docs. "
        "It uses Pydantic for data validation and Starlette for routing and async support. "
        "Dependency injection in FastAPI allows clean separation of concerns and reusable database sessions."
    )
    chunks = chunk_text(doc_text, chunk_size=120, overlap=20)
    assert len(chunks) >= 2

    # Mock chunk objects for retrieval
    class MockChunk:
        def __init__(self, id, doc_id, page, content):
            self.id = id
            self.document_id = doc_id
            self.page_number = page
            self.content = content

    mock_chunks = [MockChunk(i, 1, 1, c["content"]) for i, c in enumerate(chunks)]
    retrieved = RAGService.retrieve_relevant_chunks("Pydantic validation and dependency injection", mock_chunks, top_k=2)
    assert len(retrieved) > 0
    assert any("pydantic" in r["content"].lower() or "dependency" in r["content"].lower() for r in retrieved)
