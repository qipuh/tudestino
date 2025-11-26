# Guía Rápida: DNS y SSL para tudestino.lat

## 🌐 Paso 1: Configurar DNS (HACER AHORA)

### Opción A: Si tu dominio está en un panel de control (cPanel, Plesk, etc.)

1. Inicia sesión en el panel de control de tu proveedor de dominio
2. Busca la sección "DNS" o "Gestión de DNS" o "DNS Management"
3. Agrega estos dos registros:

```
Tipo: A
Nombre: @
Dirección: 161.132.38.151
TTL: 3600 (o el valor por defecto)

Tipo: A
Nombre: www
Dirección: 161.132.38.151
TTL: 3600 (o el valor por defecto)
```

### Opción B: Si tu dominio está en un proveedor específico

#### Namecheap
1. Panel → Domain List → Manage → Advanced DNS
2. Add New Record:
   - Type: A Record, Host: @, Value: 161.132.38.151
   - Type: A Record, Host: www, Value: 161.132.38.151

#### GoDaddy
1. Domain Settings → Manage DNS
2. Add:
   - Type: A, Name: @, Value: 161.132.38.151
   - Type: A, Name: www, Value: 161.132.38.151

#### Cloudflare
1. DNS → Add record
2. Add:
   - Type: A, Name: @, IPv4: 161.132.38.151, Proxy: OFF (naranja → gris)
   - Type: A, Name: www, IPv4: 161.132.38.151, Proxy: OFF (naranja → gris)

**IMPORTANTE:** Si usas Cloudflare, desactiva el proxy (nube naranja) hasta que SSL esté configurado.

### Verificar Propagación de DNS

Desde tu computadora local, ejecuta:

```bash
# Windows (CMD o PowerShell)
nslookup tudestino.lat
ping tudestino.lat

# Linux/Mac
dig tudestino.lat
ping tudestino.lat
```

**Deberías ver:** `161.132.38.151`

**Tiempo de propagación:** 5 minutos a 48 horas (normalmente 1-2 horas)

**Verificar online:** https://dnschecker.org/ → Buscar "tudestino.lat"

---

## 🔒 Paso 2: Instalar SSL con Let's Encrypt (DESPUÉS DE DNS)

### ⚠️ IMPORTANTE
**Solo procede cuando el DNS esté propagado y `ping tudestino.lat` responda con 161.132.38.151**

### Ejecutar Certbot

Conéctate al servidor y ejecuta:

```bash
# 1. Conectarse al servidor
ssh root@161.132.38.151
# Contraseña: O7%aoR0&hNjG

# 2. Instalar certbot (si no está instalado)
apt install -y certbot python3-certbot-nginx

# 3. Obtener certificado SSL
certbot --nginx -d tudestino.lat -d www.tudestino.lat
```

### Durante la instalación, Certbot preguntará:

1. **Email:** Ingresa un email válido para notificaciones de expiración
   ```
   ejemplo@gmail.com
   ```

2. **Términos de servicio:** Acepta con `Y`

3. **¿Compartir email con EFF?** Responde lo que prefieras (`Y` o `N`)

4. **¿Redirigir HTTP a HTTPS?**
   ```
   Selecciona: 2 (Redirect - Recommended)
   ```
   Esto hará que todas las visitas HTTP redirijan automáticamente a HTTPS

### Resultado Esperado

```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/tudestino.lat/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/tudestino.lat/privkey.pem
This certificate expires on 2026-02-23.
These files will be updated when the certificate renews.
Certbot has set up a scheduled task to automatically renew this certificate in the background.

Deploying certificate
Successfully deployed certificate for tudestino.lat to /etc/nginx/sites-enabled/tudestino
Successfully deployed certificate for www.tudestino.lat to /etc/nginx/sites-enabled/tudestino
Congratulations! You have successfully enabled HTTPS on https://tudestino.lat and https://www.tudestino.lat
```

### Verificar SSL

```bash
# Verificar que Nginx esté corriendo con SSL
nginx -t
systemctl status nginx

# Probar HTTPS localmente
curl -I https://tudestino.lat
```

Desde tu navegador, visita:
- https://tudestino.lat ✅
- https://www.tudestino.lat ✅

**Deberías ver el candado verde en el navegador** 🔒

---

## 🔄 Renovación Automática de SSL

Certbot configura automáticamente la renovación. Verificar:

```bash
# Ver timer de renovación
systemctl status certbot.timer

# Probar renovación (dry-run)
certbot renew --dry-run
```

