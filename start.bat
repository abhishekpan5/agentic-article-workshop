@echo off
echo 🚀 Starting AI Article Generator...

REM Check if .env file exists
if not exist .env (
    echo ⚠️  Warning: .env file not found!
    echo Please create a .env file with your OpenAI API key:
    echo OPENAI_API_KEY=your_api_key_here
    echo.
)

echo ✅ Prerequisites check passed!

REM Install Python dependencies if requirements.txt exists
if exist requirements.txt (
    echo 📦 Installing Python dependencies...
    pip install -r requirements.txt
)

REM Install frontend dependencies
if exist frontend (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo 🎯 Starting services...
echo.

REM Start backend in background
echo 🔧 Starting backend server...
cd backend
start "Backend Server" python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server...
cd frontend
start "Frontend Server" npm start
cd ..

echo.
echo ✅ Services started!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔌 Backend API: http://localhost:8000
echo 📚 API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services...

pause >nul

echo.
echo 🛑 Stopping services...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
echo ✅ Services stopped 