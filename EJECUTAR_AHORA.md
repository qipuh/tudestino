# 🚀 COMANDOS DIRECTOS PARA DEPLOYMENT
# Copia y pega estos comandos uno por uno en SSH

# Información de conexión:
# Servidor: 217.154.179.113
# Usuario: root
# Contraseña: xjuBTnE2

# ==================================
# PARTE 1: PREPARACIÓN DEL SISTEMA
# ==================================

# Actualizar sistema
apt update && apt upgrade -y

# Instalar dependencias básicas
apt install -y curl wget git nginx mysql-server

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

# ==================================
# PARTE 2: CONFIGURAR BASE DE DATOS
# ==================================

# Iniciar MySQL
systemctl start mysql
systemctl enable mysql

# Crear base de datos y usuario
mysql -e "CREATE DATABASE IF NOT EXISTS tudestino;"
mysql -e "CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';"
mysql -e "GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# ==================================
# PARTE 3: CLONAR PROYECTO
# ==================================

# Ir al directorio web
cd /var/www

# Limpiar directorio anterior si existe
rm -rf tudestino

# Clonar con token (IMPORTANTE: usar el token correcto)
git clone https://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@github.com/qipuh/tudestino.git tudestino

# Entrar al proyecto
cd tudestino

# Instalar dependencias
npm install

# Construir la web
npm run build:web

# ==================================
# PARTE 4: CONFIGURAR API
# ==================================

# Ir al directorio de la API
cd /var/www/tudestino/apps/api

# Crear archivo de variables de entorno
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=tudestino
DB_PASSWORD=tudestino123
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://tudestino.lat
BACKEND_URL=https://api.tudestino.lat
EOF

# Crear configuración de PM2
cat > ecosystem.config.cjs << 'EOF'
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
EOF

# ==================================
# PARTE 5: CONFIGURAR WEB
# ==================================

# Ir al directorio de la web
cd /var/www/tudestino/apps/web

# Crear variables de entorno para la web
cat > .env << 'EOF'
VITE_API_URL=https://tudestino.lat/api
VITE_SOCKET_URL=https://tudestino.lat
VITE_APP_NAME=TuDestino
VITE_APP_URL=https://tudestino.lat
EOF

# Reconstruir la web con las nuevas variables
cd /var/www/tudestino
npm run build:web

# ==================================
# PARTE 6: CONFIGURAR NGINX
# ==================================

# Configurar sitio principal
cat > /etc/nginx/sites-available/tudestino.lat << 'EOF'
server {
    listen 80;
    server_name tudestino.lat www.tudestino.lat;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudestino.lat www.tudestino.lat;
    
    root /var/www/tudestino/apps/web/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
    }
}
EOF

# Configurar subdominio API
cat > /etc/nginx/sites-available/api.tudestino.lat << 'EOF'
server {
    listen 80;
    server_name api.tudestino.lat;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.tudestino.lat;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
    }
}
EOF

# Habilitar sitios
ln -sf /etc/nginx/sites-available/tudestino.lat /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.tudestino.lat /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Probar y recargar Nginx
nginx -t
systemctl reload nginx

# ==================================
# PARTE 7: INICIALIZAR BASE DE DATOS
# ==================================

# Ejecutar migraciones
cd /var/www/tudestino/apps/api
npm run seed:mysql

# ==================================
# PARTE 8: INICIAR LA API
# ==================================

# Crear directorio de logs
mkdir -p /var/log/pm2

# Ir al directorio de la API
cd /var/www/tudestino/apps/api

# Eliminar proceso anterior si existe
pm2 delete tudestino-api 2>/dev/null || true

# Iniciar la API
pm2 start ecosystem.config.cjs

# Guardar configuración PM2
pm2 save

# Configurar PM2 para auto-inicio
pm2 startup

# ==================================
# PARTE 9: SEGURIDAD
# ==================================

# Configurar firewall
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000
echo 'y' | ufw enable

# ==================================
# PARTE 10: SSL (OPCIONAL)
# ==================================

# Instalar certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificados SSL (ejecutar solo después de configurar DNS)
# certbot --nginx -d tudestino.lat -d www.tudestino.lat -d api.tudestino.lat --non-interactive --agree-tos --email admin@tudestino.lat

# ==================================
# VERIFICACIÓN
# ==================================

# Verificar estado de servicios
pm2 status
systemctl status nginx
systemctl status mysql

# Verificar que la API responde (después de configurar DNS)
# curl -I http://tudestino.lat
# curl -I http://api.tudestino.lat/health

# ==================================
# INFORMACIÓN FINAL
# ==================================

echo "✅ DEPLOYMENT COMPLETADO!"
echo ""
echo "🌐 URLs:"
echo "- Web: https://tudestino.lat"
echo "- API: https://api.tudestino.lat"
echo "- Health: https://api.tudestino.lat/health"
echo ""
echo "📋 Configura estos DNS en tu proveedor:"
echo "A    tudestino.lat      217.154.179.113"
echo "A    www.tudestino.lat  217.154.179.113"
echo "A    api.tudestino.lat  217.154.179.113"
echo ""
echo "🔧 Comandos útiles:"
echo "- Ver logs: pm2 logs tudestino-api"
echo "- Reiniciar: pm2 restart tudestino-api"
echo "- Estado: pm2 status"
