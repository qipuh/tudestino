# 🔴 SOLUCIÓN INMEDIATA - ERROR DE RED

## ❌ Problema
- Aparece "Network Error"
- No se ven las reservas
- Socket.IO falla

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### 1️⃣ Detener todo
Si tienes algo corriendo, presiona `Ctrl+C` en todas las terminales

### 2️⃣ Iniciar el BACKEND (MUY IMPORTANTE)
```bash
npm run dev:api
```

**DEBES VER ESTO:**
```
🚀 Server running on port 3000
📡 API disponible en http://localhost:3000
🏥 Health check: http://localhost:3000/health
```

### 3️⃣ Iniciar el FRONTEND (en OTRA terminal)
```bash
npm run dev:web
```

**DEBES VER ESTO:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

---

## 🧪 Verificar que funciona

### Paso 1: Verificar API
Abre: http://localhost:3000/health

**Debe mostrar:**
```json
{"status":"OK","timestamp":"..."}
```

### Paso 2: Verificar Frontend
Abre: http://localhost:5173

**Debe cargar la página sin errores**

### Paso 3: Verificar Reservas
Abre: http://localhost:5173/bookings

**Debe mostrar tus reservas**

---

## ⚠️ NOTA IMPORTANTE SOBRE SOCKET.IO

Socket.IO está **TEMPORALMENTE DESHABILITADO** para evitar errores.

**Esto significa:**
- ✅ Las reservas funcionan PERFECTAMENTE
- ✅ El chat funciona (pero sin tiempo real)
- ❌ Los mensajes NO aparecen automáticamente (hay que recargar)

**Para habilitar Socket.IO más tarde:**
1. Asegúrate de que el backend esté corriendo sin errores
2. Descomenta las líneas en `apps/api/src/index.js`
3. Reinicia el backend

---

## 🆘 Si sigue sin funcionar

### Error: "Cannot GET /"
**Problema:** El backend no está corriendo
**Solución:** Ejecuta `npm run dev:api`

### Error: "Network Error"
**Problema:** El backend no responde
**Solución:**
1. Verifica que el backend esté corriendo
2. Abre http://localhost:3000/health
3. Si no carga, reinicia el backend

### Error: Puerto ocupado
```bash
# En Windows PowerShell o CMD
netstat -ano | findstr :3000
# Anota el PID (última columna)
taskkill /PID <número> /F
# Luego reinicia
npm run dev:api
```

---

## ✨ TODO FUNCIONANDO

Si hiciste los pasos correctos:
- ✅ Backend en http://localhost:3000
- ✅ Frontend en http://localhost:5173
- ✅ Reservas visibles
- ✅ Chat funcional (sin tiempo real)
- ✅ Detalles de reservas funcionando

---

## 📝 Comandos de Emergencia

### Ver qué está corriendo en los puertos
```bash
# Puerto 3000 (API)
netstat -ano | findstr :3000

# Puerto 5173 (Web)
netstat -ano | findstr :5173
```

### Matar proceso por PID
```bash
taskkill /PID <número> /F
```

### Reiniciar TODO desde cero
```bash
# Terminal 1
npm run dev:api

# Terminal 2 (espera a que el API esté listo)
npm run dev:web
```

---

**🎯 OBJETIVO: Ver las reservas funcionando**

Si después de seguir estos pasos TODAVÍA no funciona:
1. Cierra TODAS las terminales
2. Cierra el navegador
3. Abre una terminal NUEVA
4. Ejecuta `npm run dev:api`
5. Espera 10 segundos
6. Abre OTRA terminal NUEVA
7. Ejecuta `npm run dev:web`
8. Abre el navegador en http://localhost:5173/bookings
