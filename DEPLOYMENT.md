# Guía de Despliegue - TuDestino en VPS

Esta guía te llevará paso a paso para configurar y desplegar la aplicación TuDestino en un servidor VPS.

## 📋 Información del Servidor

- **IP**: 161.132.38.151
- **Usuario**: root
- **SO**: Ubuntu/Debian
- **Aplicaciones**: API (Node.js), Web (React), Admin (React)

## 🔐 Credenciales

### Servidor VPS
- IP: `161.132.38.151`
- Usuario: `root`
- Contraseña: `3@monitoSS`

### GitHub
- Usuario: `qipuh`
- Token: `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`

---

## 🚀 Pasos de Instalación

### 1. Conectarse al Servidor

Desde tu terminal local:

```bash
ssh root@161.132.38.151
# Contraseña: 3@monitoSS
```

### 2. Ejecutar el Script de Configuración Inicial

Primero, descarga el script de configuración:

```bash
cd ~
wget https://raw.githubusercontent.com/qipuh/tudestino/main/server-setup.sh
# O si prefieres, copia manualmente el contenido del archivo server-setup.sh

chmod +x server-setup.sh
./server-setup.sh
```

Este script instalará:
- Node.js 20.x LTS
- MySQL
- Nginx
- PM2
- Certbot para SSL
- Firewall (UFW)
- Fail2ban

**Tiempo estimado**: 5-10 minutos

### 3. Clonar el Repositorio

```bash
cd /var/www
git clone https://qipuh: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@github.com/qipuh/tudestino.git
cd tudestino
```

### 4. Configurar Archivos .env

#### a) API (.env)

```bash
cp apps/api/.env.production apps/api/.env
nano apps/api/.env
```

**IMPORTANTE**: Edita estos valores:
- `JWT_SECRET`: Genera una clave segura única
- `SMTP_USER` y `SMTP_PASS`: Configura tu email
- `STRIPE_SECRET_KEY`: Tu clave de Stripe
- Dominios: Reemplaza `tudestino.com` con tu dominio real

Para generar un JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### b) Web (.env)

```bash
cp apps/web/.env.production apps/web/.env
nano apps/web/.env
```

Actualiza `VITE_API_URL` con tu dominio real.

#### c) Admin (.env)

```bash
cp apps/admin/.env.production apps/admin/.env
nano apps/admin/.env
```

Actualiza `VITE_API_URL` con tu dominio real.

### 5. Instalar Dependencias

```bash
npm install
```

**Tiempo estimado**: 2-5 minutos

### 6. Configurar la Base de Datos

#### a) Acceder a MySQL

```bash
mysql -u root -p
# Contraseña: TuDestino2026!Secure
```

#### b) Crear la base de datos (ya debería estar creada por el script)

```sql
CREATE DATABASE IF NOT EXISTS tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

#### c) Ejecutar seeds (datos iniciales)

```bash
npm run seed:mysql
```

### 7. Construir las Aplicaciones

#### a) Construir API (si hay proceso de build)

```bash
npm run build:api
```

#### b) Construir Web Frontend

```bash
npm run build:web
```

#### c) Construir Admin Frontend

```bash
npm run build:admin
```

**Tiempo estimado**: 3-5 minutos

### 8. Configurar Nginx

#### a) Copiar configuración de Nginx

```bash
nano /etc/nginx/sites-available/tudestino
```

Pega el contenido del archivo `nginx-config.conf` y **REEMPLAZA** todos los `tudestino.com` con tu dominio real.

#### b) Activar el sitio

```bash
ln -s /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/
```

#### c) Verificar configuración

```bash
nginx -t
```

#### d) Recargar Nginx

```bash
systemctl reload nginx
```

### 9. Configurar DNS

**ANTES de continuar**, configura los registros DNS de tu dominio:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | @ | 161.132.38.151 | 3600 |
| A | www | 161.132.38.151 | 3600 |
| A | api | 161.132.38.151 | 3600 |
| A | admin | 161.132.38.151 | 3600 |

**Espera**: 10-30 minutos para que los DNS se propaguen.

Verifica con:
```bash
dig tudestino.com
dig api.tudestino.com
dig admin.tudestino.com
```

### 10. Obtener Certificados SSL

Una vez que los DNS estén propagados:

```bash
certbot --nginx -d tudestino.com -d www.tudestino.com -d api.tudestino.com -d admin.tudestino.com
```

Sigue las instrucciones:
- Email: tu-email@dominio.com
- Acepta términos: Yes
- Compartir email: No
- Redirect HTTP to HTTPS: 2 (Yes)

Certbot configurará automáticamente SSL en Nginx.

### 11. Iniciar la Aplicación con PM2

#### a) Copiar el archivo PM2 ecosystem

El archivo `ecosystem.config.cjs` ya está en el repositorio.

#### b) Iniciar la API con PM2

```bash
pm2 start ecosystem.config.cjs
```

#### c) Guardar la configuración PM2

```bash
pm2 save
```

#### d) Verificar que PM2 se inicia al arrancar

```bash
pm2 startup
# Ejecuta el comando que te muestra PM2
```

### 12. Verificar la Instalación

#### a) Ver estado de PM2

```bash
pm2 status
pm2 logs tudestino-api
```

#### b) Ver logs en tiempo real

```bash
pm2 logs
```

#### c) Probar la API

```bash
curl https://api.tudestino.com/api/health
```

#### d) Probar desde el navegador

- Web: https://tudestino.com
- Admin: https://admin.tudestino.com
- API: https://api.tudestino.com/api

---

## 🔧 Comandos Útiles

### PM2

```bash
# Ver estado de apps
pm2 status

