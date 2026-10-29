import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_login_demo_student():
    res = client.post("/api/auth/login", json={
        "email": "demo@skillmap.ai",
        "password": "DemoUser@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "demo@skillmap.ai"

def test_login_demo_admin():
    res = client.post("/api/auth/login", json={
        "email": "admin@skillmap.ai",
        "password": "AdminMaster@2026"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["user"]["role"] == "admin"

def test_careers_catalog():
    res = client.get("/api/careers")
    assert res.status_code == 200
    careers = res.json()
    assert len(careers) >= 10
    titles = [c["title"] for c in careers]
    assert "Software Developer" in titles
    assert "Full Stack Developer" in titles
    assert "AI/ML Engineer" in titles
    assert "DevOps Engineer" in titles

def test_authenticated_student_flow():
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": "demo@skillmap.ai",
        "password": "DemoUser@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Get Skill Gaps
    gap_res = client.get("/api/skills/gaps", headers=headers)
    assert gap_res.status_code == 200
    gap_data = gap_res.json()
    assert "readiness_score" in gap_data
    assert "skill_gaps" in gap_data

    # 3. Get Dashboard Analytics
    dash_res = client.get("/api/analytics/dashboard", headers=headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert "target_career" in dash_data
    assert "skill_proficiency_chart" in dash_data

    # 4. Get Roadmap
    roadmap_res = client.get("/api/roadmap", headers=headers)
    assert roadmap_res.status_code == 200
    roadmap_data = roadmap_res.json()
    assert "activities" in roadmap_data

    # 5. List Assessments
    ass_res = client.get("/api/assessments")
    assert ass_res.status_code == 200
    assert len(ass_res.json()) > 0

    # 6. Create Custom Assessment
    custom_res = client.post("/api/assessments/custom", json={
        "topic": "Python",
        "difficulty": "medium",
        "question_count": 3
    }, headers=headers)
    assert custom_res.status_code == 200
    custom_data = custom_res.json()
    assert "id" in custom_data
    assert len(custom_data["questions"]) > 0

    # 7. Submit Assessment & check strengths/improvements
    sub_res = client.post(f"/api/assessments/{custom_data['id']}/submit", json={
        "answers": [{"question_id": q["id"], "selected_option": "A"} for q in custom_data["questions"]],
        "time_spent_seconds": 65
    }, headers=headers)
    assert sub_res.status_code == 200
    sub_data = sub_res.json()
    assert "score" in sub_data
    assert "strengths" in sub_data
    assert "areas_to_improve" in sub_data
    assert "recommended_courses" in sub_data

    # 8. Test AI Learning Chat with general CS knowledge fallback
    chat_res = client.post("/api/learning/chat", json={
        "message": "Explain Binary Search and its time complexity in Python"
    }, headers=headers)
    assert chat_res.status_code == 200
    chat_data = chat_res.json()
    assert "response" in chat_data
    assert "Binary Search" in chat_data["response"] or "O(log n)" in chat_data["response"]

