# SkillMap AI — AI-Powered Skill Gap Detection & Personalized Learning Platform

> A production-grade, full-stack intelligence platform that answers the 10 fundamental questions for every student learner: current skill inventory, target career proficiency benchmarks, mathematical skill gap severity, Bayesian reassessment updates, document-grounded RAG tutoring, and dynamic learning roadmaps.

---

## 1. Visual Design Language

Inspired by high-end futuristic enterprise analytics dashboards:
- **Palette**: Deep navy-black canvas (`#080912`), elevated card panels (`#101321` to `#17192B`), glowing violet accents (`#8B5CF6`), neon cyan (`#22D3EE`), and neon purple (`#C026D3`).
- **Data Visualizations**: Recharts radial readiness gauge, competency radar spectrum, gap severity distribution donut, and dual-axis proficiency comparison charts.
- **Glassmorphism & Neon Glow**: Thin neon panel borders, backdrop blur, and soft glowing status indicators.

---

## 2. Core Intelligent Workflows

```
REGISTER / LOGIN
  ↳ COMPLETE MULTI-STEP ONBOARDING
  ↳ UPLOAD PDF RESUME (PyMuPDF Text & Skill Extraction)
  ↳ NORMALIZE ALIASES (JS ➔ JavaScript, ML ➔ Machine Learning, K8s ➔ Kubernetes)
  ↳ CONFIRM EXTRACTED SKILLS TO PROFILE (Baseline evidence)
  ↳ SELECT TARGET CAREER ROLE (10+ Industry Standards)
  ↳ TAKE BENCHMARK SKILL ASSESSMENT (Real MCQ Question Bank)
  ↳ CALCULATE DETERMINISTIC SKILL GAPS: gap = max(0, required - current)
  ↳ ADAPTIVE BAYESIAN PROFICIENCY UPDATE: alpha * prior + (1 - alpha) * score
  ↳ GENERATE & RECALCULATE DYNAMIC LEARNING ROADMAP
  ↳ STUDY CURATED RESOURCES & UPLOAD PERSONAL STUDY NOTES
  ↳ ASK AI ASSISTANT (RAG Grounded with Page & Chunk Citations)
  ↳ GENERATE AI MCQ QUIZZES FROM NOTES OR SKILLS
  ↳ RETAKE EVALUATIONS & TRACK REASSESSMENT TRAJECTORY
```

---

## 3. Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4 with custom neon shadows, glassmorphism, and dark theme
- **Data Visualization**: Recharts (Radial SVG gauges, Radar Chart, Bar Chart, Donut Chart, Line Chart)
- **Icons**: Lucide React
- **Routing**: React Router 7 (Protected routes, Role-based admin guards, layout outlets)
- **API Client**: Axios with JWT Bearer interceptor and automatic session management

### Backend
- **Framework**: Python FastAPI
- **Database ORM**: SQLAlchemy 2.0 with connection pooling
- **Security**: JWT authentication (`python-jose`), bcrypt password hashing (`passlib`/`bcrypt`)
- **Document & Resume Ingestion**: PyMuPDF (`fitz`) for PDF text stream extraction
- **RAG & Search Engine**: Sliding window sentence chunker with keyword & semantic term-frequency ranking
- **AI Quiz Generator**: Structured MCQ generator with validation, answer isolation, and fallback generator
- **Exporting**: Direct CSV analytics report streaming

---

## 4. Project Structure

