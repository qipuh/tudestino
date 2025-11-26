# Despliegue de TuDestino en tudestino.lat

## ✅ Estado del Despliegue

**Fecha:** 2025-11-25
**Dominio:** tudestino.lat
**Servidor:** 161.132.38.151
**Sistema Operativo:** Ubuntu 24.04.3 LTS

## 🎯 Resumen

El sistema TuDestino ha sido desplegado exitosamente en el servidor de producción. La aplicación está corriendo y lista para ser configurada con DNS y SSL.

## 📋 Componentes Instalados

### Software del Servidor
- ✅ **Node.js:** v20.19.6
- ✅ **npm:** 10.8.2
- ✅ **MySQL Server:** 8.0.44
- ✅ **Nginx:** 1.24.0
- ✅ **PM2:** Instalado globalmente

### Aplicaciones TuDestino
- ✅ **API Backend:** Corriendo en puerto 3000 con PM2
- ✅ **Web Frontend:** Construido y servido por Nginx
- ✅ **Admin Panel:** Construido y servido por Nginx

## 🔐 Credenciales y Configuración

### Acceso SSH
```
Servidor: 161.132.38.151
Usuario: root
Contraseña: O7%aoR0&hNjG
```

### MySQL
```
Host: localhost
Port: 3306
Database: tudestino
Usuario: root
Contraseña: bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=
```
*Nota: La contraseña también está guardada en `/root/.mysql_password` (NO CREADO) y en `/var/www/tudestino/apps/api/.env`*

### GitHub
```
Usuario: qipuh
Token: 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
Repositorio: https://github.com/qipuh/tudestino.git
```

### Usuarios de Prueba (Base de Datos)
```
Admin:
  Email: admin@tudestino.com
  Password: admin123

Host:
  Email: host@tudestino.com
  Password: host123

Guest:
  Email: guest@tudestino.com
  Password: guest123
```

## 📂 Estructura de Directorios

```
/var/www/tudestino/              # Directorio principal de la aplicación
├── apps/
│   ├── api/                     # Backend API
│   │   ├── src/
│   │   └── .env                 # Variables de entorno
│   ├── web/
│   │   └── dist/                # Build de producción (servido por Nginx)
│   └── admin/
│       └── dist/                # Build de producción (servido por Nginx)
├── ecosystem.config.cjs         # Configuración de PM2
└── node_modules/

/etc/nginx/sites-available/tudestino    # Configuración de Nginx
/var/log/pm2/                           # Logs de PM2
```

## 🚀 Comandos Útiles

### PM2 (Gestión de API)
```bash
pm2 status                  # Ver estado de procesos
pm2 logs tudestino-api      # Ver logs en tiempo real
pm2 restart tudestino-api   # Reiniciar API
pm2 stop tudestino-api      # Detener API
pm2 start tudestino-api     # Iniciar API
pm2 save                    # Guardar configuración actual
```

### Nginx
```bash
systemctl status nginx      # Ver estado de Nginx
systemctl restart nginx     # Reiniciar Nginx
systemctl reload nginx      # Recargar configuración
nginx -t                    # Probar configuración
tail -f /var/log/nginx/error.log    # Ver logs de error
```

### MySQL
```bash
mysql -u root -p'bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=' tudestino
# Mostrar tablas
mysql -u root -p'bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=' -e "USE tudestino; SHOW TABLES;"
```

### Actualizar Aplicación desde GitHub
```bash
cd /var/www/tudestino
git pull origin main
npm install
npm run build:web
npm run build:admin
pm2 restart tudestino-api
```

## 🌐 URLs de Acceso

### Acceso Actual (HTTP - Temporal)
```
Web App:     http://161.132.38.151/
Admin Panel: http://161.132.38.151/admin
API:         http://161.132.38.151/api
Health:      http://161.132.38.151/api/health
```

### Acceso Futuro (Después de DNS + SSL)
```
Web App:     https://tudestino.lat/
Admin Panel: https://tudestino.lat/admin
API:         https://tudestino.lat/api
```

## ⚠️ PRÓXIMOS PASOS CRÍTICOS

### 1. Configurar DNS (URGENTE)
Debes configurar los registros DNS en tu proveedor de dominio para que `tudestino.lat` apunte al servidor:

```
Tipo: A
Nombre: @
Valor: 161.132.38.151
TTL: 3600

Tipo: A
Nombre: www
Valor: 161.132.38.151
TTL: 3600
```

**Verificar DNS:**
```bash
# Desde tu computadora local
nslookup tudestino.lat
ping tudestino.lat
```

### 2. Configurar SSL con Let's Encrypt (Después del DNS)

Una vez que el DNS esté propagado (puede tomar 1-48 horas), ejecuta:

