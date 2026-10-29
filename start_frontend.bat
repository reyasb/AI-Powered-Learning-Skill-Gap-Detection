@echo off
echo Starting SkillMap AI Frontend...
cd /d "%~dp0frontend"
node ./node_modules/vite/bin/vite.js
pause