```
AI-Powered Learning & Skill Gap Detection/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth.py              # Register, login, current user, password change
│   │   │   ├── courses.py           # Course catalogue, syllabus, enrollments, interactive learn
│   │   │   ├── profile.py           # Student profile, onboarding wizard, account deletion
│   │   │   ├── resumes.py           # PDF upload, PyMuPDF parsing, skill confirmation
│   │   │   ├── careers.py           # 10+ role catalogue, requirements, targets
│   │   │   ├── skills.py            # Skills catalog, user estimates, readiness
│   │   │   ├── assessments.py       # Benchmark evaluations, Bayesian updates, history
│   │   │   ├── roadmap.py           # Milestone activities, status toggling, recalculation
│   │   │   ├── resources.py         # Curated articles, official docs, tutorials
│   │   │   ├── documents.py         # Student study note uploads, vector chunking
│   │   │   ├── learning_chat.py     # RAG learning assistant with source page citations
│   │   │   ├── quizzes.py           # AI quiz generation, evaluation, reassessment
│   │   │   ├── analytics.py         # Dashboard metrics, progress trends, CSV exports
│   │   │   └── admin.py             # Role management, skill weights, usage metrics
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic BaseSettings (.env loading)
│   │   │   ├── database.py          # SQLAlchemy engine, session maker, get_db
│   │   │   └── security.py          # Bcrypt hashing, JWT encode/decode
│   │   ├── models/
│   │   │   └── models.py            # Normalized database schema & relationships
│   │   ├── schemas/
│   │   │   └── schemas.py           # Pydantic request/response validation schemas
│   │   └── services/
│   │       ├── courses_seed_data.py # 12 canonical engineering courses & 72 lesson syllabi
│   │       ├── skill_engine.py      # Deterministic gap math & Bayesian update formulas
│   │       ├── resume_parser.py     # PyMuPDF extractor & alias normalizer
│   │       ├── rag_service.py       # Chunking, BM25 scoring & source attribution
│   │       ├── quiz_service.py      # Structured quiz synthesizer
│   │       └── seed_data.py         # Canonical dataset for 10 roles, questions, resources
│   ├── tests/
│   │   ├── test_skillmap.py         # Core mathematical formulas & service tests
│   │   ├── test_api_integration.py # Full integration tests
│   │   └── test_courses_api.py     # Course catalogue, syllabus & enrollment tests
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── PublicNavbar.tsx     # Public branding, search, navigation & auth pill
│   │   │   └── Footer.tsx           # Educational platform footer with demo credentials
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # JWT session management & user state
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx  # Student workspace sidebar & navigation
│   │   ├── pages/
│   │   │   ├── Home.tsx             # GeeksforGeeks-inspired public homepage
│   │   │   ├── CourseCatalogue.tsx  # Course discovery with search, categories & filters
│   │   │   ├── CourseDetail.tsx     # Full syllabus overview & enrollment action
│   │   │   ├── CourseLearn.tsx      # Interactive lesson workspace with code sandboxes
│   │   │   ├── MyLearning.tsx       # Enrolled courses with active progress tracking
│   │   │   ├── About.tsx            # Platform mission, architecture & technology
│   │   │   ├── ForgotPassword.tsx   # Password recovery interface
│   │   │   ├── Login.tsx            # Login with quick 1-click Demo Autofill
│   │   │   ├── Register.tsx         # Comprehensive student registration
│   │   │   ├── Onboarding.tsx       # Multi-step goal & preference wizard
│   │   │   ├── OverviewDashboard.tsx# Futuristic KPI metrics & analytics charts
│   │   │   ├── ResumeAnalysis.tsx   # PDF drag-and-drop, extraction & skill editor
│   │   │   ├── CareerExplorer.tsx   # 10+ searchable roles with competency benchmarks
│   │   │   ├── SkillAssessment.tsx  # Assessment engine with timer & explanations
│   │   │   ├── SkillGapAnalysis.tsx # Gap formula breakdown & priority scores
│   │   │   ├── LearningRoadmap.tsx  # Dynamic milestones, activity toggles
│   │   │   ├── LearningLibrary.tsx  # Curated resources & student document uploads
│   │   │   ├── AILearningAssistant.tsx # RAG chat with cited page numbers
│   │   │   ├── AIQuizGenerator.tsx  # Document/skill MCQ generator & runner
│   │   │   ├── ProgressAnalytics.tsx# Radar spectrum, severity donut, trend lines
│   │   │   ├── Settings.tsx         # Profile update, password change, data purge
│   │   │   └── AdminPortal.tsx      # Role management & platform metrics
│   │   ├── services/
│   │   │   └── api.ts               # Axios client with bearer tokens
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interface contracts
│   │   ├── App.tsx                  # Routing hierarchy with auth guards
│   │   ├── index.css                # Tailwind base & custom neon utilities
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── scripts/
│   └── seed_db.py                   # Standalone database initialization script
├── start_all.bat                    # One-click startup for Windows
├── start_backend.bat
├── start_frontend.bat
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 5. Quick Start Guide

### Prerequisites
- Python 3.10+ (Tested on Python 3.13)
- Node.js 18+ (Tested on Node.js v24.18)

### Option A: One-Click Windows Launch
Double-click:
```bat
start_all.bat
```
This automatically launches both backend and frontend servers in separate console windows.

### Option B: Manual Setup

#### 1. Backend Setup
```powershell
# Navigate to project root
cd "d:\AI-Powered Learning & Skill Gap Detection"

