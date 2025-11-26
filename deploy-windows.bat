@echo off
setlocal enabledelayedexpansion

echo.
echo ===============================================
echo    DEPLOYMENT SCRIPT PARA TUDESTINO
echo ===============================================
echo.

REM Configuración
set SERVER_IP=217.154.179.113
set DOMAIN=tudestino.lat
set PROJECT_PATH=/var/www/tudestino
set REPO_URL=https://github.com/qipuh/tudestino.git

echo Configuracion:
echo - Servidor: %SERVER_IP%
echo - Dominio: %DOMAIN%
echo - Repositorio: %REPO_URL%
echo.

echo [PASO 1] Verificando conexion SSH...
ssh -o ConnectTimeout=10 root@%SERVER_IP% "echo 'Conexion exitosa'"
if errorlevel 1 (
    echo ERROR: No se puede conectar al servidor
    echo Verifica que:
    echo 1. El servidor este encendido
    echo 2. SSH este configurado
    echo 3. Las credenciales sean correctas
    pause
    exit /b 1
)

echo [PASO 2] Actualizando sistema...
ssh root@%SERVER_IP% "apt update && apt upgrade -y"

echo [PASO 3] Instalando dependencias del sistema...
ssh root@%SERVER_IP% "apt install -y curl wget git nginx mysql-server"

echo [PASO 4] Instalando Node.js y PM2...
ssh root@%SERVER_IP% "curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs && npm install -g pm2"

echo [PASO 5] Configurando MySQL...
ssh root@%SERVER_IP% "systemctl start mysql && systemctl enable mysql && mysql -e \"CREATE DATABASE IF NOT EXISTS tudestino;\" && mysql -e \"CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';\" && mysql -e \"GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';\" && mysql -e \"FLUSH PRIVILEGES;\""

echo [PASO 6] Clonando repositorio...
ssh root@%SERVER_IP% "cd /var/www && rm -rf tudestino && git clone %REPO_URL% tudestino"

echo [PASO 7] Instalando dependencias del proyecto...
ssh root@%SERVER_IP% "cd %PROJECT_PATH% && npm install"

echo [PASO 8] Construyendo aplicaciones...
ssh root@%SERVER_IP% "cd %PROJECT_PATH% && npm run build:web"

echo [PASO 9] Configurando variables de entorno...
ssh root@%SERVER_IP% "cd %PROJECT_PATH%/apps/api && cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=tudestino
DB_PASSWORD=tudestino123
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://%DOMAIN%
BACKEND_URL=https://api.%DOMAIN%
EOF"

echo [PASO 10] Configurando Nginx...
ssh root@%SERVER_IP% "cat > /etc/nginx/sites-available/%DOMAIN% << 'EOF'
server {
    listen 80;
    server_name %DOMAIN% www.%DOMAIN%;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name %DOMAIN% www.%DOMAIN%;
    
    root %PROJECT_PATH%/apps/web/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Handle React Router
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
    }
    
    # Uploads
    location /uploads/ {
        alias %PROJECT_PATH%/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control \"public\";
    }
}
EOF"

echo [PASO 11] Configurando sitio API...
ssh root@%SERVER_IP% "cat > /etc/nginx/sites-available/api.%DOMAIN% << 'EOF'
server {
    listen 80;
    server_name api.%DOMAIN%;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.%DOMAIN%;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    location /uploads/ {
        alias %PROJECT_PATH%/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control \"public\";
    }
}
EOF"

echo [PASO 12] Habilitando sitios en Nginx...
ssh root@%SERVER_IP% "ln -sf /etc/nginx/sites-available/%DOMAIN% /etc/nginx/sites-enabled/ && ln -sf /etc/nginx/sites-available/api.%DOMAIN% /etc/nginx/sites-enabled/ && rm -f /etc/nginx/sites-enabled/default && nginx -t && systemctl reload nginx"

echo [PASO 13] Configurando PM2...
ssh root@%SERVER_IP% "cd %PROJECT_PATH%/apps/api && cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '%PROJECT_PATH%/apps/api',
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
EOF"

echo [PASO 14] Iniciando API con PM2...
ssh root@%SERVER_IP% "cd %PROJECT_PATH%/apps/api && pm2 delete tudestino-api 2>/dev/null || true && pm2 start ecosystem.config.cjs && pm2 save && pm2 startup"

echo [PASO 15] Ejecutando migraciones de base de datos...
ssh root@%SERVER_IP% "cd %PROJECT_PATH%/apps/api && npm run seed:mysql"

echo [PASO 16] Instalando SSL certificates...
ssh root@%SERVER_IP% "apt install -y certbot python3-certbot-nginx && certbot --nginx -d %DOMAIN% -d www.%DOMAIN% -d api.%DOMAIN% --non-interactive --agree-tos --email admin@%DOMAIN% || echo 'SSL installation failed, configure manually'"

echo [PASO 17] Configurando firewall...
ssh root@%SERVER_IP% "ufw allow ssh && ufw allow 'Nginx Full' && ufw allow 3000 && ufw --force enable"

echo [PASO 18] Configurando scripts de backup y actualizacion...
ssh root@%SERVER_IP% "mkdir -p /backups && cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%%Y%%m%%d_%%H%%M%%S)
BACKUP_DIR=\"/backups\"
mysqldump -u tudestino -ptudestino123 tudestino > \$BACKUP_DIR/db_\$DATE.sql
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C %PROJECT_PATH%/apps/api uploads/
find \$BACKUP_DIR -name \"*.sql\" -mtime +7 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +7 -delete
EOF"

ssh root@%SERVER_IP% "chmod +x /root/backup.sh && (crontab -l 2>/dev/null; echo '0 2 * * * /root/backup.sh') | crontab -"

ssh root@%SERVER_IP% "cat > /root/update-tudestino.sh << 'EOF'
#!/bin/bash
cd %PROJECT_PATH%
echo \"Actualizando TuDestino...\"
/root/backup.sh
git pull origin main
npm install
npm run build:web
pm2 restart tudestino-api
nginx -t && systemctl reload nginx
echo \"TuDestino actualizado correctamente!\"
EOF"

ssh root@%SERVER_IP% "chmod +x /root/update-tudestino.sh"

echo.
echo ===============================================
echo          DEPLOYMENT COMPLETADO!
echo ===============================================
echo.
echo Web: https://%DOMAIN%
echo API: https://api.%DOMAIN%
echo.
echo Comandos utiles en el servidor:
echo - Ver logs API: pm2 logs tudestino-api
echo - Reiniciar API: pm2 restart tudestino-api
echo - Estado PM2: pm2 status
echo - Actualizar: /root/update-tudestino.sh
echo - Backup: /root/backup.sh
echo.
echo IMPORTANTE: Configura los DNS de tu dominio:
echo A    %DOMAIN%         %SERVER_IP%
echo A    www.%DOMAIN%     %SERVER_IP%
echo A    api.%DOMAIN%     %SERVER_IP%
echo.
pause