@echo off
echo ========================================================
echo        SkillMap AI - Startup Orchestrator
echo ========================================================
cd /d "%~dp0"

echo Launching Backend server in new window...
start "SkillMap AI Backend" cmd /k "call .\.venv\Scripts\activate.bat && cd backend && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Launching Frontend in new window...
start "SkillMap AI Frontend" cmd /k "cd /d "%~dp0frontend" && node ./node_modules/vite/bin/vite.js"

echo.
echo Both servers are launching!
echo Backend API Docs: http://127.0.0.1:8000/docs
echo Frontend Portal:  http://localhost:5173
echo.
pause