Los certificados se renuevan automáticamente 30 días antes de expirar.

---

## 📱 Paso 3: Actualizar Configuración de la App (Después de SSL)

Una vez que SSL esté funcionando, actualiza las URLs en el código:

```bash
# Conectarse al servidor
ssh root@161.132.38.151

# Actualizar .env de la API
nano /var/www/tudestino/apps/api/.env
```

Cambiar estas líneas:
```env
API_URL=https://tudestino.lat/api
WEB_URL=https://tudestino.lat
ADMIN_URL=https://tudestino.lat/admin
CORS_ORIGIN=https://tudestino.lat,https://www.tudestino.lat
```

Guardar (Ctrl+X, Y, Enter)

```bash
# Reiniciar API para aplicar cambios
pm2 restart tudestino-api

# Verificar que esté corriendo
pm2 status
```

---

## ✅ Verificación Final

### Checklist de Éxito

- [ ] DNS configurado (@ y www apuntan a 161.132.38.151)
- [ ] DNS propagado (ping responde con IP correcta)
- [ ] SSL instalado con certbot
- [ ] https://tudestino.lat funciona con candado verde
- [ ] https://www.tudestino.lat funciona con candado verde
- [ ] http:// redirige automáticamente a https://
- [ ] API responde en https://tudestino.lat/api/health
- [ ] Admin panel accesible en https://tudestino.lat/admin

### Probar la Aplicación

1. **Web Principal:**
   - Abrir: https://tudestino.lat
   - Debería cargar la página de inicio de TuDestino

2. **Panel Admin:**
   - Abrir: https://tudestino.lat/admin
   - Intentar login con: admin@tudestino.com / admin123

3. **API:**
   - Abrir: https://tudestino.lat/api/health
   - Debería mostrar: `{"status":"OK","timestamp":"..."}`

---

## 🐛 Solución de Problemas

### Problema: DNS no propaga
```bash
# Esperar más tiempo (hasta 48h en casos extremos)
# Verificar configuración en el panel del dominio
# Usar: https://dnschecker.org/
```

### Problema: Certbot falla con "DNS lookup failed"
```
Causa: DNS no está propagado aún
Solución: Esperar y reintentar cuando ping funcione
```

### Problema: Certbot falla con "Connection refused"
```bash
# Verificar que Nginx esté corriendo
systemctl status nginx
systemctl restart nginx

# Verificar puerto 80 abierto
curl -I http://tudestino.lat
```

### Problema: "Certificate verification failed"
```bash
# Limpiar intentos fallidos
certbot delete --cert-name tudestino.lat

# Reintentar desde cero
certbot --nginx -d tudestino.lat -d www.tudestino.lat
```

### Problema: Cloudflare interfiere con SSL
```
1. En Cloudflare, ir a SSL/TLS
2. Cambiar a "Full (strict)" después de instalar certificado
3. O desactivar proxy completamente (nube gris)
```

---

## 📞 Comandos de Emergencia

### Si algo sale mal con Nginx
```bash
# Restaurar configuración básica
cat > /etc/nginx/sites-available/tudestino << 'EOF'
server {
    listen 80;
    server_name tudestino.lat www.tudestino.lat;
    root /var/www/tudestino/apps/web/dist;
    index index.html;

    location /api {
        proxy_pass http://localhost:3000;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

nginx -t && systemctl reload nginx
```

### Si necesitas eliminar SSL y empezar de nuevo
```bash
certbot delete --cert-name tudestino.lat
rm /etc/nginx/sites-enabled/tudestino
# Luego restaurar configuración básica arriba
```

---

## 📌 Notas Importantes

1. **Primer SSL:** La primera vez tarda más porque Let's Encrypt verifica que controlas el dominio
2. **Rate Limits:** Let's Encrypt permite 5 certificados fallidos por semana, así que prueba con cuidado
3. **Wildcard SSL:** No es necesario para este proyecto (solo necesitamos @ y www)
4. **Renovación:** Automática, pero revisar cada 2-3 meses que funcione
5. **Firewall:** Si tienes firewall, asegurar que puertos 80 y 443 estén abiertos

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación estará:
- ✅ Accesible en tudestino.lat
- ✅ Protegida con HTTPS
- ✅ Con certificado SSL válido
- ✅ Lista para producción

**Tiempo estimado total:** 1-3 horas (dependiendo de propagación DNS)

---

**Cualquier duda, revisar:** [DEPLOYMENT_TUDESTINO_LAT.md](DEPLOYMENT_TUDESTINO_LAT.md)
