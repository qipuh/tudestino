# Guía de Despliegue Completa - TuDestino en VPS

Guía paso a paso para configurar y desplegar TuDestino en tu servidor VPS con dominios tudestino.pe y tudestino.lat.

## 📋 Información del Servidor

- **IP**: 161.132.38.151
- **Usuario**: root
- **SO**: Ubuntu/Debian
- **Aplicaciones**: API (Node.js), Web (React), Admin (React), phpMyAdmin

## 🌐 Dominios Configurados

### Dominio Principal (tudestino.pe)
- **Web**: https://tudestino.pe
- **API**: https://api.tudestino.pe
- **Admin**: https://admin.tudestino.pe
- **Database**: https://db.tudestino.pe (phpMyAdmin)

### Dominio Alternativo (tudestino.lat)
- **Web**: https://tudestino.lat → redirige a .pe
- **API**: https://api.tudestino.lat → redirige a .pe
- **Admin**: https://admin.tudestino.lat → redirige a .pe

## 🔐 Credenciales

### Servidor VPS
- IP: `161.132.38.151`
- Usuario: `root`
- Contraseña: `3@monitoSS`

### GitHub
- Usuario: `qipuh`
- Token: `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`

### MySQL (configurado automáticamente)
- Usuario root: `root`
- Contraseña: `TuDestino2026!Secure`

### phpMyAdmin
- Usuario: `adapptika`
- Contraseña: `3@monitoSS`
- URL: https://db.tudestino.pe

---

## 🚀 Proceso de Despliegue Completo

### FASE 1: Configuración del Servidor

#### Paso 1.1: Conectarse al Servidor

Desde tu terminal local:

```bash
ssh root@161.132.38.151
# Contraseña: 3@monitoSS
```

#### Paso 1.2: Ejecutar el Script de Configuración Inicial

```bash
cd ~
wget https://raw.githubusercontent.com/qipuh/tudestino/main/server-setup.sh
# O copia manualmente el contenido del archivo server-setup.sh

chmod +x server-setup.sh
./server-setup.sh
```

**Este script instala**:
- Node.js 20.x LTS
- MySQL 8.x
- Nginx
- PM2 (Process Manager)
- Certbot (SSL gratuito)
- UFW (Firewall)
- Fail2ban (Seguridad)

⏱️ **Tiempo**: 5-10 minutos

---

### FASE 2: Clonar el Proyecto

```bash
cd /var/www
git clone https://qipuh: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@github.com/qipuh/tudestino.git
cd tudestino
```

---

### FASE 3: Configurar DNS

**IMPORTANTE**: Antes de continuar, debes configurar tus dominios.

#### 3.1: Consultar el archivo DNS-CONFIG.md

```bash
cat DNS-CONFIG.md
```

#### 3.2: Configurar registros DNS

Ve al panel de control de tus dominios y crea estos registros A:

**Para tudestino.pe:**
```
A  @      → 161.132.38.151
A  www    → 161.132.38.151
A  api    → 161.132.38.151
A  admin  → 161.132.38.151
A  db     → 161.132.38.151
```

**Para tudestino.lat:**
```
A  @      → 161.132.38.151
A  www    → 161.132.38.151
A  api    → 161.132.38.151
A  admin  → 161.132.38.151
```

#### 3.3: Esperar propagación DNS (1-4 horas)

Verifica con:
```bash
dig tudestino.pe
dig api.tudestino.pe
dig db.tudestino.pe
```

---

### FASE 4: Configurar Variables de Entorno

#### 4.1: Generar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copia el resultado, lo usarás en el siguiente paso.

#### 4.2: Configurar API (.env)

```bash
cp apps/api/.env.production apps/api/.env
nano apps/api/.env
```

Edita estos valores importantes:
- `JWT_SECRET`: Pega el valor generado arriba
- `SMTP_USER`: tu-email@gmail.com
- `SMTP_PASS`: tu-contraseña-de-aplicación
- Los dominios ya están configurados correctamente (.pe)

#### 4.3: Configurar Web (.env)

```bash
cp apps/web/.env.production apps/web/.env
nano apps/web/.env
```

Los dominios ya están configurados. Solo necesitas actualizar:
- `VITE_GOOGLE_MAPS_API_KEY`: tu API key
- `VITE_CULQI_PUBLIC_KEY`: tu clave pública de Culqi
- `VITE_PAYPAL_CLIENT_ID`: tu Client ID de PayPal

#### 4.4: Configurar Admin (.env)

```bash
cp apps/admin/.env.production apps/admin/.env
# No necesitas editarlo, ya está configurado
```

---

