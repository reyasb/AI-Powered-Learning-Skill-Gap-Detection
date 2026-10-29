from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def run_migrations(engine_instance):
    """Safely adds missing columns to SQLite / PostgreSQL tables without data loss."""
    try:
        with engine_instance.connect() as conn:
            # Check resume_records
            result = conn.execute(text("PRAGMA table_info(resume_records)")).fetchall()
            cols = [row[1] for row in result]
            if cols:
                if "target_career_id" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN target_career_id INTEGER"))
                if "target_career_title" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN target_career_title VARCHAR(150)"))
                if "match_percentage" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN match_percentage FLOAT DEFAULT 0.0"))
                if "matching_skills_json" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN matching_skills_json JSON"))
                if "missing_skills_json" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN missing_skills_json JSON"))
                if "recommendations_json" not in cols:
                    conn.execute(text("ALTER TABLE resume_records ADD COLUMN recommendations_json JSON"))
                conn.commit()
    except Exception as e:
        print(f"Migration note: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
