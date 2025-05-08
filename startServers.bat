@echo off
echo Starting InertiaFit servers...

echo Checking Node.js version...
node -v
echo Required: Node.js v18.x

echo Starting Flask backend server...
start cmd /k "cd %~dp0backend && python app.py"

echo Starting React frontend server...
start cmd /k "cd %~dp0 && npm start"

echo Both servers should now be starting.
echo Flask backend: http://localhost:5000
echo React frontend: http://localhost:3000 or 3001
echo.
echo IMPORTANT: If you see errors, please make sure Node.js v18.x is installed
echo IMPORTANT: If you see errors, please follow the instructions in RUN_INSTRUCTIONS.md 