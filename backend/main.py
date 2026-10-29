from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, run_migrations
from app.services.seed_data import seed_database

# Routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router
from app.api.resumes import router as resumes_router
from app.api.careers import router as careers_router
from app.api.skills import router as skills_router
from app.api.assessments import router as assessments_router
from app.api.roadmap import router as roadmap_router
from app.api.resources import router as resources_router
from app.api.documents import router as documents_router
from app.api.learning_chat import router as learning_chat_router
from app.api.quizzes import router as quizzes_router
from app.api.analytics import router as analytics_router
from app.api.admin import router as admin_router
from app.api.courses import router as courses_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seed canonical data
    Base.metadata.create_all(bind=engine)
    run_migrations(engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="SkillMap AI API",
    description="AI-Powered Skill Gap Detection and Personalized Learning Platform Backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API Routers under /api
app.include_router(auth_router, prefix="/api")
app.include_router(profile_router, prefix="/api")
app.include_router(resumes_router, prefix="/api")
app.include_router(careers_router, prefix="/api")
app.include_router(skills_router, prefix="/api")
app.include_router(assessments_router, prefix="/api")
app.include_router(roadmap_router, prefix="/api")
app.include_router(resources_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(learning_chat_router, prefix="/api")
app.include_router(quizzes_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(courses_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "SkillMap AI API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
