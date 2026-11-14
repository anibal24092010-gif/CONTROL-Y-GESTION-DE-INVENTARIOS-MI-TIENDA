@echo off
TITLE MI TIENDA - Sistema de Control y Gestion de Inventarios
COLOR 0A
echo ========================================================
echo    INICIANDO EL SISTEMA MI TIENDA (FRONTEND + BACKEND)
echo ========================================================
echo.

:: 1. Iniciar el Servidor Backend (Node.js en el puerto 8080)
echo [1/3] Iniciando el servidor backend (Node.js)...
cd server
start cmd /k "node index.js"
cd ..

:: 2. Pausa de 3 segundos para que el backend conecte a la base de datos
timeout /t 3 /nobreak > nul

:: 3. Iniciar el Frontend (React) en una ventana independiente
echo [2/3] Iniciando la interfaz web (React)...
start cmd /k "npm start"

:: 4. Esperar a que el sistema cargue
echo [3/3] Iniciando la aplicacion web...
timeout /t 5 /nobreak > nul

echo.
echo ========================================================
echo    ¡SISTEMA EN EJECUCION CORRECTAMENTE!
echo    Para apagar el sistema, cierre las ventanas de consola.
echo ========================================================

