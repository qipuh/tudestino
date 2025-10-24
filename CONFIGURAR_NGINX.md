# Configurar Nginx para TuDestino

## 📋 Pre-requisitos

Ya has configurado el DNS:
- ✅ `api.tudestino.qipuh.com` → `74.208.69.243`
- ✅ `tudestino.qipuh.com` → `74.208.69.243`

## 🔧 Pasos de Configuración

### 1️⃣ Actualizar Base de Datos en el Servidor

La configuración actual usa credenciales incorrectas. Necesitamos actualizarlas.

**Ejecuta en tu computadora local**:

```bash
# Conectarse al servidor
ssh root@74.208.69.243

# Verificar que la base de datos existe con las credenciales correctas
mysql -h 127.0.0.1 -u admin_tudestino -p'3@monitoSS' admin_tudestino -e 'SELECT 1;'
```

Si ves un `1`, la conexión es correcta. ✅

---

### 2️⃣ Actualizar Archivos de Configuración en el Servidor

**Desde tu computadora local**:

```bash
# Transferir .env actualizado
scp C:\laragon\www\tudestino\apps\api\.env.production root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/.env

# Transferir ecosystem.config.cjs actualizado
scp C:\laragon\www\tudestino\apps\api\ecosystem.config.cjs root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/
```

---

### 3️⃣ Reiniciar la API con PM2

**En el servidor**:

```bash
cd /var/www/vhosts/tudestino.qipuh.com/httpdocs/api

# Eliminar proceso actual
pm2 delete tudestino-api

# Iniciar con la nueva configuración
pm2 start ecosystem.config.cjs --env production

# Guardar configuración
pm2 save

# Ver logs para verificar conexión
pm2 logs tudestino-api --lines 20
```

**Deberías ver**:
```
✅ MySQL Connected successfully
🚀 Server running on port 3000
```

---

### 4️⃣ Configurar Nginx para la API

**En el servidor**:

```bash
# Crear archivo de configuración para la API
cat > /etc/nginx/sites-available/api.tudestino.conf << 'EOF'
server {
    listen 80;
    server_name api.tudestino.qipuh.com;

    access_log /var/log/nginx/tudestino-api-access.log;
    error_log /var/log/nginx/tudestino-api-error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
EOF
```

---

### 5️⃣ Configurar Nginx para la Web

**En el servidor**:

```bash
# Crear archivo de configuración para la Web
cat > /etc/nginx/sites-available/tudestino.conf << 'EOF'
server {
    listen 80;
    server_name tudestino.qipuh.com www.tudestino.qipuh.com;

    root /var/www/vhosts/tudestino.qipuh.com/httpdocs;
    index index.html;

    access_log /var/log/nginx/tudestino-web-access.log;
    error_log /var/log/nginx/tudestino-web-error.log;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
EOF
```

---

### 6️⃣ Activar las Configuraciones

**En el servidor**:

```bash
# Crear symlinks en sites-enabled
ln -sf /etc/nginx/sites-available/api.tudestino.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/tudestino.conf /etc/nginx/sites-enabled/

# Verificar que la configuración es correcta
nginx -t
```

**Deberías ver**:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

---

### 7️⃣ Recargar Nginx

**En el servidor**:

```bash
systemctl reload nginx

# Verificar que está corriendo
systemctl status nginx
```

---

### 8️⃣ Verificar que Todo Funciona

**Desde cualquier computadora**:

```bash
# Probar la API
curl http://api.tudestino.qipuh.com/health

# Deberías ver algo como:
# {"status":"ok","timestamp":"..."}

# Probar la Web
curl -I http://tudestino.qipuh.com

# Deberías ver HTTP/200
```

**Desde el navegador**:
- Ve a: `http://api.tudestino.qipuh.com/health`
- Ve a: `http://tudestino.qipuh.com`

---

## 🔐 OPCIONAL: Configurar HTTPS con Let's Encrypt

Una vez que HTTP funcione, puedes agregar SSL:

```bash
# Instalar Certbot
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Obtener certificados SSL
certbot --nginx -d tudestino.qipuh.com -d www.tudestino.qipuh.com -d api.tudestino.qipuh.com

# Certbot configurará automáticamente Nginx para HTTPS
```

---

## 🐛 Troubleshooting

### La API no responde

```bash
# Verificar que PM2 está corriendo
pm2 status

# Ver logs
pm2 logs tudestino-api

# Verificar puerto 3000
netstat -tlnp | grep 3000
# O
ss -tlnp | grep 3000
```

### Nginx no recarga

```bash
# Ver errores
nginx -t

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

### Error 502 Bad Gateway

Significa que Nginx no puede conectarse a la API:

```bash
# Verificar que la API está corriendo
curl http://localhost:3000/health

# Si no funciona, revisar PM2
pm2 restart tudestino-api
```

---

## ✅ Checklist Final

- [ ] Credenciales de BD actualizadas (admin_tudestino)
- [ ] PM2 reiniciado con nueva configuración
- [ ] API conecta a MySQL correctamente
- [ ] Nginx configurado para `api.tudestino.qipuh.com`
- [ ] Nginx configurado para `tudestino.qipuh.com`
- [ ] Nginx recargado sin errores
- [ ] `http://api.tudestino.qipuh.com/health` responde
- [ ] `http://tudestino.qipuh.com` carga la web
- [ ] La web puede llamar a la API sin errores CORS

---

## 📞 Comandos Útiles

```bash
# Conectarse al servidor
ssh root@74.208.69.243

# Ver logs de la API
pm2 logs tudestino-api

# Ver logs de Nginx
tail -f /var/log/nginx/tudestino-*-error.log

# Reiniciar API
pm2 restart tudestino-api

# Reiniciar Nginx
systemctl restart nginx

# Ver estado de todos los servicios
pm2 status
systemctl status nginx
systemctl status mariadb
```

---

¡Una vez completado, la web y la app móvil deberían funcionar perfectamente! 🎉
