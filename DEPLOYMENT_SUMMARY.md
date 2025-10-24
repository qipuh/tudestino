# Resumen del Despliegue de TuDestino

## ✅ Despliegue Completado Exitosamente

**Fecha**: 23 de Octubre, 2025
**Servidor**: 74.208.69.243
**Dominio**: tudestino.qipuh.com

---

## 📦 Componentes Desplegados

### 1. API Backend (Node.js/Express)

**Ubicación**: `/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/`
**Estado**: ✅ Corriendo con PM2
**Puerto**: 3000 (interno)
**URL**: https://api.tudestino.qipuh.com/api

**Configuración**:
- Node.js v18.19.1
- PM2 (Process Manager)
- MySQL/MariaDB 10.11.13
- Base de datos: `admin_tudestino`
- Usuario DB: `tudestino`

**Proceso PM2**:
```bash
pm2 status
# ID: 0 | Name: tudestino-api | Status: online
pm2 logs tudestino-api  # Ver logs
pm2 restart tudestino-api  # Reiniciar
```

**Variables de Entorno**:
```
NODE_ENV=production
DB_HOST=127.0.0.1
DB_NAME=admin_tudestino
DB_USER=tudestino
API_URL=https://api.tudestino.qipuh.com
WEB_URL=https://tudestino.qipuh.com
```

---

### 2. Frontend Web (React/Vite)

**Ubicación**: `/var/www/vhosts/tudestino.qipuh.com/httpdocs/web/`
**Estado**: ✅ Archivos estáticos desplegados
**URL**: https://tudestino.qipuh.com

**Archivos**:
- `index.html` - Punto de entrada
- `assets/` - JavaScript, CSS y recursos compilados
- `img/` - Imágenes
- `videos/` - Videos

**Compilación**:
- Build optimizado con Vite
- Minificado y tree-shaking aplicado
- Tamaño total del bundle: ~833 KB (JS) + 64 KB (CSS)

---

### 3. Aplicación Móvil (Flutter)

**APK de Producción**: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`
**Tamaño**: 49.9 MB
**URL de API**: https://api.tudestino.qipuh.com/api

**Características**:
- Compatibilidad: Android 5.0+ (API 21+)
- Arquitecturas: ARM, ARM64, x64
- Optimizaciones: Tree-shaking de iconos (99.6% reducción)
- Traducción completa a español

**Instalación**:
Ver [INSTALACION_APK.md](apps/mobile/INSTALACION_APK.md)

---

## 🔐 Configuración de Seguridad

### Base de Datos
- Usuario: `tudestino`
- Password: `3@monitoSS`
- Base de datos: `admin_tudestino`
- Acceso: Solo localhost (127.0.0.1)

### JWT
- Secret: Configurado en producción
- Expiración: 7 días

### CORS
- Permitido: tudestino.qipuh.com, api.tudestino.qipuh.com, admin.tudestino.qipuh.com

---

## 🚀 Próximos Pasos

### Configuración de Nginx (Requerido)

Para que la aplicación sea accesible públicamente, se necesita configurar Nginx como proxy reverso:

```nginx
# /etc/nginx/sites-available/tudestino.conf

# API
server {
    listen 80;
    server_name api.tudestino.qipuh.com;

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Web Frontend
server {
    listen 80;
    server_name tudestino.qipuh.com;
    root /var/www/vhosts/tudestino.qipuh.com/httpdocs/web;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Comandos**:
```bash
# Crear symlink
ln -s /etc/nginx/sites-available/tudestino.conf /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
```

### Configuración de SSL (Recomendado)

```bash
# Instalar Certbot
apt-get install certbot python3-certbot-nginx

# Obtener certificados SSL
certbot --nginx -d tudestino.qipuh.com -d api.tudestino.qipuh.com

# Auto-renovación
certbot renew --dry-run
```

### Inicializar Base de Datos

```bash
cd /var/www/vhosts/tudestino.qipuh.com/httpdocs/api
NODE_ENV=production node src/config/seed-mysql.js
```

---

## 📊 Monitoreo y Mantenimiento

### Logs de la API
```bash
pm2 logs tudestino-api
pm2 logs tudestino-api --lines 100
pm2 logs tudestino-api --err  # Solo errores
```

### Estado del Sistema
```bash
pm2 status                    # Estado de procesos
pm2 monit                     # Monitor en tiempo real
systemctl status mariadb      # Estado de MySQL
systemctl status nginx        # Estado de Nginx
```

### Reiniciar Servicios
```bash
pm2 restart tudestino-api     # Reiniciar API
systemctl restart mariadb     # Reiniciar MySQL
systemctl restart nginx       # Reiniciar Nginx
```

### Backups de Base de Datos
```bash
# Crear backup
mysqldump -u tudestino -p'3@monitoSS' admin_tudestino > backup_$(date +%Y%m%d).sql

# Restaurar backup
mysql -u tudestino -p'3@monitoSS' admin_tudestino < backup_20251023.sql
```

---

## 🔄 Actualizar la Aplicación

### Opción 1: Desde Git (Recomendado)

```bash
cd /var/www/vhosts/tudestino.qipuh.com/httpdocs
git pull origin main

# Actualizar API
cd api
npm install --production
pm2 restart tudestino-api

# Actualizar Web (compilar localmente y subir)
# O configurar CI/CD
```

### Opción 2: Transferencia Manual

```bash
# En tu máquina local
scp -r apps/api/src/* root@74.208.69.243:/var/www/vhosts/tudestino.qipuh.com/httpdocs/api/src/

# En el servidor
pm2 restart tudestino-api
```

---

## 📱 Distribución de la APK

### Actualizar APK

1. **Modificar código en apps/mobile/**
2. **Compilar**:
   ```bash
   cd apps/mobile
   flutter clean
   flutter build apk --release
   ```
3. **La APK estará en**: `apps/mobile/build/app/outputs/flutter-apk/app-release.apk`
4. **Distribuir** vía email, Drive, o tienda de aplicaciones

---

## ✨ Características Desplegadas

- ✅ Autenticación de usuarios (JWT)
- ✅ Búsqueda de propiedades
- ✅ Sistema de reservas
- ✅ Perfiles de usuario (huéspedes y anfitriones)
- ✅ Feed social (posts y reels)
- ✅ Comentarios y likes
- ✅ Notificaciones
- ✅ Favoritos
- ✅ Mapa interactivo de propiedades
- ✅ Chat en tiempo real (Socket.IO)
- ✅ Pagos (Stripe/PayPal/Culqi configuración)

---

## 🐛 Troubleshooting

### La API no responde
```bash
pm2 status                    # Verificar si está corriendo
pm2 logs tudestino-api --err  # Ver errores
systemctl status mariadb      # Verificar MySQL
```

### Error de conexión a BD
```bash
mysql -h 127.0.0.1 -u tudestino -p'3@monitoSS' admin_tudestino -e "SELECT 1;"
# Verificar archivo .env
cat /var/www/vhosts/tudestino.qipuh.com/httpdocs/api/.env
```

### La web no carga
```bash
systemctl status nginx
nginx -t  # Verificar sintaxis de configuración
ls -la /var/www/vhosts/tudestino.qipuh.com/httpdocs/web/
```

---

## 📞 Soporte

- **Logs de errores**: `/root/.pm2/logs/`
- **Documentación**: Ver [CLAUDE.md](CLAUDE.md) para arquitectura del proyecto
- **Comandos útiles**: Ver [COMANDOS.md](COMANDOS.md)

---

**Desplegado con [Claude Code](https://claude.com/claude-code)** 🤖
