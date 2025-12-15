# 🚀 Ejecutar Proyecto en Local

## ⚡ Inicio Rápido (3 comandos)

### 1️⃣ Iniciar Base de Datos (MySQL con Laragon)

Ya tienes Laragon instalado, solo asegúrate que esté corriendo:

```bash
# Abre Laragon y presiona "Start All"
# O verifica que MySQL esté corriendo:
netstat -ano | findstr :3306
```

### 2️⃣ Iniciar Backend (API)

Abre una terminal en VS Code y ejecuta:

```bash
cd apps/api
npm run dev
```

Verás:
```
✅ Database connected (MySQL)
✅ Model associations configured (including Business module)
🚀 Server running on port 3000
```

### 3️⃣ Iniciar Frontend (Web)

Abre **OTRA** terminal (nueva pestaña) y ejecuta:

```bash
cd apps/web
npm run dev
```

Verás:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

---

## ✅ Verificar que Todo Funciona

### 1. Backend (API)
Abre en tu navegador o usa curl:
```bash
curl http://localhost:3000/health
```

Debe responder:
```json
{
  "status": "OK",
  "timestamp": "2024-..."
}
```

### 2. Frontend (Web)
Abre en tu navegador:
```
http://localhost:5173
```

Deberías ver la página principal de TuDestino.

### 3. Base de Datos
```bash
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "USE tudestino; SHOW TABLES;"
```

Deberías ver todas las tablas, incluyendo:
- `businesses`
- `business_services`
- `business_social_posts`
- `business_follows`
- `users`
- etc.

---

## 🧪 Probar el Módulo de Negocios

### Paso 1: Registrarse como Business Owner

1. Abre: http://localhost:5173/register
2. Click en **"Soy dueño de negocio"** 🏢
3. Completa el formulario:
   - Nombre: Tu Nombre
   - Email: tu@email.com
   - Password: password123
   - Teléfono: +51 999 999 999
4. Click "Crear cuenta"
5. ✅ Te redirigirá a: http://localhost:5173/business/dashboard

### Paso 2: Crear Tu Primer Negocio

1. En el dashboard vacío, click **"Crear Mi Primer Negocio"**
2. **Paso 1: Información básica**
   - Nombre: Hotel Paradise Cajamarca
   - Slug: hotel-paradise-cajamarca (se auto-genera)
   - Tipo: 🏨 Hotel / Alojamiento
   - Descripción: Hotel de lujo en el corazón de Cajamarca
3. Click "Siguiente"
4. **Paso 2: Ubicación**
   - Dirección: Jr. Amazonas 123
   - Ciudad: Cajamarca
   - País: Perú
   - Latitud: -7.1619
   - Longitud: -78.5128
5. Click "Siguiente"
6. **Paso 3: Contacto**
   - Teléfono: +51 976 123 456
   - Email: info@hotelparadise.com
   - Web: https://hotelparadise.com
7. Click **"Crear Negocio"**
8. ✅ Te redirigirá a la página de detalle del negocio

### Paso 3: Agregar Servicios

1. En la página de detalle, click **"Gestionar Servicios"**
2. Click **"Agregar Primer Servicio"**
3. En el modal:
   - Tipo: 🏠 Propiedad / Habitación
   - Nombre: Habitación Doble Superior
   - Descripción: Habitación con vista al mar, cama king size
   - Estado: Activo
   - Configuración JSON:
     ```json
     {
       "price": 150,
       "capacity": 2,
       "amenities": ["wifi", "tv", "minibar", "aire_acondicionado"],
       "bedType": "king"
     }
     ```
4. Click **"Crear Servicio"**
5. ✅ Verás el servicio en la lista

### Paso 4: Explorar

- Vuelve al dashboard: http://localhost:5173/business/dashboard
- Verás tu negocio en la lista
- Verás estadísticas: 1 negocio, 1 activo, 1 servicio
- Puedes crear más servicios o más negocios

---

## 🛠️ Comandos Útiles

### Ver logs del backend
```bash
# Si iniciaste con npm run dev, ya ves los logs
# Para ver solo errores:
cd apps/api
npm run dev 2>&1 | findstr /i "error"
```

### Reiniciar backend
```powershell
# Presiona Ctrl+C en la terminal del backend
# Luego:
npm run dev
```

### Reiniciar frontend
```powershell
# Presiona Ctrl+C en la terminal del frontend
# Luego:
npm run dev
```

### Verificar que los puertos estén libres
```bash
# Puerto 3000 (backend)
netstat -ano | findstr :3000

# Puerto 5173 (frontend)
netstat -ano | findstr :5173
```

### Matar procesos si están ocupados
```powershell
# Matar todo node.exe
taskkill /F /IM node.exe

# O específico por puerto
# 1. Ver PID:
netstat -ano | findstr :3000
# 2. Matar ese PID:
taskkill /F /PID [número]
```

---

## 📊 Ver Datos en MySQL

### Desde terminal
```bash
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root tudestino
```

