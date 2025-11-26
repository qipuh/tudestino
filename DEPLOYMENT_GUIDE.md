# 🚀 Deployment Guide - TuDestino

Guía completa para deployar TuDestino en un servidor de producción.

## 📋 Información del Servidor

- **Servidor:** 217.154.179.113
- **Dominio:** tudestino.lat
- **Usuario:** root
- **Contraseña:** xjuBTnE2
- **GitHub:** https://github.com/qipuh/tudestino.git

## 🛠️ Prerequisitos

### En tu máquina local:
- Git configurado
- SSH client (OpenSSH en Windows)
- Acceso a tu repositorio GitHub

### En el servidor (se instala automáticamente):
- Ubuntu/Debian server
- Node.js 20.x
- MySQL
- Nginx
- PM2
- Certbot (SSL)

## 🚀 Deployment Automático

### Opción 1: Desde Windows (Recomendado)

```bash
# Ejecutar el script de deployment
.\deploy-windows.bat
```

### Opción 2: Desde Linux/MacOS

```bash
# Hacer ejecutable el script
chmod +x deploy-server.sh

# Ejecutar deployment
./deploy-server.sh
```

## ⚙️ Configuración Post-Deployment

### 1. Configurar DNS

Apunta tu dominio a la IP del servidor:

```
Tipo  Nombre           Valor
A     tudestino.lat    217.154.179.113
A     www              217.154.179.113  
A     api              217.154.179.113
```

### 2. Configurar Variables de Entorno Web

```powershell
# Ejecutar configuración adicional de la web
.\configure-web-env.ps1
```

### 3. Verificar Deployment

```bash
# Verificar que todo esté funcionando
.\verify-deployment.sh
```

## 🌐 URLs de Acceso

- **Web Principal:** https://tudestino.lat
- **Web (www):** https://www.tudestino.lat
- **API:** https://api.tudestino.lat
- **Health Check:** https://api.tudestino.lat/health

## 🔧 Comandos Útiles en el Servidor

```bash
# Conectarse al servidor
ssh root@217.154.179.113

# Ver estado de la API
pm2 status
pm2 logs tudestino-api

# Reiniciar API
pm2 restart tudestino-api

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Verificar estado de servicios
systemctl status nginx
systemctl status mysql

# Actualizar proyecto
/root/update-tudestino.sh

# Backup manual
/root/backup.sh
```

## 🔄 Actualizaciones

### Actualización Automática

```bash
# En el servidor
/root/update-tudestino.sh
```

### Actualización Manual

```bash
# Conectarse al servidor
ssh root@217.154.179.113

# Ir al directorio del proyecto
cd /var/www/tudestino

# Hacer backup
/root/backup.sh

# Pull cambios
git pull origin main

# Instalar dependencias
npm install

# Rebuild aplicaciones
npm run build:web

# Reiniciar API
pm2 restart tudestino-api

# Recargar Nginx
nginx -t && systemctl reload nginx
```

## 🐛 Troubleshooting

### Script de Troubleshooting Automático

```bash
./troubleshoot.sh
```

### Problemas Comunes

#### 1. API no responde

```bash
# Verificar estado de PM2
pm2 status

# Ver logs de la API
pm2 logs tudestino-api

# Reiniciar API
pm2 restart tudestino-api
```

#### 2. Web no carga

```bash
# Verificar Nginx
nginx -t
systemctl status nginx

# Verificar archivos build
ls -la /var/www/tudestino/apps/web/dist/

# Recargar Nginx
systemctl reload nginx
```

#### 3. Base de datos no conecta

```bash
# Verificar MySQL
systemctl status mysql

# Probar conexión
mysql -u tudestino -ptudestino123 -e 'SELECT 1' tudestino

# Ver logs de MySQL
tail -f /var/log/mysql/error.log
```

#### 4. SSL no funciona

```bash
# Renovar certificados
certbot renew --nginx

# Verificar configuración SSL
openssl s_client -connect tudestino.lat:443

# Recargar Nginx
systemctl reload nginx
```

## 📊 Monitoreo

### Logs en Tiempo Real

```bash
# API logs
pm2 logs tudestino-api --lines 50

# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs  
tail -f /var/log/nginx/error.log

# MySQL logs
tail -f /var/log/mysql/error.log
```

### Estado del Sistema

```bash
# Uso de recursos
htop

# Espacio en disco
df -h

# Memoria
free -h

# Procesos Node.js
ps aux | grep node
```

## 💾 Backups

### Backup Automático

Los backups se ejecutan automáticamente todos los días a las 2 AM:

- **Base de datos:** `/backups/db_YYYYMMDD_HHMMSS.sql`
- **Uploads:** `/backups/uploads_YYYYMMDD_HHMMSS.tar.gz`

### Backup Manual

```bash
# Ejecutar backup manual
/root/backup.sh

# Ver backups existentes
ls -la /backups/
```

### Restaurar Backup

```bash
# Restaurar base de datos
mysql -u tudestino -ptudestino123 tudestino < /backups/db_YYYYMMDD_HHMMSS.sql

# Restaurar uploads
cd /var/www/tudestino/apps/api
tar -xzf /backups/uploads_YYYYMMDD_HHMMSS.tar.gz
```

## 🔒 Seguridad

### Firewall (UFW)

```bash
# Ver estado del firewall
ufw status

# Reglas configuradas:
# - SSH (22)
# - HTTP (80)
# - HTTPS (443)
# - API (3000)
```

### SSL/TLS

- Certificados automáticos con Let's Encrypt
- Renovación automática configurada
- Redirección HTTP → HTTPS

### Base de Datos

- Usuario específico para la aplicación
- Contraseña segura
- Acceso solo desde localhost

## 📞 Soporte

Si encuentras problemas:

1. ✅ Ejecuta `./verify-deployment.sh`
2. 🔧 Ejecuta `./troubleshoot.sh`
3. 📝 Revisa los logs detallados
4. 🔄 Intenta actualizar con `/root/update-tudestino.sh`

## 📁 Estructura del Proyecto en el Servidor

```
/var/www/tudestino/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   ├── uploads/      # Archivos subidos
│   │   └── ecosystem.config.cjs
│   └── web/              # Frontend React
│       └── dist/         # Build de producción
├── packages/
└── node_modules/

/etc/nginx/sites-available/
├── tudestino.lat         # Configuración web
└── api.tudestino.lat     # Configuración API

/backups/                 # Backups automáticos
├── db_*.sql             # Backups base de datos
└── uploads_*.tar.gz     # Backups archivos
```

---

¡Tu aplicación TuDestino está lista para producción! 🎉