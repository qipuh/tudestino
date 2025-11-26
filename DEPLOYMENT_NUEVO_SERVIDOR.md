# 🚀 DEPLOYMENT EN SERVIDOR COMPARTIDO - TuDestino

## 📋 Nueva Información del Servidor:
- **Servidor:** 161.132.48.238
- **Usuario:** root  
- **Contraseña:** 3@monitoSS
- **Dominio:** tudestino.lat

## 🏗️ Estructura en Servidor Compartido:

Vamos a crear una estructura separada para no interferir con otros proyectos:

```
/var/www/
├── html/                    # Proyecto existente
├── tudestino/              # Nuestro proyecto
│   ├── apps/
│   │   ├── api/            # Backend API
│   │   └── web/            # Frontend React  
│   └── uploads/
└── other-projects/         # Otros proyectos
```

## 🔧 Comandos para Deployment:

### **PASO 1: Verificar conexión**
```bash
ssh root@161.132.48.238
# Contraseña: 3@monitoSS
```

### **PASO 2: Verificar servidor actual**
```bash
# Ver qué hay actualmente
ls -la /var/www/
ps aux | grep nginx
ps aux | grep apache
systemctl status nginx
```

### **PASO 3: Crear estructura para TuDestino**
```bash
# Crear directorio para nuestro proyecto
mkdir -p /var/www/tudestino

# Clonar proyecto
cd /var/www/tudestino
git clone https://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@github.com/qipuh/tudestino.git .
```

### **PASO 4: Verificar Node.js y dependencias**
```bash
# Verificar Node.js
node --version
npm --version

# Si no está instalado Node.js 20:
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Instalar PM2 si no está
npm install -g pm2
```

### **PASO 5: Configurar base de datos**
```bash
# Verificar MySQL
systemctl status mysql

# Crear base de datos para TuDestino
mysql -e "CREATE DATABASE IF NOT EXISTS tudestino_prod;"
mysql -e "CREATE USER IF NOT EXISTS 'tudestino'@'localhost' IDENTIFIED BY 'tudestino123_prod';"
mysql -e "GRANT ALL PRIVILEGES ON tudestino_prod.* TO 'tudestino'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
```

### **PASO 6: Instalar dependencias del proyecto**
```bash
cd /var/www/tudestino
npm install
npm run build:web
```

### **PASO 7: Configurar variables de entorno**
```bash
# API
cd /var/www/tudestino/apps/api
cat > .env << 'EOF'
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino_prod
DB_USER=tudestino
DB_PASSWORD=tudestino123_prod
JWT_SECRET=$(openssl rand -hex 32)
FRONTEND_URL=https://tudestino.lat
BACKEND_URL=https://api.tudestino.lat
EOF

# Web
cd /var/www/tudestino/apps/web
cat > .env << 'EOF'
VITE_API_URL=https://tudestino.lat/api
VITE_SOCKET_URL=https://tudestino.lat
VITE_APP_NAME=TuDestino
VITE_APP_URL=https://tudestino.lat
EOF
```

### **PASO 8: Configurar PM2**
```bash
cd /var/www/tudestino/apps/api
cat > ecosystem.config.cjs << 'EOF'
module.exports = {
  apps: [{
    name: 'tudestino-api',
    script: 'src/index.js',
    cwd: '/var/www/tudestino/apps/api',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
};
EOF
```

### **PASO 9: Configurar Nginx (Virtual Hosts)**
```bash
# Configurar virtual host para TuDestino
cat > /etc/nginx/sites-available/tudestino.lat << 'EOF'
server {
    listen 80;
    server_name tudestino.lat www.tudestino.lat;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tudestino.lat www.tudestino.lat;
    
    # SSL certificates (configurar después)
    # ssl_certificate /etc/letsencrypt/live/tudestino.lat/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/tudestino.lat/privkey.pem;
    
    root /var/www/tudestino/apps/web/dist;
    index index.html;
    
    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Socket.IO
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    # Uploads
    location /uploads/ {
        alias /var/www/tudestino/apps/api/uploads/;
        expires 30d;
    }
}
EOF

# API subdomain
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
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sitios
ln -sf /etc/nginx/sites-available/tudestino.lat /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/api.tudestino.lat /etc/nginx/sites-enabled/

# Probar configuración
nginx -t
systemctl reload nginx
```

### **PASO 10: Inicializar base de datos**
```bash
cd /var/www/tudestino/apps/api
npm run seed:mysql
```

### **PASO 11: Iniciar aplicación**
```bash
cd /var/www/tudestino/apps/api
pm2 start ecosystem.config.cjs
pm2 save
```

### **PASO 12: Configurar SSL**
```bash
# Instalar certbot si no está
apt install -y certbot python3-certbot-nginx

# Obtener certificados
certbot --nginx -d tudestino.lat -d www.tudestino.lat -d api.tudestino.lat --non-interactive --agree-tos --email admin@tudestino.lat
```

## 🔍 Verificaciones:

### **Verificar servicios:**
```bash
pm2 status
systemctl status nginx
systemctl status mysql
netstat -tulpn | grep :3001
```

### **Verificar URLs:**
- http://tudestino.lat (debe redirigir a HTTPS)
- https://tudestino.lat 
- https://api.tudestino.lat/health

## 🎯 URLs Finales:
- **Web:** https://tudestino.lat
- **API:** https://api.tudestino.lat  
- **Health:** https://api.tudestino.lat/health

---

**¿Empezamos? El puerto 3001 evitará conflictos con otros proyectos que puedan usar el 3000.**