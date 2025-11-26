#!/bin/bash
# Script de despliegue de TuDestino en tudestino.lat
# Servidor: 161.132.38.151
# Usuario: root

set -e  # Detener en cualquier error

echo "========================================="
echo "DESPLIEGUE DE TUDESTINO EN PRODUCCIÓN"
echo "Dominio: tudestino.lat"
echo "Servidor: 161.132.38.151"
echo "========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
DOMAIN="tudestino.lat"
APP_DIR="/var/www/tudestino"
GITHUB_TOKEN="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"
GITHUB_USER="qipuh"
REPO_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/qipuh/tudestino.git"
DB_PASSWORD=$(openssl rand -base64 32)

echo -e "${GREEN}[1/11] Actualizando sistema...${NC}"
apt update && apt upgrade -y

echo -e "${GREEN}[2/11] Instalando Node.js 20.x...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"

echo -e "${GREEN}[3/11] Instalando MySQL Server...${NC}"
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo -e "${GREEN}[4/11] Configurando MySQL...${NC}"
# Configuración segura de MySQL
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${DB_PASSWORD}';"
mysql -u root -p"${DB_PASSWORD}" -e "CREATE DATABASE IF NOT EXISTS tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p"${DB_PASSWORD}" -e "FLUSH PRIVILEGES;"
echo "Contraseña de MySQL guardada en /root/.mysql_password"
echo "${DB_PASSWORD}" > /root/.mysql_password
chmod 600 /root/.mysql_password

echo -e "${GREEN}[5/11] Instalando Nginx...${NC}"
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo -e "${GREEN}[6/11] Instalando PM2 globalmente...${NC}"
npm install -g pm2

echo -e "${GREEN}[7/11] Clonando repositorio...${NC}"
mkdir -p ${APP_DIR}
cd ${APP_DIR}
if [ -d ".git" ]; then
    echo "Repositorio existente, actualizando..."
    git pull origin main
else
    echo "Clonando repositorio nuevo..."
    git clone ${REPO_URL} .
fi

echo -e "${GREEN}[8/11] Instalando dependencias...${NC}"
npm install

echo -e "${GREEN}[9/11] Configurando variables de entorno...${NC}"

# Generar JWT_SECRET aleatorio
JWT_SECRET=$(openssl rand -base64 64)

# Crear .env para API
cat > ${APP_DIR}/apps/api/.env << EOF
# Configuración de producción - TuDestino API
NODE_ENV=production
PORT=3000

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=${DB_PASSWORD}

# JWT
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# URLs
API_URL=https://${DOMAIN}/api
WEB_URL=https://${DOMAIN}
ADMIN_URL=https://${DOMAIN}/admin

# CORS Origins
CORS_ORIGIN=https://${DOMAIN},https://www.${DOMAIN}

# Stripe (configurar después)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email (configurar después si es necesario)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EOF

# Crear .env para Web
cat > ${APP_DIR}/apps/web/.env.production << EOF
VITE_API_URL=https://${DOMAIN}/api
VITE_APP_NAME=TuDestino
EOF

# Crear .env para Admin
cat > ${APP_DIR}/apps/admin/.env.production << EOF
VITE_API_URL=https://${DOMAIN}/api
VITE_APP_NAME=TuDestino Admin
EOF

echo -e "${GREEN}[10/11] Construyendo aplicaciones...${NC}"

# Construir API
echo "Construyendo API..."
npm run build:api --workspace=apps/api

# Construir Web
echo "Construyendo Web..."
npm run build:web --workspace=apps/web

# Construir Admin
echo "Construyendo Admin..."
npm run build:admin --workspace=apps/admin

echo -e "${GREEN}[11/11] Inicializando base de datos...${NC}"
cd ${APP_DIR}/apps/api
NODE_ENV=production node src/config/seed-mysql.js

echo -e "${GREEN}Configurando PM2...${NC}"
cd ${APP_DIR}

