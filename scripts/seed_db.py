import os
import sys

# Append backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import engine, Base, SessionLocal
from app.services.seed_data import seed_database

def main():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding canonical skills, careers, prerequisites, question banks, and demo accounts...")
        seed_database(db)
        print("Database successfully seeded!")
        print("Demo Student Account: demo@skillmap.ai / DemoUser@2026")
        print("Demo Admin Account:   admin@skillmap.ai / AdminMaster@2026")
    finally:
        db.close()

if __name__ == "__main__":
    main()