### FASE 5: Instalar Dependencias y Construir

```bash
# Instalar dependencias
npm install

# Construir aplicaciones
npm run build:web
npm run build:admin
```

⏱️ **Tiempo**: 3-5 minutos

---

### FASE 6: Configurar Base de Datos

#### 6.1: Verificar MySQL

```bash
systemctl status mysql
```

#### 6.2: Ejecutar seeds (datos iniciales)

```bash
npm run seed:mysql
```

---

### FASE 7: Instalar phpMyAdmin

```bash
chmod +x install-phpmyadmin.sh
./install-phpmyadmin.sh
```

**Este script**:
- Instala PHP 8.1+ y extensiones
- Descarga e instala phpMyAdmin 5.2.1
- Crea el usuario `adapptika` con contraseña `3@monitoSS`
- Configura permisos y seguridad

⏱️ **Tiempo**: 3-5 minutos

---

### FASE 8: Configurar Nginx

```bash
# Copiar configuración de Nginx
cp nginx-tudestino.conf /etc/nginx/sites-available/tudestino

# Crear enlace simbólico
ln -s /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (opcional)
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
```

---

### FASE 9: Instalar Certificados SSL

**IMPORTANTE**: Solo ejecuta esto DESPUÉS de que los DNS estén propagados.

```bash
chmod +x install-ssl.sh
./install-ssl.sh
```

El script te pedirá:
1. Confirmar que los DNS están propagados
2. Tu email para notificaciones de Let's Encrypt

**Certificados que se instalarán**:
- tudestino.pe y www.tudestino.pe
- api.tudestino.pe
- admin.tudestino.pe
- db.tudestino.pe
- tudestino.lat y www.tudestino.lat
- api.tudestino.lat
- admin.tudestino.lat

⏱️ **Tiempo**: 3-5 minutos

Los certificados se renovarán automáticamente.

---

### FASE 10: Iniciar la Aplicación con PM2

```bash
# Iniciar la API
pm2 start ecosystem.config.cjs

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciarse al arrancar el servidor
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

---

### FASE 11: Verificar la Instalación

#### 11.1: Ver estado de PM2

```bash
pm2 status
pm2 logs tudestino-api
```

#### 11.2: Probar desde el navegador

Abre en tu navegador:

1. **Web**: https://tudestino.pe
2. **Admin**: https://admin.tudestino.pe
3. **API**: https://api.tudestino.pe/api
4. **phpMyAdmin**: https://db.tudestino.pe
   - Usuario: adapptika
   - Contraseña: 3@monitoSS

#### 11.3: Verificar certificados SSL

```bash
certbot certificates
```

Todos los dominios deben tener certificados válidos.

---

## 🔄 Actualizar la Aplicación

Cuando hagas cambios en el código:

### Opción 1: Script Rápido

```bash
cd /var/www/tudestino
chmod +x deploy-quick.sh
./deploy-quick.sh
```

### Opción 2: Manual

```bash
cd /var/www/tudestino

# Pull cambios
git pull origin main

# Instalar dependencias
npm install

# Rebuild
npm run build:web
npm run build:admin

# Reiniciar API
pm2 restart tudestino-api

# Verificar
pm2 logs
```

---

## 🔧 Comandos Útiles

### PM2 (Process Manager)

```bash
pm2 status              # Ver estado de procesos
pm2 logs                # Ver logs en tiempo real
pm2 logs tudestino-api  # Logs de la API
pm2 restart all         # Reiniciar todo
pm2 restart tudestino-api  # Reiniciar solo API
pm2 stop all            # Detener todo
pm2 monit               # Monitor en tiempo real
pm2 save                # Guardar configuración actual
```

### Nginx

```bash
nginx -t                    # Verificar configuración
systemctl reload nginx      # Recargar configuración
systemctl restart nginx     # Reiniciar Nginx
systemctl status nginx      # Ver estado

# Logs
tail -f /var/log/tudestino/api-pe-access.log
tail -f /var/log/tudestino/api-pe-error.log
tail -f /var/log/tudestino/web-pe-access.log
tail -f /var/log/tudestino/phpmyadmin-access.log
```

### MySQL

```bash
# Acceder a MySQL
mysql -u root -p
# Contraseña: TuDestino2026!Secure

# Comandos útiles dentro de MySQL
SHOW DATABASES;
USE tudestino;
SHOW TABLES;
SELECT * FROM users LIMIT 10;

