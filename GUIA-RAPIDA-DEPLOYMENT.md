# Guía Rápida de Despliegue - TuDestino

## 🎯 Resumen

Esta guía te llevará desde un servidor con Webuzo hasta tener TuDestino funcionando en **AMBOS** dominios (.pe y .lat) sirviendo el mismo contenido.

---

## 📋 Información del Servidor

- **IP**: 161.132.38.151
- **Usuario**: root
- **Contraseña**: 3@monitoSS
- **Dominios**: tudestino.pe y tudestino.lat (ambos activos)

---

## 🚀 Proceso de Instalación (Orden Correcto)

### **PASO 1: Conectarse al Servidor**

```bash
ssh root@161.132.38.151
# Contraseña: 3@monitoSS
```

---

### **PASO 2: Desinstalar Webuzo** ⚠️

```bash
cd ~
wget https://raw.githubusercontent.com/qipuh/tudestino/main/remove-webuzo.sh
chmod +x remove-webuzo.sh
./remove-webuzo.sh
# Escribir 'SI' para confirmar
```

**Esto eliminará**:
- Panel Webuzo
- Apache (viene con Webuzo)
- MySQL de Webuzo
- Archivos y configuraciones residuales

⏱️ **Tiempo**: 5 minutos

---

### **PASO 3: Instalar Software Necesario**

```bash
cd ~
wget https://raw.githubusercontent.com/qipuh/tudestino/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

**Esto instalará**:
- Node.js 20.x LTS
- MySQL 8.x (nuevo, limpio)
- Nginx
- PM2
- Certbot (SSL gratuito)
- Firewall UFW
- Fail2ban

⏱️ **Tiempo**: 5-10 minutos

---

### **PASO 4: Clonar el Proyecto**

```bash
cd /var/www
git clone https://qipuh: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@github.com/qipuh/tudestino.git
cd tudestino
```

---

### **PASO 5: Configurar DNS** ⏰

**IMPORTANTE**: Configura los DNS AHORA y espera 1-4 horas.

#### Ir a tu panel de dominios:

**Para tudestino.pe:**
```
Tipo A:
  @      → 161.132.38.151
  www    → 161.132.38.151
  api    → 161.132.38.151
  admin  → 161.132.38.151
  db     → 161.132.38.151
```

**Para tudestino.lat:**
```
Tipo A:
  @      → 161.132.38.151
  www    → 161.132.38.151
  api    → 161.132.38.151
  admin  → 161.132.38.151
```

#### Verificar propagación:
```bash
dig tudestino.pe
dig api.tudestino.pe
dig tudestino.lat
dig api.tudestino.lat
```

⏱️ **Esperar**: 1-4 horas para propagación completa

---

### **PASO 6: Configurar Variables de Entorno**

#### 6.1 Generar JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copia el resultado.

#### 6.2 Configurar API:
```bash
cp apps/api/.env.production apps/api/.env
nano apps/api/.env
```

Edita:
- `JWT_SECRET`: Pega el valor generado
- `SMTP_USER`: tu-email@gmail.com
- `SMTP_PASS`: tu-contraseña-de-app
- `STRIPE_SECRET_KEY`: tu clave (opcional por ahora)

#### 6.3 Configurar Web:
```bash
cp apps/web/.env.production apps/web/.env
nano apps/web/.env
```

Edita:
- `VITE_GOOGLE_MAPS_API_KEY`: tu API key
- `VITE_CULQI_PUBLIC_KEY`: tu clave (opcional)
- `VITE_PAYPAL_CLIENT_ID`: tu client ID (opcional)

#### 6.4 Configurar Admin:
```bash
cp apps/admin/.env.production apps/admin/.env
# Ya está configurado, no necesitas editarlo
```

---

### **PASO 7: Instalar Dependencias y Construir**

```bash
npm install
npm run build:web
npm run build:admin
```

⏱️ **Tiempo**: 3-5 minutos

---

### **PASO 8: Configurar Base de Datos**

```bash
# MySQL ya fue instalado por server-setup.sh
# Ejecutar seeds (datos iniciales)
npm run seed:mysql
```

---

### **PASO 9: Instalar phpMyAdmin**

```bash
chmod +x install-phpmyadmin.sh
./install-phpmyadmin.sh
```

**Credenciales**:
- Usuario: `adapptika`
- Contraseña: `3@monitoSS`
- URL: https://db.tudestino.pe

⏱️ **Tiempo**: 3-5 minutos

---

### **PASO 10: Configurar Nginx (AMBOS DOMINIOS)**

```bash
# Copiar la configuración que sirve AMBOS dominios
cp nginx-ambos-dominios.conf /etc/nginx/sites-available/tudestino

