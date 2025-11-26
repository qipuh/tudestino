#!/bin/bash

# DEPLOYMENT SCRIPT FINAL - TuDestino
# Con credenciales correctas

set -e

# Configuración
SERVER_IP="217.154.179.113"
DOMAIN="tudestino.lat"
GIT_TOKEN="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"
REPO_URL="https://${GIT_TOKEN}@github.com/qipuh/tudestino.git"

echo "🚀 Iniciando deployment de TuDestino..."
echo "Servidor: $SERVER_IP"
echo "Dominio: $DOMAIN"
echo ""

# Función para ejecutar comandos SSH
run_ssh() {
    sshpass -p 'xjuBTnE2' ssh -o StrictHostKeyChecking=no root@$SERVER_IP "$1"
}

echo "📦 Paso 1: Instalando dependencias del sistema..."
run_ssh "apt update && apt upgrade -y"
run_ssh "apt install -y curl wget git nginx mysql-server"

echo "📦 Paso 2: Instalando Node.js y PM2..."
run_ssh "curl -fsSL https://deb.nodesource.com/setup_20.x | bash -"
run_ssh "apt install -y nodejs"
run_ssh "npm install -g pm2"

echo "🗄️ Paso 3: Configurando MySQL..."
run_ssh "systemctl start mysql && systemctl enable mysql"
run_ssh "mysql -e \"CREATE DATABASE IF NOT EXISTS tudestino;\""
run_ssh "mysql -e \"CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';\""
run_ssh "mysql -e \"GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';\""
run_ssh "mysql -e \"FLUSH PRIVILEGES;\""

echo "📥 Paso 4: Clonando proyecto con token..."
run_ssh "cd /var/www && rm -rf tudestino"
run_ssh "cd /var/www && git clone $REPO_URL tudestino"

echo "📦 Paso 5: Instalando dependencias del proyecto..."
run_ssh "cd /var/www/tudestino && npm install"
run_ssh "cd /var/www/tudestino && npm run build:web"

echo "⚙️ Paso 6: Configurando variables de entorno..."
run_ssh "cd /var/www/tudestino/apps/api && cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=tudestino
DB_PASSWORD=tudestino123
JWT_SECRET=\$(openssl rand -hex 32)
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://api.$DOMAIN
EOF"

run_ssh "cd /var/www/tudestino/apps/web && cat > .env << 'EOF'
VITE_API_URL=https://$DOMAIN/api
VITE_SOCKET_URL=https://$DOMAIN
VITE_APP_NAME=TuDestino
VITE_APP_URL=https://$DOMAIN
EOF"

echo "🔄 Paso 7: Configurando PM2..."
run_ssh "cd /var/www/tudestino/apps/api && cat > ecosystem.config.cjs << 'EOF'
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
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF"

echo "🌐 Paso 8: Configurando Nginx..."
run_ssh "cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    root /var/www/tudestino/apps/web/dist;
    index index.html;
    
    location / {
        try_files \\\$uri \\\$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host \\\$host;
    }
    
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
    }
}
EOF"

run_ssh "cat > /etc/nginx/sites-available/api.$DOMAIN << 'EOF'
server {
    listen 80;
    server_name api.$DOMAIN;
    return 301 https://\\\$server_name\\\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }
    
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
    }
}
EOF"

echo "🔗 Paso 9: Habilitando sitios en Nginx..."
run_ssh "ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
run_ssh "ln -sf /etc/nginx/sites-available/api.$DOMAIN /etc/nginx/sites-enabled/"
run_ssh "rm -f /etc/nginx/sites-enabled/default"
run_ssh "nginx -t && systemctl reload nginx"

echo "🗄️ Paso 10: Ejecutando migraciones..."
run_ssh "cd /var/www/tudestino/apps/api && npm run seed:mysql"

echo "🚀 Paso 11: Iniciando API con PM2..."
run_ssh "mkdir -p /var/log/pm2"
run_ssh "cd /var/www/tudestino/apps/api && pm2 delete tudestino-api 2>/dev/null || true"
run_ssh "cd /var/www/tudestino/apps/api && pm2 start ecosystem.config.cjs"
run_ssh "pm2 save && pm2 startup"

echo "🔥 Paso 12: Configurando firewall..."
run_ssh "ufw allow ssh && ufw allow 'Nginx Full' && ufw allow 3000"
run_ssh "echo 'y' | ufw enable"

echo "🔒 Paso 13: Instalando SSL..."
run_ssh "apt install -y certbot python3-certbot-nginx"
run_ssh "certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo 'SSL se configurará manualmente'"

echo ""
echo "✅ DEPLOYMENT COMPLETADO!"
echo ""
echo "🌐 URLs disponibles:"
echo "- Web: https://$DOMAIN"
echo "- API: https://api.$DOMAIN"
echo "- Health: https://api.$DOMAIN/health"
echo ""
echo "🔧 Comandos útiles:"
echo "- Ver logs: ssh root@$SERVER_IP 'pm2 logs tudestino-api'"
echo "- Reiniciar: ssh root@$SERVER_IP 'pm2 restart tudestino-api'"
echo "- Estado: ssh root@$SERVER_IP 'pm2 status'"
echo ""
echo "📋 IMPORTANTE: Configura estos DNS:"
echo "A    $DOMAIN           $SERVER_IP"
echo "A    www.$DOMAIN       $SERVER_IP"
echo "A    api.$DOMAIN       $SERVER_IP"