# Backup
mysqldump -u root -p tudestino > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar
mysql -u root -p tudestino < backup.sql
```

### SSL (Certbot)

```bash
certbot certificates         # Ver todos los certificados
certbot renew               # Renovar certificados
certbot renew --dry-run     # Probar renovación
systemctl list-timers | grep certbot  # Ver timer de renovación automática
```

### Sistema

```bash
df -h                   # Espacio en disco
free -h                 # Memoria RAM
htop                    # Monitor de procesos
ufw status              # Estado del firewall
fail2ban-client status  # Estado de fail2ban
journalctl -xe          # Logs del sistema
```

---

## 🛡️ Seguridad

### Firewall Configurado

```bash
ufw status
```

Puertos abiertos:
- 22 (SSH)
- 80 (HTTP - redirige a HTTPS)
- 443 (HTTPS)
- 3000 (API - solo localhost)

### Fail2ban

Protección contra ataques de fuerza bruta en SSH.

```bash
fail2ban-client status sshd
```

### Actualizaciones del Sistema

```bash
apt update
apt upgrade -y
apt autoremove -y
```

**Recomendación**: Ejecutar cada semana.

---

## 🐛 Troubleshooting

### La API no arranca

```bash
pm2 logs tudestino-api
pm2 restart tudestino-api
```

### Error de conexión a MySQL

```bash
systemctl status mysql
mysql -u root -p -e "SELECT 1;"
```

Verifica credenciales en `apps/api/.env`

### Error 502 Bad Gateway

```bash
pm2 status                # Verificar que la API está corriendo
nginx -t                  # Verificar configuración de Nginx
tail -f /var/log/nginx/error.log
```

### phpMyAdmin no carga

```bash
systemctl status php8.1-fpm  # o la versión instalada
systemctl status nginx
tail -f /var/log/tudestino/phpmyadmin-error.log
```

### SSL no funciona

Verifica que los DNS estén propagados:
```bash
dig tudestino.pe
```

Reinstala certificados:
```bash
./install-ssl.sh
```

### Dominio .lat no redirige a .pe

Verifica la configuración de Nginx:
```bash
nginx -t
grep "301" /etc/nginx/sites-available/tudestino
systemctl reload nginx
```

---

## 📊 Archivos de Configuración

### Ubicaciones Importantes

```
/var/www/tudestino/                    # Proyecto
/var/www/tudestino/apps/api/.env       # Config API
/var/www/tudestino/uploads/            # Archivos subidos
/etc/nginx/sites-available/tudestino   # Config Nginx
/etc/letsencrypt/live/                 # Certificados SSL
/var/log/tudestino/                    # Logs de la app
/usr/share/phpmyadmin/                 # phpMyAdmin
```

---

## ✅ Checklist de Despliegue

- [ ] Servidor VPS configurado (server-setup.sh)
- [ ] Repositorio clonado
- [ ] DNS configurados para .pe y .lat
- [ ] DNS propagados (verificado con dig)
- [ ] Variables .env configuradas (API, Web, Admin)
- [ ] JWT_SECRET generado
- [ ] Dependencias instaladas
- [ ] Aplicaciones construidas (build)
- [ ] Base de datos con seeds
- [ ] phpMyAdmin instalado
- [ ] Nginx configurado
- [ ] Certificados SSL instalados para todos los dominios
- [ ] PM2 iniciado y guardado
- [ ] Todos los dominios funcionando con HTTPS
- [ ] phpMyAdmin accesible en https://db.tudestino.pe
- [ ] Firewall configurado
- [ ] Fail2ban activo

---

## 📞 Resumen de URLs

### Producción (Dominio Principal .pe)

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Web | https://tudestino.pe | Sitio público |
| Web (www) | https://www.tudestino.pe | Alias del sitio |
| API | https://api.tudestino.pe | Backend REST API |
| Admin | https://admin.tudestino.pe | Panel administrativo |
| Database | https://db.tudestino.pe | phpMyAdmin |

### Alternativo (.lat - redirige a .pe)

| Servicio | URL | Redirige a |
|----------|-----|------------|
| Web | https://tudestino.lat | https://tudestino.pe |
| API | https://api.tudestino.lat | https://api.tudestino.pe |
| Admin | https://admin.tudestino.lat | https://admin.tudestino.pe |

---

## 🎉 ¡Listo!

Tu aplicación TuDestino está ahora en producción con:

✅ Dos dominios configurados (.pe y .lat)
✅ SSL gratuito en todos los dominios
✅ phpMyAdmin seguro con autenticación
✅ Renovación automática de certificados SSL
✅ PM2 gestionando la API con auto-restart
✅ Nginx sirviendo los frontends optimizados
✅ Firewall y seguridad configurados
✅ Backups automáticos de MySQL

**¡Tu plataforma está lista para recibir usuarios!**
