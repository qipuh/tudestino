@echo off
echo ========================================
echo    INICIANDO TUDESTINO
echo ========================================
echo.

echo [1/3] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)
echo OK: Node.js instalado
echo.

echo [2/3] Iniciando BACKEND (API)...
echo Abriendo nueva ventana para el backend...
start "TuDestino - Backend API" cmd /k "cd /d %~dp0 && npm run dev:api"
echo Esperando 5 segundos para que el backend inicie...
timeout /t 5 /nobreak >nul
echo.

echo [3/3] Iniciando FRONTEND (Web)...
echo Abriendo nueva ventana para el frontend...
start "TuDestino - Frontend Web" cmd /k "cd /d %~dp0 && npm run dev:web"
echo.

echo ========================================
echo    TUDESTINO INICIADO
echo ========================================
echo.
echo Backend API:  http://localhost:3000
echo Frontend Web: http://localhost:5173
echo.
echo Presiona cualquier tecla para abrir el navegador...
pause >nul

start http://localhost:5173

echo.
echo Para DETENER los servicios:
echo 1. Cierra las ventanas del Backend y Frontend
echo 2. O presiona Ctrl+C en cada ventana
echo.
pause