# Crear archivo de configuración de PM2
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: './apps/api/src/index.js',
    cwd: '/var/www/tudestino',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/tudestino-api-error.log',
    out_file: '/var/log/pm2/tudestino-api-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '500M',
    watch: false
  }]
};
EOF

# Crear directorio de logs
mkdir -p /var/log/pm2

# Iniciar aplicación con PM2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}Configurando Nginx...${NC}"

# Crear configuración de Nginx
cat > /etc/nginx/sites-available/tudestino << 'EOF'
# Configuración de Nginx para TuDestino
# Dominio: tudestino.lat

# Redirigir HTTP a HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name tudestino.lat www.tudestino.lat;

    # Permitir certbot para SSL
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Redirigir todo a HTTPS (se activará después de obtener SSL)
    # return 301 https://$server_name$request_uri;

    # Temporalmente servir contenido HTTP hasta obtener SSL
    root /var/www/tudestino/apps/web/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    location /admin {
        alias /var/www/tudestino/apps/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }
}

# Configuración HTTPS (se activará después de obtener certificado SSL)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name tudestino.lat www.tudestino.lat;

    # Certificados SSL (se configurarán con Let's Encrypt)
    # ssl_certificate /etc/letsencrypt/live/tudestino.lat/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tudestino.lat/privkey.pem;

    # Configuración SSL moderna
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Aplicación Web (React)
    root /var/www/tudestino/apps/web/dist;
    index index.html;

    # Seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Compresión
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # API Backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts más largos para operaciones de carga
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;

        # Tamaño máximo de carga
        client_max_body_size 50M;
    }

    # Panel de administración
    location /admin {
        alias /var/www/tudestino/apps/admin/dist;
        try_files $uri $uri/ /admin/index.html;
    }

    # SPA fallback para rutas de React
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Habilitar sitio
ln -sf /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Crear directorio para certbot
mkdir -p /var/www/certbot

# Probar configuración y reiniciar Nginx
nginx -t && systemctl reload nginx

echo -e "${GREEN}Instalando Certbot para SSL...${NC}"
apt install -y certbot python3-certbot-nginx

echo ""
echo -e "${YELLOW}=========================================${NC}"
echo -e "${GREEN}INSTALACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo -e "${YELLOW}=========================================${NC}"
echo ""
echo -e "Información importante:"
echo -e "  • Directorio de la app: ${GREEN}${APP_DIR}${NC}"
echo -e "  • Contraseña MySQL: ${RED}guardada en /root/.mysql_password${NC}"
echo -e "  • API corriendo en: ${GREEN}http://localhost:3000${NC}"
echo -e "  • Estado PM2: ${GREEN}pm2 status${NC}"
echo -e "  • Logs PM2: ${GREEN}pm2 logs tudestino-api${NC}"
echo ""
echo -e "${YELLOW}PRÓXIMOS PASOS:${NC}"
echo ""
echo -e "1. ${GREEN}Configurar DNS${NC}"
echo -e "   Apuntar tudestino.lat y www.tudestino.lat a ${GREEN}161.132.38.151${NC}"
echo ""
echo -e "2. ${GREEN}Obtener certificado SSL${NC} (después de configurar DNS):"
echo -e "   ${YELLOW}certbot --nginx -d tudestino.lat -d www.tudestino.lat${NC}"
echo ""
echo -e "3. ${GREEN}Descomentar redirección HTTPS${NC} en /etc/nginx/sites-available/tudestino"
echo -e "   y activar líneas de certificado SSL"
echo ""
echo -e "4. ${GREEN}Configurar Stripe${NC} (opcional):"
echo -e "   Editar ${APP_DIR}/apps/api/.env y agregar:"
echo -e "   STRIPE_SECRET_KEY=tu_clave_secreta"
echo -e "   Luego reiniciar: ${YELLOW}pm2 restart tudestino-api${NC}"
echo ""
echo -e "5. ${GREEN}Ver la aplicación${NC}:"
echo -e "   http://tudestino.lat (después de configurar DNS)"
echo ""
echo -e "${GREEN}Sistema funcionando correctamente!${NC}"
echo ""
