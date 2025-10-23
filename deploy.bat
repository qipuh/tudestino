@echo off
echo ==========================================
echo    DESPLIEGUE TUDESTINO - PRODUCCION
echo ==========================================
echo.
echo Servidor: 74.208.69.243
echo Usuario: root
echo Destino: /var/www/vhosts/tudestino.qipuh.com/httpdocs
echo.

REM Crear directorio temporal para el despliegue
echo [1/5] Creando paquete de despliegue...
if exist deploy-temp rmdir /s /q deploy-temp
mkdir deploy-temp
mkdir deploy-temp\api
mkdir deploy-temp\web

REM Copiar API (sin node_modules)
echo [2/5] Copiando archivos de API...
xcopy apps\api deploy-temp\api /E /I /Q /EXCLUDE:deploy-exclude.txt
copy apps\api\.env.production deploy-temp\api\.env

REM Copiar Web (dist compilado)
echo [3/5] Copiando archivos de Web...
xcopy apps\web\dist deploy-temp\web /E /I /Q

REM Copiar shared package
echo [4/5] Copiando paquete compartido...
mkdir deploy-temp\shared
xcopy packages\shared deploy-temp\shared /E /I /Q /EXCLUDE:deploy-exclude.txt

echo.
echo [5/5] Archivos preparados en: deploy-temp\
echo.
echo ==========================================
echo SIGUIENTE PASO: Transferir archivos al servidor
echo ==========================================
echo.
echo Usa WinSCP, FileZilla o SCP para transferir:
echo   - deploy-temp\api\* --> /var/www/vhosts/tudestino.qipuh.com/httpdocs/api/
echo   - deploy-temp\web\* --> /var/www/vhosts/tudestino.qipuh.com/httpdocs/
echo   - deploy-temp\shared\* --> /var/www/vhosts/tudestino.qipuh.com/httpdocs/shared/
echo.
echo Luego ejecuta en el servidor:
echo   cd /var/www/vhosts/tudestino.qipuh.com/httpdocs/api
echo   npm install --production
echo   pm2 start src/index.js --name tudestino-api
echo.
pause