# Crear enlace simbólico
ln -s /etc/nginx/sites-available/tudestino /etc/nginx/sites-enabled/

# Eliminar configuración por defecto (si existe)
rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Recargar Nginx
systemctl reload nginx
```

---

### **PASO 11: Instalar Certificados SSL**

**Solo ejecutar DESPUÉS de que los DNS estén propagados** (verifica con `dig`)

```bash
chmod +x install-ssl.sh
./install-ssl.sh
```

Te pedirá:
1. Confirmar que DNS están propagados
2. Tu email para notificaciones

⏱️ **Tiempo**: 3-5 minutos

---

### **PASO 12: Iniciar la Aplicación**

```bash
# Iniciar con PM2
pm2 start ecosystem.config.cjs

# Guardar configuración
pm2 save

# Configurar inicio automático
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

---

### **PASO 13: Verificar Instalación** ✅

#### Ver estado de PM2:
```bash
pm2 status
pm2 logs tudestino-api
```

#### Probar en el navegador:

**Dominio .pe:**
- ✅ https://tudestino.pe
- ✅ https://www.tudestino.pe
- ✅ https://api.tudestino.pe/api
- ✅ https://admin.tudestino.pe
- ✅ https://db.tudestino.pe (adapptika / 3@monitoSS)

**Dominio .lat (mismo contenido que .pe):**
- ✅ https://tudestino.lat
- ✅ https://www.tudestino.lat
- ✅ https://api.tudestino.lat/api
- ✅ https://admin.tudestino.lat

---

## 🔄 Actualizar la Aplicación

```bash
cd /var/www/tudestino
chmod +x deploy-quick.sh
./deploy-quick.sh
```

O manualmente:
```bash
git pull origin main
npm install
npm run build:web
npm run build:admin
pm2 restart tudestino-api
pm2 logs
```

---

## 🌐 Configuración Final - Ambos Dominios

### ✅ Cómo Funciona:

1. **API** (`api.tudestino.pe` y `api.tudestino.lat`):
   - Ambos dominios apuntan a la misma API en `localhost:3000`
   - La API acepta peticiones desde ambos dominios (configurado en CORS)

2. **Web** (`tudestino.pe` y `tudestino.lat`):
   - Ambos dominios sirven los mismos archivos desde `/var/www/tudestino/apps/web/dist`
   - Sin redirecciones entre ellos

3. **Admin** (`admin.tudestino.pe` y `admin.tudestino.lat`):
   - Ambos dominios sirven los mismos archivos desde `/var/www/tudestino/apps/admin/dist`
   - Sin redirecciones entre ellos

4. **phpMyAdmin**:
   - Solo disponible en `db.tudestino.pe`

### ✅ CORS Configurado:

El archivo `.env` de la API ya permite ambos dominios:
```
CORS_ORIGIN=https://tudestino.pe,https://www.tudestino.pe,https://admin.tudestino.pe,https://tudestino.lat,https://www.tudestino.lat,https://admin.tudestino.lat
```

---

## 🔧 Comandos Útiles

```bash
# PM2
pm2 status
pm2 logs
pm2 restart tudestino-api
pm2 monit

# Nginx
nginx -t
systemctl reload nginx
tail -f /var/log/tudestino/api-access.log
tail -f /var/log/tudestino/web-access.log

# MySQL
mysql -u root -pTuDestino2026!Secure
mysql -u adapptika -p3@monitoSS

# SSL
certbot certificates
certbot renew --dry-run

# Sistema
df -h
free -h
htop
```

---

## ✅ Checklist de Despliegue

- [ ] Webuzo desinstalado
- [ ] Software instalado (Node, MySQL, Nginx, PM2)
- [ ] Repositorio clonado
- [ ] DNS configurados (.pe y .lat)
- [ ] DNS propagados (verificado con dig)
- [ ] Variables .env configuradas
- [ ] Dependencias instaladas
- [ ] Build completado
- [ ] Seeds ejecutados
- [ ] phpMyAdmin instalado
- [ ] Nginx configurado (nginx-ambos-dominios.conf)
- [ ] SSL instalado para todos los dominios
- [ ] PM2 corriendo
- [ ] Ambos dominios funcionando (.pe y .lat)
- [ ] Firewall configurado

---

## 🎉 ¡Listo!

Ahora tienes:
- ✅ **2 dominios activos** (.pe y .lat) sirviendo el mismo contenido
- ✅ **SSL gratuito** en todos los subdominios
- ✅ **phpMyAdmin** seguro
- ✅ **API única** respondiendo a ambos dominios
- ✅ **Sin Webuzo** - servidor limpio y optimizado

**Todas las URLs funcionan sin redirecciones entre dominios**
