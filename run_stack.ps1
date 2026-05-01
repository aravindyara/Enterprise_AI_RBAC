# --- Nexus AI Stack Launcher ---
Write-Host "🛡️ Starting Nexus AI Security Stack..." -ForegroundColor Cyan

# 1. Start Backend (FastAPI)
Write-Host "🚀 Launching Layer 2 Backend (FastAPI)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python main.py"

# 2. Start Frontend (Vite)
Write-Host "✨ Launching Layer 5 Frontend (React/Vite)..." -ForegroundColor Magenta
Set-Location frontend
npm run dev