Luego en MySQL:
```sql
-- Ver negocios
SELECT id, name, slug, businessType, status FROM businesses;

-- Ver servicios
SELECT id, businessId, serviceType, name, status FROM business_services;

-- Ver usuario business_owner
SELECT id, name, email, role FROM users WHERE role = 'business_owner';
```

### Desde HeidiSQL o MySQL Workbench
1. Abre HeidiSQL (viene con Laragon)
2. Conecta a:
   - Host: localhost
   - Puerto: 3306
   - Usuario: root
   - Password: (vacío)
3. Selecciona base de datos: `tudestino`
4. Explora las tablas

---

## 🔧 Solución de Problemas

### ❌ Error: "Cannot find module"
```bash
# Instalar dependencias
cd apps/api
npm install

cd ../web
npm install
```

### ❌ Error: "Port 3000 already in use"
```bash
# Matar proceso que usa el puerto
netstat -ano | findstr :3000
taskkill /F /PID [número_que_aparece]

# O matar todos los node
taskkill /F /IM node.exe
```

### ❌ Error: "Database connection failed"
```bash
# Verificar que MySQL esté corriendo en Laragon
# Abrir Laragon → Start All

# Verificar conexión
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "SELECT 1;"
```

### ❌ Error: "CORS" en el navegador
Verifica que en `apps/web/vite.config.js` esté el proxy:
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

### ❌ Error: "401 Unauthorized" al crear negocio
1. Asegúrate de estar logueado
2. Verifica que el token esté en localStorage:
   - Abre DevTools (F12)
   - Application → Local Storage → http://localhost:5173
   - Debe haber una key `token`
3. Si no hay token, vuelve a hacer login

### ❌ La página está en blanco
1. Abre DevTools (F12) → Console
2. Busca errores en rojo
3. Usualmente es un import incorrecto o componente que falta

---

## 📝 Scripts Disponibles

### Backend (apps/api)
```json
{
  "dev": "nodemon src/index.js",
  "start": "node src/index.js"
}
```

### Frontend (apps/web)
```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}
```

---

## 🌐 URLs Importantes

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Frontend | http://localhost:5173 | Aplicación web |
| Backend | http://localhost:3000 | API REST |
| Health Check | http://localhost:3000/health | Verificar API |
| Registro | http://localhost:5173/register | Crear cuenta |
| Login | http://localhost:5173/login | Iniciar sesión |
| Dashboard Negocios | http://localhost:5173/business/dashboard | Panel de negocios |
| Crear Negocio | http://localhost:5173/business/create | Nuevo negocio |

---

## 📸 Cómo Debería Verse

### 1. Terminal Backend
```
> npm run dev

[nodemon] starting `node src/index.js`
✅ Database connected (MySQL)
✅ Model associations configured (including Business module)
🚀 Server running on port 3000
```

### 2. Terminal Frontend
```
> npm run dev

  VITE v5.4.2  ready in 523 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.5:5173/
  ➜  press h + enter to show help
```

### 3. Navegador (http://localhost:5173)
- Navbar superior con logo "TuDestino"
- Hero section con búsqueda
- Botones: Login / Register

### 4. Dashboard de Negocios (después de registrarse)
- Header: "Mis Negocios"
- Botón verde: "+ Crear Negocio"
- Si está vacío: icono 🏢 grande con mensaje

---

## ✅ Checklist de Inicio

- [ ] Laragon iniciado (MySQL corriendo)
- [ ] Terminal 1: `cd apps/api && npm run dev` (puerto 3000)
- [ ] Terminal 2: `cd apps/web && npm run dev` (puerto 5173)
- [ ] Backend responde en http://localhost:3000/health
- [ ] Frontend carga en http://localhost:5173
- [ ] Registrarse como business_owner
- [ ] Crear primer negocio
- [ ] Agregar primer servicio

---

## 🎯 Flujo Completo de Prueba (5 minutos)

```bash
# 1. Iniciar servicios (2 terminales)
Terminal 1: cd apps/api && npm run dev
Terminal 2: cd apps/web && npm run dev

# 2. Abrir navegador
http://localhost:5173/register

# 3. Registrarse
- Seleccionar "Soy dueño de negocio" 🏢
- Completar formulario
- Submit

# 4. Crear negocio (ya redirigido a dashboard)
- Click "Crear Mi Primer Negocio"
- Completar 3 pasos
- Submit

# 5. Agregar servicio (ya redirigido a detalle)
- Click "Gestionar Servicios"
- Click "Agregar Servicio"
- Completar modal
- Submit

# 6. ¡Listo! 🎉
- Volver a dashboard
- Ver tu negocio y estadísticas
```

---

## 🚀 ¡A Probar!

**Comandos mínimos para empezar:**

```bash
# Terminal 1 (Backend)
cd apps/api
npm run dev

# Terminal 2 (Frontend) - NUEVA TERMINAL
cd apps/web
npm run dev

# Navegador
http://localhost:5173
```

**¡Disfruta probando el módulo de negocios!** 🎉
