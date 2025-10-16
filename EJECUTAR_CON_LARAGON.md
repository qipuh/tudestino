# 🚀 Ejecutar TuDestino con Dominios Laragon

## ✅ Forma Más Fácil (Sin proxy)

### Paso 1: Activar Virtual Hosts

1. **Click derecho en Laragon** (icono bandeja)
2. **Preferencias** → **General**
3. ✅ Marcar: **"Auto create virtual hosts"**
4. ✅ Marcar: **"Auto update hosts file"**
5. Click **OK**
6. **Reiniciar Laragon**

### Paso 2: Verificar el Dominio

Abre: **http://tudestino.test**

Deberías ver la página de bienvenida. ✅

---

## 🎯 Para Usar las Aplicaciones

### Opción 1: Acceso Directo (Actual)

Las apps siguen funcionando con localhost + puerto:

```bash
# Terminal 1: Backend
npm run dev:api
→ http://localhost:3000

# Terminal 2: Frontend
npm run dev:web
→ http://localhost:5173

# Terminal 3: Admin
npm run dev:admin
→ http://localhost:5174
```

**Acceder:**
- Backend API: `http://localhost:3000/health`
- Frontend Web: `http://localhost:5173`
- Admin Panel: `http://localhost:5174`

### Opción 2: Con Subdominios Laragon (Avanzado)

Para usar:
- `http://api.tudestino.test`
- `http://tudestino.test` (frontend)
- `http://admin.tudestino.test`

Necesitas configurar **proxy reverso**. Sigue estos pasos:

#### A. Habilitar Módulos de Proxy en Apache

1. **Click derecho Laragon** → **Apache** → **httpd.conf**
2. Buscar estas líneas y **quitar el #** (descomentar):

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
```

3. **Guardar** y cerrar

#### B. Crear Archivos de Virtual Hosts

**Para API:**

Click derecho Laragon → Apache → sites-enabled → Crear nuevo archivo: `api.tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName api.tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

**Para Frontend:**

Crear: `web.tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName web.tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:5173/
    ProxyPassReverse / http://localhost:5173/

    # Para Hot Module Replacement de Vite
    ProxyPass /ws ws://localhost:5173/ws
    ProxyPassReverse /ws ws://localhost:5173/ws
</VirtualHost>
```

**Para Admin:**

Crear: `admin.tudestino.test.conf`

```apache
<VirtualHost *:80>
    ServerName admin.tudestino.test

    ProxyPreserveHost On
    ProxyPass / http://localhost:5174/
    ProxyPassReverse / http://localhost:5174/

    # Para Hot Module Replacement de Vite
    ProxyPass /ws ws://localhost:5174/ws
    ProxyPassReverse /ws ws://localhost:5174/ws
</VirtualHost>
```

#### C. Actualizar Archivo Hosts

Click derecho Laragon → **Tools** → **Edit Hosts File**

Agregar:
```
127.0.0.1    api.tudestino.test
127.0.0.1    web.tudestino.test
127.0.0.1    admin.tudestino.test
```

#### D. Reiniciar Apache

Click derecho Laragon → **Apache** → **Reload**

#### E. Ejecutar Aplicaciones

```bash
npm run dev:api      # Backend
npm run dev:web      # Frontend
npm run dev:admin    # Admin
```

#### F. Acceder con Subdominios

- API: http://api.tudestino.test/health
- Web: http://web.tudestino.test
- Admin: http://admin.tudestino.test

---

## 🎨 Forma SÚPER Rápida (Recomendada)

**No usar subdominios por ahora. Solo verificar que tudestino.test funciona:**

1. Ve a: **http://tudestino.test**
2. Deberías ver la página de bienvenida

**Para las apps, sigue usando localhost:**
- `http://localhost:3000` (API)
- `http://localhost:5173` (Web)
- `http://localhost:5174` (Admin)

Esto funciona perfectamente y es más simple. 🎉

---

## 📊 Resumen de URLs

### Simple (Actual - Recomendado):

| App | URL |
|-----|-----|
| Verificación Laragon | http://tudestino.test |
| Backend API | http://localhost:3000 |
| Frontend Web | http://localhost:5173 |
| Admin Panel | http://localhost:5174 |

### Con Proxy (Avanzado):

| App | URL |
|-----|-----|
| Backend API | http://api.tudestino.test |
| Frontend Web | http://web.tudestino.test |
| Admin Panel | http://admin.tudestino.test |

---

## 🐛 Solución de Problemas

### "tudestino.test" no carga

**Solución:**
```bash
# 1. Verificar que Apache esté corriendo en Laragon
# 2. Verificar archivo hosts
notepad C:\Windows\System32\drivers\etc\hosts
# Debe contener: 127.0.0.1 tudestino.test

# 3. Limpiar caché DNS
ipconfig /flushdns

# 4. Reiniciar navegador
```

### Subdominios no funcionan

**Solución:**
- Verifica que creaste los archivos .conf en sites-enabled
- Verifica que descomentaste los módulos proxy en httpd.conf
- Reinicia Apache en Laragon
- Verifica que las apps estén corriendo (npm run dev:*)

---

## ✅ Comandos para Ejecutar Todo

```bash
# 1. Verificar Laragon
# Abrir: http://tudestino.test

# 2. Ejecutar aplicaciones (3 terminales)

# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3
npm run dev:admin

# 3. Acceder
# API: http://localhost:3000/health
# Web: http://localhost:5173
# Admin: http://localhost:5174
```

---

## 💡 Recomendación Final

**Para empezar:**
👉 Usa localhost (más simple)

**Cuando necesites demos:**
👉 Configura subdominios (más profesional)

**Por ahora:**
✅ Solo verifica que http://tudestino.test funciona
✅ Usa localhost para las apps

---

**¿Listo para ejecutar?**

```bash
npm run dev:api
npm run dev:web
npm run dev:admin
```

Y visita: http://localhost:5173 🚀
