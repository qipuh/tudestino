@echo off
echo Desplegando a produccion...

ssh root@161.132.38.151 "cd /var/www/tudestino && git pull origin main && cd apps/api && node scripts/link-property-to-business.js"

echo.
echo Despliegue completado!
pause