# Ver logs
pm2 logs
pm2 logs tudestino-api

# Reiniciar
pm2 restart tudestino-api
pm2 restart all

# Detener
pm2 stop tudestino-api
pm2 stop all

# Eliminar
pm2 delete tudestino-api

# Monitoreo
pm2 monit
```

### Nginx

```bash
# Verificar configuración
nginx -t

# Recargar
systemctl reload nginx

# Reiniciar
systemctl restart nginx

# Ver logs
tail -f /var/log/tudestino/api-access.log
tail -f /var/log/tudestino/api-error.log
```

### MySQL

```bash
# Acceder a MySQL
mysql -u root -p

# Ver bases de datos
SHOW DATABASES;

# Usar base de datos
USE tudestino;

# Ver tablas
SHOW TABLES;

# Backup
mysqldump -u root -p tudestino > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u root -p tudestino < backup.sql
```

### Sistema

```bash
# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos
htop

# Ver logs del sistema
journalctl -u nginx
journalctl -xe
```

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código y quieras desplegarlos:

```bash
cd /var/www/tudestino

# 1. Hacer pull de los cambios
git pull origin main

# 2. Instalar dependencias nuevas (si las hay)
npm install

# 3. Reconstruir las aplicaciones
npm run build:web
npm run build:admin

# 4. Reiniciar API con PM2
pm2 restart tudestino-api

# 5. Verificar
pm2 status
pm2 logs
```

### Automatizar con PM2 Deploy (Opcional)

```bash
# Desde tu máquina local
pm2 deploy ecosystem.config.cjs production setup
pm2 deploy ecosystem.config.cjs production
```

---

## 🛡️ Seguridad

### Firewall

```bash
# Ver reglas
ufw status

# Permitir puerto
ufw allow 80/tcp

# Denegar puerto
ufw deny 8080/tcp
```

### Fail2ban

```bash
# Ver estado
fail2ban-client status

# Ver intentos bloqueados SSH
fail2ban-client status sshd
```

### Actualizar sistema

```bash
apt update
apt upgrade -y
apt autoremove -y
```

---

## 📊 Monitoreo

### PM2 Plus (Opcional)

Para monitoreo avanzado en la nube:

```bash
pm2 link <secret_key> <public_key>
```

Obtén las claves en: https://app.pm2.io

---

## 🐛 Troubleshooting

### La API no arranca

```bash
# Ver logs
pm2 logs tudestino-api

# Verificar puerto
netstat -tlnp | grep 3000

# Verificar variables de entorno
pm2 env 0
```

### Error de conexión a MySQL

```bash
# Verificar que MySQL está corriendo
systemctl status mysql

# Verificar credenciales en .env
cat apps/api/.env | grep DB_

# Probar conexión
mysql -u root -p -e "SELECT 1;"
```

### Error 502 Bad Gateway en Nginx

```bash
# Verificar que la API está corriendo
pm2 status

# Ver logs de Nginx
tail -f /var/log/nginx/error.log

# Verificar configuración de Nginx
nginx -t
```

### SSL no funciona

```bash
# Renovar certificados
certbot renew

# Verificar certificados
certbot certificates

# Forzar renovación
certbot renew --force-renewal
```

---

## 📝 Notas Importantes

1. **Backup Regular**: Configura backups automáticos de MySQL
2. **Monitoreo**: Usa PM2 Plus o herramientas de monitoreo
3. **Logs**: Revisa logs regularmente en `/var/log/tudestino/`
4. **Actualizaciones**: Mantén el servidor actualizado
5. **SSL**: Los certificados se renuevan automáticamente con certbot

---

## 📞 Soporte

Si tienes problemas durante el despliegue:

1. Revisa los logs: `pm2 logs` y `/var/log/tudestino/`
2. Verifica la configuración: `nginx -t` y `pm2 status`
3. Consulta la documentación oficial de cada herramienta

---

## ✅ Checklist de Despliegue

- [ ] Servidor VPS configurado y actualizado
- [ ] Node.js, MySQL, Nginx, PM2 instalados
- [ ] Repositorio clonado
- [ ] Archivos .env configurados
- [ ] Dependencias instaladas
- [ ] Base de datos creada y con seeds
- [ ] Aplicaciones construidas (build)
- [ ] DNS configurados y propagados
- [ ] Nginx configurado
- [ ] SSL certificados instalados
- [ ] PM2 configurado y guardado
- [ ] Aplicación funcionando en producción
- [ ] Firewall configurado
- [ ] Backups configurados

---

**¡Listo!** Tu aplicación TuDestino debería estar funcionando en producción.
