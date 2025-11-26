# Script de deployment PowerShell para TuDestino
# Más robusto que el archivo .bat

param(
    [string]$ServerIP = "217.154.179.113",
    [string]$Domain = "tudestino.lat",
    [string]$RepoURL = "https://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@github.com/qipuh/tudestino.git"
)

Write-Host "🚀 Iniciando deployment de TuDestino..." -ForegroundColor Blue
Write-Host ""
Write-Host "Configuración:" -ForegroundColor Yellow
Write-Host "- Servidor: $ServerIP"
Write-Host "- Dominio: $Domain"
Write-Host "- Repositorio: $RepoURL"
Write-Host ""

# Función para ejecutar comandos SSH de forma segura
function Invoke-SSHCommand {
    param([string]$Command)
    
    $escapedCommand = $Command -replace '"', '\"'
    ssh root@$ServerIP $escapedCommand
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error ejecutando comando: $Command" -ForegroundColor Red
        return $false
    }
    return $true
}

# Paso 1: Verificar conexión
Write-Host "[PASO 1] Verificando conexión SSH..." -ForegroundColor Yellow
if (!(Invoke-SSHCommand "echo 'Conexión exitosa'")) {
    Write-Host "❌ No se puede conectar al servidor" -ForegroundColor Red
    exit 1
}

# Paso 2: Clonar repositorio (usando método público)
Write-Host "[PASO 2] Clonando repositorio..." -ForegroundColor Yellow
$cloneCommands = @(
    "cd /var/www",
    "rm -rf tudestino",
    "git clone $RepoURL tudestino"
)

foreach ($cmd in $cloneCommands) {
    if (!(Invoke-SSHCommand $cmd)) {
        Write-Host "❌ Error clonando repositorio" -ForegroundColor Red
        exit 1
    }
}

# Paso 3: Instalar dependencias del proyecto
Write-Host "[PASO 3] Instalando dependencias del proyecto..." -ForegroundColor Yellow
$npmCommands = @(
    "cd /var/www/tudestino && npm install",
    "cd /var/www/tudestino && npm run build:web"
)

foreach ($cmd in $npmCommands) {
    if (!(Invoke-SSHCommand $cmd)) {
        Write-Host "⚠️ Error en: $cmd" -ForegroundColor Yellow
    }
}

# Paso 4: Configurar variables de entorno para la API
Write-Host "[PASO 4] Configurando variables de entorno..." -ForegroundColor Yellow
$envContent = @"
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=tudestino
DB_PASSWORD=tudestino123
JWT_SECRET=`$(openssl rand -hex 32)
FRONTEND_URL=https://$Domain
BACKEND_URL=https://api.$Domain
"@

# Crear archivo .env
Invoke-SSHCommand "cd /var/www/tudestino/apps/api && cat > .env << 'ENVEOF'`n$envContent`nENVEOF"

# Paso 5: Configurar PM2
Write-Host "[PASO 5] Configurando PM2..." -ForegroundColor Yellow
$ecosystemContent = @"
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '/var/www/tudestino/apps/api',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/tudestino-api-error.log',
    out_file: '/var/log/pm2/tudestino-api-out.log',
    log_file: '/var/log/pm2/tudestino-api.log',
    time: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
"@

Invoke-SSHCommand "cd /var/www/tudestino/apps/api && cat > ecosystem.config.cjs << 'ECOEOF'`n$ecosystemContent`nECOEOF"

# Paso 6: Configurar Nginx para el dominio principal
Write-Host "[PASO 6] Configurando Nginx..." -ForegroundColor Yellow
$nginxMainConfig = @"
server {
    listen 80;
    server_name $Domain www.$Domain;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $Domain www.$Domain;
    
    root /var/www/tudestino/apps/web/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Handle React Router
    location / {
        try_files `$uri `$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)`$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
"@

Invoke-SSHCommand "cat > /etc/nginx/sites-available/$Domain << 'NGINXEOF'`n$nginxMainConfig`nNGINXEOF"