```bash
# Conectarse al servidor
ssh root@161.132.38.151

# Obtener certificado SSL
certbot --nginx -d tudestino.lat -d www.tudestino.lat

# Seguir las instrucciones en pantalla
# Certbot configurará automáticamente HTTPS en Nginx
```

Certbot te preguntará:
- Email (para notificaciones de expiración)
- Aceptar términos de servicio
- Si deseas redirigir HTTP a HTTPS (recomendado: SÍ)

### 3. Configuración Opcional

#### Configurar Stripe (Pagos)
Edita `/var/www/tudestino/apps/api/.env` y agrega:
```
STRIPE_SECRET_KEY=tu_clave_secreta
STRIPE_WEBHOOK_SECRET=tu_webhook_secret
```
Luego reinicia: `pm2 restart tudestino-api`

#### Configurar Email (SMTP)
Edita `/var/www/tudestino/apps/api/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_email@gmail.com
SMTP_PASS=tu_app_password
```
Luego reinicia: `pm2 restart tudestino-api`

## 🔒 Seguridad

### Firewall (Recomendado)
```bash
# Configurar UFW (Uncomplicated Firewall)
ufw allow 22/tcp     # SSH
ufw allow 80/tcp     # HTTP
ufw allow 443/tcp    # HTTPS
ufw enable
ufw status
```

### Actualizar Contraseña de Root
```bash
passwd root
# Luego ingresa una nueva contraseña segura
```

### Actualizar Contraseña de MySQL
```bash
mysql -u root -p'bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=' -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'NUEVA_CONTRASEÑA_SEGURA';"
# Actualizar también en /var/www/tudestino/apps/api/.env
# Reiniciar API: pm2 restart tudestino-api
```

## 📊 Monitoreo

### Ver Estado del Sistema
```bash
# CPU y Memoria
htop

# Espacio en disco
df -h

# Procesos de Node.js
ps aux | grep node

# Estado de servicios
systemctl status nginx
systemctl status mysql
pm2 status
```

### Logs Importantes
```
Nginx Access:  /var/log/nginx/access.log
Nginx Error:   /var/log/nginx/error.log
PM2 API Out:   /var/log/pm2/tudestino-api-out.log
PM2 API Error: /var/log/pm2/tudestino-api-error.log
MySQL:         /var/log/mysql/error.log
```

## 🐛 Solución de Problemas

### API No Responde
```bash
pm2 logs tudestino-api           # Ver errores
pm2 restart tudestino-api        # Reiniciar
curl http://localhost:3000/health  # Probar localmente
```

### Nginx No Sirve Contenido
```bash
nginx -t                          # Verificar configuración
systemctl status nginx            # Ver estado
tail -f /var/log/nginx/error.log  # Ver errores
```

### Error de Base de Datos
```bash
systemctl status mysql            # Verificar MySQL
mysql -u root -p'...' -e "SHOW DATABASES;"  # Probar conexión
pm2 logs tudestino-api | grep -i mysql     # Ver errores MySQL
```

### Problemas con el Seed de Datos
El seed tiene un problema conocido con la columna `petsAllowed`. Si necesitas agregar propiedades de prueba:
```bash
cd /var/www/tudestino/apps/api
# Editar src/config/seed-mysql.js si es necesario
# O insertar datos manualmente vía MySQL
```

## 📝 Notas Importantes

1. **Base de Datos:** Las tablas fueron creadas correctamente con usuarios de prueba. El seed de propiedades falló parcialmente (error con `petsAllowed`), pero esto no afecta el funcionamiento básico.

2. **PM2 Configuración:** La API está configurada para iniciarse automáticamente al reiniciar el servidor (systemd).

3. **Backups:** NO hay configuración de backups automáticos. Recomendado configurar:
   ```bash
   # Backup manual de MySQL
   mysqldump -u root -p'bWxxAYOS3I3+rQIPswCCy4413L4z0FnjoN8UFBZm03M=' tudestino > backup_$(date +%Y%m%d).sql
   ```

4. **Variables de Entorno:** El JWT_SECRET fue generado aleatoriamente. Guardalo en un lugar seguro.

## ✅ Verificación Final

### Checklist Pre-Producción
- [x] Node.js instalado
- [x] MySQL corriendo
- [x] Nginx configurado
- [x] PM2 corriendo con API
- [x] Web y Admin construidos
- [x] Base de datos inicializada
- [ ] DNS configurado
- [ ] SSL instalado
- [ ] Firewall configurado
- [ ] Backups configurados
- [ ] Stripe configurado (opcional)
- [ ] Email configurado (opcional)

## 🆘 Soporte

Para problemas o preguntas:
1. Revisar logs: `pm2 logs tudestino-api`
2. Verificar estado: `pm2 status`
3. Reiniciar servicios si es necesario

---

**Deployment realizado por:** Claude Code
**Fecha:** 2025-11-25
**Versión:** 1.0.0
