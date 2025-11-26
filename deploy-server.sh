#!/bin/bash

# Script de deployment para TuDestino
# Servidor: 217.154.179.113
# Dominio: tudestino.lat

set -e

echo "🚀 Iniciando deployment de TuDestino..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SERVER_IP="217.154.179.113"
DOMAIN="tudestino.lat"
PROJECT_PATH="/var/www/tudestino"
REPO_URL="https://github.com/qipuh/tudestino.git"
API_PORT="3000"
WEB_PORT="80"

# Función para ejecutar comandos en el servidor
run_remote() {
    ssh root@$SERVER_IP "$1"
}

echo -e "${BLUE}📋 Configuración:${NC}"
echo -e "Servidor: $SERVER_IP"
echo -e "Dominio: $DOMAIN"
echo -e "Repositorio: $REPO_URL"
echo -e "Puerto API: $API_PORT"
echo ""

# 1. Actualizar sistema y instalar dependencias
echo -e "${YELLOW}📦 Instalando dependencias del sistema...${NC}"
run_remote "
apt update && apt upgrade -y
apt install -y curl wget git nginx mysql-server
"

# 2. Instalar Node.js y npm
echo -e "${YELLOW}📦 Instalando Node.js...${NC}"
run_remote "
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
"

# 3. Configurar MySQL
echo -e "${YELLOW}🗄️ Configurando MySQL...${NC}"
run_remote "
systemctl start mysql
systemctl enable mysql

# Configurar MySQL
mysql -e \"CREATE DATABASE IF NOT EXISTS tudestino;\"
mysql -e \"CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';\"
mysql -e \"GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';\"
mysql -e \"FLUSH PRIVILEGES;\"
"

# 4. Clonar repositorio
echo -e "${YELLOW}📥 Clonando repositorio...${NC}"
run_remote "
cd /var/www
rm -rf tudestino
git clone $REPO_URL tudestino
cd tudestino
"

# 5. Instalar dependencias del proyecto
echo -e "${YELLOW}📦 Instalando dependencias del proyecto...${NC}"
run_remote "
cd $PROJECT_PATH
npm install
npm run build:web
npm run build:api
"

# 6. Configurar variables de entorno para la API
echo -e "${YELLOW}⚙️ Configurando variables de entorno...${NC}"
run_remote "
cd $PROJECT_PATH/apps/api
cat > .env << EOF
NODE_ENV=production
PORT=$API_PORT
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=tudestino
DB_PASSWORD=tudestino123
JWT_SECRET=\$(openssl rand -hex 32)
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://api.$DOMAIN
EOF
"

# 7. Configurar Nginx
echo -e "${YELLOW}🌐 Configurando Nginx...${NC}"
run_remote "
# Configuración para el frontend
cat > /etc/nginx/sites-available/$DOMAIN << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL Configuration (will be configured with Certbot)
    # ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    root $PROJECT_PATH/apps/web/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    add_header Referrer-Policy \"no-referrer-when-downgrade\" always;
    add_header Content-Security-Policy \"default-src 'self' http: https: data: blob: 'unsafe-inline'\" always;
    
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
        proxy_pass http://localhost:$API_PORT;
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
        proxy_pass http://localhost:$API_PORT;
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
        alias $PROJECT_PATH/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control \"public\";
    }
}
EOF

# Configuración para la API (subdomain)
cat > /etc/nginx/sites-available/api.$DOMAIN << 'EOF'
server {
    listen 80;
    server_name api.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;
    
    # SSL Configuration (will be configured with Certbot)
    # ssl_certificate /etc/letsencrypt/live/api.$DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.$DOMAIN/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options \"SAMEORIGIN\" always;
    add_header X-Content-Type-Options \"nosniff\" always;
    add_header X-XSS-Protection \"1; mode=block\" always;
    
    # API
    location / {
        proxy_pass http://localhost:$API_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Uploads
    location /uploads/ {
        alias $PROJECT_PATH/apps/api/uploads/;
        expires 30d;
        add_header Cache-Control \"public\";
    }
}
EOF

# Habilitar sitios
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar configuración
nginx -t && systemctl reload nginx
"

# 8. Configurar PM2 para la API
echo -e "${YELLOW}🔄 Configurando PM2...${NC}"
run_remote "
cd $PROJECT_PATH/apps/api

# Crear ecosystem file
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '$PROJECT_PATH/apps/api',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: $API_PORT
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
EOF

# Inicializar API con PM2
pm2 delete tudestino-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
"

# 9. Ejecutar migraciones
echo -e "${YELLOW}🗄️ Ejecutando migraciones de base de datos...${NC}"
run_remote "
cd $PROJECT_PATH/apps/api
npm run seed:mysql
"

# 10. Instalar SSL con Certbot
echo -e "${YELLOW}🔒 Instalando SSL certificates...${NC}"
run_remote "
apt install -y certbot python3-certbot-nginx
certbot --nginx -d $DOMAIN -d www.$DOMAIN -d api.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN || echo 'SSL installation failed, configure manually'
"

# 11. Configurar firewall
echo -e "${YELLOW}🔥 Configurando firewall...${NC}"
run_remote "
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow $API_PORT
ufw --force enable
"

# 12. Configurar backups automáticos
echo -e "${YELLOW}💾 Configurando backups...${NC}"
run_remote "
mkdir -p /backups

# Script de backup
cat > /root/backup.sh << 'EOF'
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=\"/backups\"

# Backup MySQL
mysqldump -u tudestino -ptudestino123 tudestino > \$BACKUP_DIR/db_\$DATE.sql

# Backup uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz -C $PROJECT_PATH/apps/api uploads/

# Limpiar backups antiguos (mantener últimos 7 días)
find \$BACKUP_DIR -name \"*.sql\" -mtime +7 -delete
find \$BACKUP_DIR -name \"*.tar.gz\" -mtime +7 -delete
EOF

chmod +x /root/backup.sh

# Crontab para backups diarios a las 2 AM
(crontab -l 2>/dev/null; echo '0 2 * * * /root/backup.sh') | crontab -
"

# 13. Crear script de actualización
echo -e "${YELLOW}🔄 Creando script de actualización...${NC}"
run_remote "
cat > /root/update-tudestino.sh << 'EOF'
#!/bin/bash
cd $PROJECT_PATH

echo \"🔄 Actualizando TuDestino...\"

# Backup actual
/root/backup.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build applications
npm run build:web
npm run build:api

# Restart API
pm2 restart tudestino-api

# Reload Nginx
nginx -t && systemctl reload nginx

echo \"✅ TuDestino actualizado correctamente!\"
EOF

chmod +x /root/update-tudestino.sh
"

echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen del deployment:${NC}"
echo -e "🌐 Web: https://$DOMAIN"
echo -e "🔌 API: https://api.$DOMAIN"
echo -e "🗄️ Base de datos: MySQL en localhost"
echo -e "🔄 API ejecutándose con PM2"
echo -e "🌐 Nginx configurado con SSL"
echo ""
echo -e "${YELLOW}📝 Comandos útiles en el servidor:${NC}"
echo -e "• Ver logs de la API: pm2 logs tudestino-api"
echo -e "• Reiniciar API: pm2 restart tudestino-api"
echo -e "• Estado de PM2: pm2 status"
echo -e "• Actualizar proyecto: /root/update-tudestino.sh"
echo -e "• Backup manual: /root/backup.sh"
echo -e "• Ver logs de Nginx: tail -f /var/log/nginx/error.log"
echo ""
echo -e "${GREEN}🎉 Tu aplicación está lista en https://$DOMAIN${NC}"