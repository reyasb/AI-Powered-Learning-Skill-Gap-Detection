@echo off
echo Starting SkillMap AI Backend...
cd /d "%~dp0"
call .\.venv\Scripts\activate.bat
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
pause
