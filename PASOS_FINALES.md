# ✅ Pasos Finales para Completar el Despliegue

## 📋 Lo que YA está hecho:

✅ Base de datos MySQL conectada correctamente
✅ Usuario corregido: `admin_tudestino`
✅ API corriendo con PM2 en puerto 3000
✅ Subdominio `api.tudestino.qipuh.com` creado en Plesk
✅ Apache configurado y corriendo
✅ Web funcionando en `https://tudestino.qipuh.com`

---

## 🔧 Último Paso: Configurar Proxy para la API

Conectate al servidor y ejecuta estos comandos:

```bash
# Conectar al servidor
ssh root@74.208.69.243
```

### Paso 1: Crear configuración del proxy

```bash
cat > /var/www/vhosts/system/api.tudestino.qipuh.com/conf/vhost.conf << 'EOF'
# Proxy to Node.js API
ProxyPreserveHost On
ProxyPass / http://localhost:3000/
ProxyPassReverse / http://localhost:3000/

# WebSocket support
ProxyPass /socket.io/ ws://localhost:3000/socket.io/
ProxyPassReverse /socket.io/ ws://localhost:3000/socket.io/
EOF
```

### Paso 2: Reconstruir configuración de Plesk

```bash
/usr/sbin/plesk bin domain --update api.tudestino.qipuh.com -ssl true
/usr/sbin/plesk repair web api.tudestino.qipuh.com
```

### Paso 3: Recargar Apache

```bash
systemctl reload apache2
```

### Paso 4: Probar que funciona

```bash
curl http://api.tudestino.qipuh.com/health
```

**Deberías ver:**
```json
{"status":"OK","timestamp":"2025-10-23T..."}
```

---

## 🌐 URLs Finales

Una vez completado el paso anterior:

- **Web**: https://tudestino.qipuh.com ✅ (Ya funciona)
- **API**: http://api.tudestino.qipuh.com/health (Funcionará después del paso)
- **API (HTTPS)**: https://api.tudestino.qipuh.com/health (Después de configurar SSL)

---

## 🔐 OPCIONAL: Configurar SSL para la API

```bash
# Instalar Certbot si no está instalado
apt-get update
apt-get install -y certbot python3-certbot-apache

# Obtener certificado SSL
certbot --apache -d api.tudestino.qipuh.com

# Certbot configurará automáticamente HTTPS
```

---

## 📱 Actualizar URL en la App Móvil

Una vez que la API funcione con HTTPS, actualiza la URL en la app:

**Archivo**: `apps/mobile/lib/core/services/api_service.dart`

```dart
static const String baseUrl = 'https://api.tudestino.qipuh.com/api';
```

Luego recompila la APK:
```bash
cd apps/mobile
flutter clean
flutter build apk --release
```

---

## ✅ Checklist Final

- [ ] Ejecutar el script de configuración del proxy
- [ ] Verificar que `http://api.tudestino.qipuh.com/health` funciona
- [ ] Configurar SSL para la API (opcional pero recomendado)
- [ ] Actualizar URL en la app móvil si usas HTTPS
- [ ] Recompilar APK si cambiaste la URL
- [ ] Probar que la web carga sin errores
- [ ] Probar que la app móvil se conecta correctamente

---

## 🎯 Resumen de Todo lo Hecho

### En tu computadora:
- ✅ APK compilada con todos los cambios
- ✅ Permisos de internet agregados
- ✅ Colores actualizados (azul turquesa)
- ✅ Feed social agregado al home
- ✅ Navegación "Reels" en lugar de "Reservas"

### En el servidor:
- ✅ MySQL configurado con usuario `admin_tudestino`
- ✅ API desplegada y corriendo con PM2
- ✅ Web desplegada en la raíz (no en /web)
- ✅ Apache configurado
- ✅ Subdominio api.tudestino.qipuh.com creado

### Por hacer (1 paso):
- [ ] Configurar el proxy de Apache para la API

---

**Una vez completes el último paso, todo estará funcionando perfectamente!** 🎉
