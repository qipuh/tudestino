## 🚀 DEPLOYMENT RÁPIDO - TuDestino

### Información de conexión:
- **Servidor:** 217.154.179.113
- **Usuario:** root
- **Contraseña:** xjuBTnE2

### Pasos de deployment:

#### 1. Conectarse al servidor
```bash
ssh root@217.154.179.113
```

#### 2. Preparar el sistema
```bash
apt update && apt upgrade -y
apt install -y curl wget git nginx mysql-server
```

#### 3. Instalar Node.js y PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2
```

#### 4. Configurar MySQL
```bash
systemctl start mysql
systemctl enable mysql
mysql -e "CREATE DATABASE IF NOT EXISTS tudestino;"
mysql -e "CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123';"
mysql -e "GRANT ALL PRIVILEGES ON tudestino.* TO 'tudestino'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
```

#### 5. Clonar el proyecto
```bash
cd /var/www
rm -rf tudestino
git clone https://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@github.com/qipuh/tudestino.git tudestino
cd tudestino
npm install
npm run build:web
```

#### 6. Configurar la API
```bash
cd /var/www/tudestino/apps/api
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
```

#### 7. Configurar PM2
```bash
cd /var/www/tudestino/apps/api
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
```

#### 8. Configurar Nginx
```bash
# Configuración del sitio principal
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

# Configuración del subdominio API
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
nginx -t && systemctl reload nginx
```

#### 9. Configurar variables para la web
```bash
cd /var/www/tudestino/apps/web
cat > .env << 'EOF'
VITE_API_URL=https://tudestino.lat/api
VITE_SOCKET_URL=https://tudestino.lat
VITE_APP_NAME=TuDestino
VITE_APP_URL=https://tudestino.lat
EOF

# Rebuild con las nuevas variables
cd /var/www/tudestino
npm run build:web
```

#### 10. Ejecutar migraciones y iniciar API
```bash
cd /var/www/tudestino/apps/api
npm run seed:mysql

mkdir -p /var/log/pm2
pm2 delete tudestino-api 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

#### 11. Configurar firewall
```bash
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 3000
echo 'y' | ufw enable
```

#### 12. Instalar SSL
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d tudestino.lat -d www.tudestino.lat -d api.tudestino.lat --non-interactive --agree-tos --email admin@tudestino.lat
```

#### 13. Verificar deployment
```bash
pm2 status
systemctl status nginx
curl -I http://tudestino.lat
curl -I http://api.tudestino.lat/health
```

### 🎯 URLs finales:
- **Web:** https://tudestino.lat
- **API:** https://api.tudestino.lat
- **Health:** https://api.tudestino.lat/health

### 🔧 Comandos útiles:
```bash
# Ver logs de la API
pm2 logs tudestino-api

# Reiniciar API
pm2 restart tudestino-api

# Ver estado de servicios
pm2 status
systemctl status nginx
systemctl status mysql

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

### ⚡ DNS Configuration:
Configura estos registros en tu proveedor DNS:
```
A    tudestino.lat      217.154.179.113
A    www.tudestino.lat  217.154.179.113
A    api.tudestino.lat  217.154.179.113
```

¡Listo! Tu aplicación TuDestino estará funcionando en producción.