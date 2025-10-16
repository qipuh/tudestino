# 🌐 Configurar Dominios de Laragon - TuDestino

## ✅ Usar tudestino.test en Laragon

Laragon permite crear dominios locales `.test` automáticamente. Vamos a configurar:

- **Backend API:** `api.tudestino.test`
- **Frontend Web:** `tudestino.test`
- **Admin Panel:** `admin.tudestino.test`

---

## 🚀 Opción 1: Configuración Automática (Más Fácil)

### Paso 1: Estructura de Carpetas para Laragon

Laragon crea automáticamente dominios basados en la estructura de carpetas:

```
C:\laragon\www\tudestino\
```

**Laragon automáticamente creará:** `tudestino.test`

### Paso 2: Activar Auto Virtual Hosts

1. **Click derecho en Laragon** (icono en bandeja)
2. **Preferencias** → **General**
3. ✅ Marcar **"Auto create virtual hosts"**
4. ✅ Marcar **"Auto update hosts file"**
5. Click **"OK"**

### Paso 3: Reiniciar Laragon

1. **Click derecho en Laragon**
2. **Reiniciar todo**

**¡Listo!** Ahora puedes acceder a:
- `http://tudestino.test`

---

## 🎯 Opción 2: Configuración Manual (Más Control)

### Para múltiples subdominios (API, Admin, Web)

#### Paso 1: Crear Virtual Hosts Manualmente

**Opción A: Usar menú de Laragon**

1. Click derecho en **Laragon**
2. **Apache** → **Sites** → **Add New Site**
3. Nombre: `tudestino.test`
4. Ruta: `C:\laragon\www\tudestino\apps\web`

Repetir para:
- `api.tudestino.test` → `C:\laragon\www\tudestino\apps\api`
- `admin.tudestino.test` → `C:\laragon\www\tudestino\apps\admin`

**Opción B: Editar archivo hosts manualmente**

1. Click derecho en **Laragon** → **Apache** → **httpd-vhosts.conf**
2. Agregar al final:

```apache
# TuDestino - Backend API
<VirtualHost *:80>
    DocumentRoot "C:/laragon/www/tudestino/apps/api"
    ServerName api.tudestino.test
    ServerAlias *.api.tudestino.test
    <Directory "C:/laragon/www/tudestino/apps/api">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# TuDestino - Frontend Web
<VirtualHost *:80>
    DocumentRoot "C:/laragon/www/tudestino/apps/web"
    ServerName tudestino.test
    ServerAlias *.tudestino.test
    <Directory "C:/laragon/www/tudestino/apps/web">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>

# TuDestino - Admin Panel
<VirtualHost *:80>
    DocumentRoot "C:/laragon/www/tudestino/apps/admin"
    ServerName admin.tudestino.test
    ServerAlias *.admin.tudestino.test
    <Directory "C:/laragon/www/tudestino/apps/admin">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Paso 2: Actualizar archivo hosts

1. Click derecho en **Laragon**
2. **Tools** → **Edit Hosts File**
3. Agregar:

```
127.0.0.1    tudestino.test
127.0.0.1    api.tudestino.test
127.0.0.1    admin.tudestino.test
```

4. Guardar

#### Paso 3: Reiniciar Apache

1. Click derecho en **Laragon**
2. **Apache** → **Reload**

---

## 🎨 Opción 3: Usar Proxy Reverso (RECOMENDADO)

Como usas **Vite** (dev servers), la mejor opción es usar Laragon solo como proxy:

### Configuración con Proxy

#### 1. Crear archivo de configuración

**Para API (Node.js en puerto 3000):**

Crear: `C:\laragon\etc\apache2\sites-enabled\api.tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName api.tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    ErrorLog "C:/laragon/www/tudestino/apps/api/error.log"
    CustomLog "C:/laragon/www/tudestino/apps/api/access.log" combined
</VirtualHost>
```

**Para Web (Vite en puerto 5173):**

Crear: `C:\laragon\etc\apache2\sites-enabled\tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:5173/
    ProxyPassReverse / http://localhost:5173/

    # WebSocket para Vite HMR
    ProxyPass /ws ws://localhost:5173/ws
    ProxyPassReverse /ws ws://localhost:5173/ws

    ErrorLog "C:/laragon/www/tudestino/apps/web/error.log"
    CustomLog "C:/laragon/www/tudestino/apps/web/access.log" combined
</VirtualHost>
```

**Para Admin (Vite en puerto 5174):**

Crear: `C:\laragon\etc\apache2\sites-enabled\admin.tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName admin.tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:5174/
    ProxyPassReverse / http://localhost:5174/

    # WebSocket para Vite HMR
    ProxyPass /ws ws://localhost:5174/ws
    ProxyPassReverse /ws ws://localhost:5174/ws

    ErrorLog "C:/laragon/www/tudestino/apps/admin/error.log"
    CustomLog "C:/laragon/www/tudestino/apps/admin/access.log" combined
