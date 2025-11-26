# Script adicional para configurar variables de entorno en la web
# Este script debe ejecutarse DESPUÉS del deployment principal

$SERVER_IP = "217.154.179.113"
$DOMAIN = "tudestino.lat"
$PROJECT_PATH = "/var/www/tudestino"

Write-Host "🔧 Configurando variables de entorno para la web..." -ForegroundColor Yellow

# Configurar .env para la web
ssh root@$SERVER_IP @"
cd $PROJECT_PATH/apps/web
cat > .env << 'EOF'
VITE_API_URL=https://$DOMAIN/api
VITE_SOCKET_URL=https://$DOMAIN
VITE_APP_NAME=TuDestino
VITE_APP_URL=https://$DOMAIN
EOF
"@

# Reconstruir la web con las nuevas variables
ssh root@$SERVER_IP @"
cd $PROJECT_PATH
npm run build:web
"@

# Reiniciar nginx
ssh root@$SERVER_IP "systemctl reload nginx"

Write-Host "✅ Variables de entorno configuradas correctamente!" -ForegroundColor Green
Write-Host "🌐 La web ahora apunta a: https://$DOMAIN/api" -ForegroundColor Blue