# Paso 7: Configurar Nginx para la API
Write-Host "[PASO 7] Configurando Nginx para API..." -ForegroundColor Yellow
$nginxAPIConfig = @"
server {
    listen 80;
    server_name api.$Domain;
    return 301 https://`$server_name`$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.$Domain;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
    
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }
}
"@

Invoke-SSHCommand "cat > /etc/nginx/sites-available/api.$Domain << 'APIEOF'`n$nginxAPIConfig`nAPIEOF"

# Paso 8: Habilitar sitios y recargar Nginx
Write-Host "[PASO 8] Habilitando sitios en Nginx..." -ForegroundColor Yellow
$nginxCommands = @(
    "ln -sf /etc/nginx/sites-available/$Domain /etc/nginx/sites-enabled/",
    "ln -sf /etc/nginx/sites-available/api.$Domain /etc/nginx/sites-enabled/",
    "rm -f /etc/nginx/sites-enabled/default",
    "nginx -t",
    "systemctl reload nginx"
)

foreach ($cmd in $nginxCommands) {
    Invoke-SSHCommand $cmd
}

# Paso 9: Configurar y ejecutar migraciones de base de datos
Write-Host "[PASO 9] Configurando base de datos..." -ForegroundColor Yellow
$dbCommands = @(
    "mysql -e `"CREATE DATABASE IF NOT EXISTS tudestino;`"",
    "mysql -e `"CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';`"",
    "mysql -e `"GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';`"",
    "mysql -e `"FLUSH PRIVILEGES;`"",
    "cd /var/www/tudestino/apps/api && npm run seed:mysql"
)

foreach ($cmd in $dbCommands) {
    Invoke-SSHCommand $cmd
}

# Paso 10: Iniciar API con PM2
Write-Host "[PASO 10] Iniciando API con PM2..." -ForegroundColor Yellow
$pm2Commands = @(
    "mkdir -p /var/log/pm2",
    "cd /var/www/tudestino/apps/api",
    "pm2 delete tudestino-api 2>/dev/null || true",
    "pm2 start ecosystem.config.cjs",
    "pm2 save",
    "pm2 startup"
)

foreach ($cmd in $pm2Commands) {
    Invoke-SSHCommand $cmd
}

# Paso 11: Configurar firewall
Write-Host "[PASO 11] Configurando firewall..." -ForegroundColor Yellow
$firewallCommands = @(
    "ufw allow ssh",
    "ufw allow 'Nginx Full'",
    "ufw allow 3000",
    "echo 'y' | ufw enable"
)

foreach ($cmd in $firewallCommands) {
    Invoke-SSHCommand $cmd
}

# Paso 12: Instalar SSL certificates
Write-Host "[PASO 12] Configurando SSL..." -ForegroundColor Yellow
$sslCommands = @(
    "apt install -y certbot python3-certbot-nginx",
    "certbot --nginx -d $Domain -d www.$Domain -d api.$Domain --non-interactive --agree-tos --email admin@$Domain || echo 'SSL installation will be configured manually'"
)

foreach ($cmd in $sslCommands) {
    Invoke-SSHCommand $cmd
}

Write-Host ""
Write-Host "✅ Deployment completado!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 URLs de acceso:" -ForegroundColor Blue
Write-Host "🌐 Web: https://$Domain"
Write-Host "🔌 API: https://api.$Domain"
Write-Host "🏥 Health: https://api.$Domain/health"
Write-Host ""
Write-Host "📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configurar DNS del dominio apuntando a $ServerIP"
Write-Host "2. Ejecutar: .\configure-web-env.ps1"
Write-Host "3. Verificar: .\verify-deployment.sh"
Write-Host ""
Write-Host "🔧 Comandos útiles en el servidor:" -ForegroundColor Cyan
Write-Host "- Ver logs API: pm2 logs tudestino-api"
Write-Host "- Reiniciar API: pm2 restart tudestino-api"
Write-Host "- Estado servicios: pm2 status"