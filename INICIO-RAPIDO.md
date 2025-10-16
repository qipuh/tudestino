# 🚀 INICIO RÁPIDO - TuDestino

## ⚡ Pasos para iniciar la aplicación

### 1️⃣ Iniciar el Backend (API)
Abre una terminal en la raíz del proyecto y ejecuta:

```bash
npm run dev:api
```

**Deberías ver:**
```
🚀 Server running on port 3000
🔌 Socket.IO initialized
```

### 2️⃣ Iniciar el Frontend (Web)
Abre OTRA terminal (nueva) y ejecuta:

```bash
npm run dev:web
```

**Deberías ver:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 3️⃣ Abrir en el navegador
- Web: http://localhost:5173
- API Health: http://localhost:3000/health

---

## 🔧 Si hay errores

### Error: "Socket.IO no disponible"
- **Causa:** El backend no está corriendo
- **Solución:** Inicia el backend con `npm run dev:api`
- **Nota:** El chat en tiempo real necesita Socket.IO, pero las reservas funcionan sin él

### Error: "Network Error" en reservas
- **Causa:** El backend no está corriendo
- **Solución:** Inicia el backend con `npm run dev:api`

### Puerto 3000 ocupado
```bash
# Windows (CMD o PowerShell)
netstat -ano | findstr :3000
taskkill /PID <número_pid> /F

# Luego reinicia el backend
npm run dev:api
```

---

## 📋 Comandos útiles

### Desarrollo
```bash
npm run dev              # Inicia API + Web + Admin
npm run dev:api          # Solo API
npm run dev:web          # Solo Web
npm run dev:admin        # Solo Admin
```

### Base de datos
```bash
npm run seed:mysql       # Crear tablas (primera vez)
```

### Build
```bash
npm run build:api        # Compilar API
npm run build:web        # Compilar Web
```

---

## ✅ Checklist de inicio

- [ ] MySQL está corriendo (Laragon)
- [ ] Base de datos `tudestino` creada
- [ ] Tablas creadas (`npm run seed:mysql`)
- [ ] Backend corriendo en puerto 3000
- [ ] Frontend corriendo en puerto 5173
- [ ] No hay errores en la consola del navegador

---

## 🎯 URLs importantes

- **Web App:** http://localhost:5173
- **API:** http://localhost:3000
- **Health Check:** http://localhost:3000/health
- **Reservas:** http://localhost:5173/bookings
- **Chat:** http://localhost:5173/messages
- **Propiedades (Host):** http://localhost:5173/host/properties

---

## 🆘 Ayuda adicional

### Ver logs del backend
El backend muestra logs en la terminal donde ejecutaste `npm run dev:api`

### Ver errores del frontend
Abre DevTools del navegador (F12) y ve a la pestaña "Console"

### Reiniciar todo
1. Ctrl+C en ambas terminales (API y Web)
2. Ejecuta `npm run dev:api`
3. Ejecuta `npm run dev:web`

---

**¡Listo! Ya puedes usar la aplicación** 🎉
