import pytest
import os
import sys
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def get_demo_student_token():
    res = client.post("/api/auth/login", json={
        "email": "demo@skillmap.ai",
        "password": "DemoUser@2026"
    })
    assert res.status_code == 200
    return res.json()["access_token"]

def test_list_courses():
    res = client.get("/api/courses")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) >= 12
    slugs = [c["slug"] for c in courses]
    assert "data-structures-and-algorithms" in slugs
    assert "full-stack-web-development" in slugs
    assert "generative-ai-and-rag" in slugs

def test_filter_courses():
    res = client.get("/api/courses?category=Computer Science Fundamentals")
    assert res.status_code == 200
    cs_courses = res.json()
    assert len(cs_courses) >= 2
    for c in cs_courses:
        assert c["category"] == "Computer Science Fundamentals"

def test_search_courses():
    res = client.get("/api/courses?search=Python")
    assert res.status_code == 200
    results = res.json()
    assert len(results) >= 1
    assert any("python" in c["title"].lower() or "python" in c["short_description"].lower() for c in results)

def test_course_categories():
    res = client.get("/api/courses/categories")
    assert res.status_code == 200
    cats = res.json()
    assert len(cats) >= 5
    names = [c["category"] for c in cats]
    assert "Computer Science Fundamentals" in names

def test_course_detail_and_syllabus():
    res = client.get("/api/courses/data-structures-and-algorithms")
    assert res.status_code == 200
    data = res.json()
    assert "Data Structures" in data["title"]
    assert len(data["lessons"]) >= 5
    assert len(data["skills_covered"]) >= 1

def test_my_learning_and_enrollment():
    token = get_demo_student_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Demo student was seeded with enrollments
    res = client.get("/api/courses/my-learning", headers=headers)
    assert res.status_code == 200
    my_courses = res.json()
    assert len(my_courses) >= 1
    first = my_courses[0]
    assert "progress_percentage" in first

    # Interactive learn mode
    course_id = first["course_id"]
    learn_res = client.get(f"/api/courses/{course_id}/learn", headers=headers)
    assert learn_res.status_code == 200
    learn_data = learn_res.json()
    assert "lessons" in learn_data
    assert len(learn_data["lessons"]) > 0

    # Mark lesson completed
    first_lesson_id = learn_data["lessons"][0]["id"]
    comp_res = client.post(
        f"/api/courses/{course_id}/lessons/{first_lesson_id}/complete",
        headers=headers
    )
    assert comp_res.status_code == 200
    assert "completed" in comp_res.json()
    assert "progress_percentage" in comp_res.json()