# Activate Python virtual environment
.\.venv\Scripts\activate.bat

# Install backend dependencies
python -m pip install -r backend/requirements.txt

# Run database migration & canonical seeding
python scripts/seed_db.py

# Launch FastAPI backend
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation (Swagger UI) is available at: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
```powershell
# Open a second terminal
cd "d:\AI-Powered Learning & Skill Gap Detection\frontend"

# Install dependencies (if not already installed)
npm install

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 6. Pre-Configured Demo Accounts

For immediate evaluation, the login page features **1-Click Demo Autofill** buttons:

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `demo@skillmap.ai` | `DemoUser@2026` | Full Stack Engineer track with sample skills, history, and roadmap |
| **Demo Admin** | `admin@skillmap.ai` | `AdminMaster@2026` | Full administrative access to manage careers, question bank, and metrics |

You can also register a brand new student account at any time through the **Register** page.

---

## 7. AI & LLM Configuration

The application is engineered with high resilience:
- **Zero API Key Requirement**: If `LLM_API_KEY` is not provided in `.env`, SkillMap AI runs with its built-in intelligent NLP regex parser, alias normalizer, deterministic BM25 vector chunk retriever, and grounded extractive answer synthesizer.
- **Optional Generative Expansion**: To connect OpenAI or Gemini models, simply edit `.env`:
  ```ini
  LLM_PROVIDER=openai
  LLM_API_KEY=sk-...your-key...
  LLM_MODEL=gpt-4o-mini
  ```

---

## 8. Verification & Test Suite

The test suite validates authentication, security hashing, resume parsing, alias normalization, deterministic gap calculations, Bayesian proficiency updates, and RAG chunking/retrieval.

Run backend tests:
```powershell
.\.venv\Scripts\pytest backend/tests/test_skillmap.py -v
```
**Test Results:**
```
backend/tests/test_skillmap.py::test_password_hashing PASSED             [ 16%]
backend/tests/test_skillmap.py::test_jwt_tokens PASSED                   [ 33%]
backend/tests/test_skillmap.py::test_resume_parser_skills_and_aliases PASSED [ 50%]
backend/tests/test_skillmap.py::test_skill_gap_calculation PASSED        [ 66%]
backend/tests/test_skillmap.py::test_bayesian_proficiency_update PASSED  [ 83%]
backend/tests/test_skillmap.py::test_rag_chunking_and_retrieval PASSED   [100%]
======================== 6 passed, 8 warnings in 2.21s ========================
```

Run frontend production build verification:
```powershell
cd frontend
npm run build
```
**Build Results:**
```
✓ 2612 modules transformed.
✓ built in 1.38s (dist/ generated cleanly with zero errors)
```

---

## 9. Containerized Deployment:

Services:
-Link: "https://skillmap-ai-omega.vercel.app"