</VirtualHost>
```

#### 2. Habilitar módulos de proxy en Apache

1. Click derecho en **Laragon**
2. **Apache** → **httpd.conf**
3. Buscar y descomentar (quitar `#`):

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
```

#### 3. Actualizar hosts

Click derecho en Laragon → **Tools** → **Edit Hosts File**

```
127.0.0.1    tudestino.test
127.0.0.1    api.tudestino.test
127.0.0.1    admin.tudestino.test
```

#### 4. Reiniciar Apache

Click derecho en **Laragon** → **Apache** → **Reload**

---

## 🔧 Actualizar Variables de Entorno

### Backend API (.env)

Actualiza `apps/api/.env`:

```env
# Server
PORT=3000
NODE_ENV=development

# URLs con dominios Laragon
WEB_URL=http://tudestino.test
ADMIN_URL=http://admin.tudestino.test
API_URL=http://api.tudestino.test

# CORS
CORS_ORIGIN=http://tudestino.test,http://admin.tudestino.test
```

### Frontend Web (.env)

Actualiza `apps/web/.env`:

```env
VITE_API_URL=http://api.tudestino.test/api
VITE_APP_URL=http://tudestino.test
```

### Admin Panel (.env)

Actualiza `apps/admin/.env`:

```env
VITE_API_URL=http://api.tudestino.test/api
VITE_APP_URL=http://admin.tudestino.test
```

---

## 🧪 Probar que Funciona

### 1. Ejecutar aplicaciones

```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3
npm run dev:admin
```

### 2. Acceder a los dominios

- **API:** http://api.tudestino.test/health
- **Web:** http://tudestino.test
- **Admin:** http://admin.tudestino.test

---

## 📊 Resumen de URLs

| Aplicación | Puerto | URL Local | Laragon Domain |
|------------|--------|-----------|----------------|
| Backend API | 3000 | http://localhost:3000 | http://api.tudestino.test |
| Frontend Web | 5173 | http://localhost:5173 | http://tudestino.test |
| Admin Panel | 5174 | http://localhost:5174 | http://admin.tudestino.test |

---

## 🐛 Solución de Problemas

### No funciona el dominio .test

**Problema:** No resuelve `tudestino.test`

**Solución:**
```bash
# 1. Verificar archivo hosts
# Click derecho Laragon → Tools → Edit Hosts File
# Debe contener: 127.0.0.1 tudestino.test

# 2. Limpiar caché DNS
ipconfig /flushdns

# 3. Reiniciar Apache en Laragon
```

### Error 404 en dominios

**Problema:** Accedo pero da 404

**Solución:**
```bash
# Verificar que los archivos de configuración estén en:
C:\laragon\etc\apache2\sites-enabled\

# Y que Apache esté recargado
Laragon → Apache → Reload
```

### CORS error

**Problema:** Error de CORS desde frontend

**Solución:**

En `apps/api/src/index.js`, actualizar CORS:

```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://tudestino.test',
    'http://admin.tudestino.test',
    'http://api.tudestino.test'
  ],
  credentials: true
}));
```

### WebSocket (HMR) no funciona

**Problema:** Vite hot reload no funciona con proxy

**Solución:**

Ya está incluido en la configuración de proxy:
```apache
ProxyPass /ws ws://localhost:5173/ws
```

Si persiste, usar directamente los puertos (localhost:5173)

---

## ✨ Ventajas de Usar Dominios Laragon

- ✅ **URLs más limpias** (`tudestino.test` vs `localhost:5173`)
- ✅ **Más profesional** en desarrollo
- ✅ **Mejor para demos** a clientes
- ✅ **HTTPS fácil** (Laragon puede generar certificados)
- ✅ **Subdominios organizados** (api, admin, www)
- ✅ **Cookies y CORS** más naturales

---

## 🎯 Recomendación

### Para Desarrollo Diario:
👉 **Usa localhost con puertos** - Más rápido y simple
- http://localhost:3000 (API)
- http://localhost:5173 (Web)
- http://localhost:5174 (Admin)

### Para Demos o Testing Avanzado:
👉 **Usa dominios Laragon con proxy** - Más profesional
- http://api.tudestino.test
- http://tudestino.test
- http://admin.tudestino.test

### Puedes usar ambos simultáneamente 🎉

---

## 📚 Documentación Laragon

- **Virtual Hosts:** https://laragon.org/docs/
- **Pretty URLs:** Ya configuradas automáticamente
- **SSL/HTTPS:** Laragon → Apache → SSL → Create Certificate

---

## ✅ Siguiente Paso

**Opción Simple (ya funciona):**
- Sigue usando localhost (ya configurado)

**Opción Laragon:**
1. Configurar proxy (ver Opción 3)
2. Actualizar .env con dominios
3. Reiniciar Apache
4. ¡Disfrutar de URLs bonitas!

---

**¿Prefieres quedarte con localhost o configurar los dominios .test?**

Ambas opciones funcionan perfectamente. 🚀

Volver a: [LEER_PRIMERO.md](./LEER_PRIMERO.md)
