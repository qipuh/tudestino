# 🚀 EJECUTAR AHORA - Guía Rápida

## ✅ Lo que he arreglado:

1. ✅ Configurado Vite para aceptar subdominios
2. ✅ Removido index.html de prueba
3. ✅ Configurado allowedHosts en web y admin

---

## 🎯 EJECUTAR LAS APLICACIONES (3 pasos)

### **Paso 1: Crear tablas en MySQL (30 segundos)**

```bash
npm run seed:mysql --workspace=apps/api
```

**Deberías ver:**
```
✅ Conectado a MySQL
✅ Tablas creadas/actualizadas
✅ Usuarios de prueba creados:
   - admin@tudestino.com / admin123 (Admin)
   - host@tudestino.com / host123 (Host)
   - guest@tudestino.com / guest123 (Guest)
```

### **Paso 2: Ejecutar Backend API**

**Terminal 1:**
```bash
npm run dev:api
```

**Espera ver:**
```
✅ MySQL Connected successfully
✅ Database models synchronized
🚀 Server running on port 3000
```

### **Paso 3: Ejecutar Frontend y Admin**

**Terminal 2:**
```bash
npm run dev:web
```

**Terminal 3:**
```bash
npm run dev:admin
```

---

## 🌐 ABRIR EN NAVEGADOR

Una vez las 3 terminales estén corriendo:

### **Con subdominios (URLs limpias):**
- ✅ **Frontend:** http://tudestino.test
- ✅ **Admin:** http://admin.tudestino.test
- ✅ **API:** http://api.tudestino.test/health

### **Con localhost (alternativa):**
- ✅ **Frontend:** http://localhost:5173
- ✅ **Admin:** http://localhost:5174
- ✅ **API:** http://localhost:3000/health

---

## 📊 QUÉ VERÁS

### **http://tudestino.test** (Frontend Web)
Deberías ver:
- Header con logo "TuDestino"
- Barra de búsqueda
- Sección "Encuentra tu próximo destino"
- Card de ejemplo de propiedad
- Footer

### **http://admin.tudestino.test** (Panel Admin)
Deberías ver:
- Sidebar oscuro con menú
- Dashboard con 4 tarjetas de estadísticas:
  - Total Usuarios: 1,234
  - Propiedades: 567
  - Reservas Activas: 89
  - Ingresos Mes: $12,345
- Sección "Actividad Reciente"

### **http://api.tudestino.test/health** (API)
Deberías ver:
```json
{
  "status": "OK",
  "timestamp": "2025-10-07T..."
}
```

---

## 🐛 Si Algo No Funciona

### Error: "Cannot connect to database"

**Causa:** MySQL no está corriendo o base de datos no existe

**Solución:**
```bash
# 1. Verificar MySQL en Laragon (debe estar verde)
# 2. Abrir HeidiSQL y verificar que existe 'tudestino'
# 3. Ejecutar seed de nuevo
npm run seed:mysql --workspace=apps/api
```

### Error: "host not allowed" en Vite

**Causa:** Ya lo arreglé en vite.config.js

**Solución:**
```bash
# Si las apps ya estaban corriendo, reiniciarlas
# Ctrl+C en cada terminal
# Ejecutar de nuevo: npm run dev:web y npm run dev:admin
```

### Error: "Service Unavailable" en API

**Causa:** Backend no está corriendo

**Solución:**
```bash
# Ejecutar en Terminal 1
npm run dev:api
```

### Página en blanco

**Causa:** La app de Vite no está corriendo

**Solución:**
```bash
# Verificar que las 3 terminales estén activas
# Terminal 1: npm run dev:api (debe mostrar "Server running")
# Terminal 2: npm run dev:web (debe mostrar "Local: http://localhost:5173/")
# Terminal 3: npm run dev:admin (debe mostrar "Local: http://localhost:5174/")
```

---

## ✅ Checklist de Verificación

Antes de abrir el navegador, verifica:

- [ ] MySQL corriendo en Laragon (icono verde)
- [ ] Base de datos `tudestino` existe en HeidiSQL
- [ ] Seed ejecutado sin errores
- [ ] Terminal 1: Backend corriendo (puerto 3000)
- [ ] Terminal 2: Web corriendo (puerto 5173)
- [ ] Terminal 3: Admin corriendo (puerto 5174)
- [ ] Archivo hosts tiene api.tudestino.test y admin.tudestino.test
- [ ] Apache recargado en Laragon

---

## 🎯 Comandos Rápidos (Copy-Paste)

```bash
# En orden:

# 1. Seed (crear tablas)
npm run seed:mysql --workspace=apps/api

# 2. Backend API (Terminal 1)
npm run dev:api

# 3. Frontend Web (Terminal 2)
npm run dev:web

# 4. Admin Panel (Terminal 3)
npm run dev:admin
```

Luego abre:
- http://tudestino.test
- http://admin.tudestino.test
- http://api.tudestino.test/health

---

## 💡 Respuesta a tu Pregunta

> "se supone que en web debería ver el home? o que?"

**SÍ**, deberías ver el **Home del frontend React**, NO el index.html de prueba.

**Lo que debes ver en http://tudestino.test:**
```
┌─────────────────────────────────────────┐
│  Header: TuDestino + barra de búsqueda │
├─────────────────────────────────────────┤
│  Título: "Encuentra tu próximo destino"│
│                                         │
│  [Card de Apartamento moderno]         │
│  Madrid, España                        │
│  $80 / noche                           │
├─────────────────────────────────────────┤
│  Footer con links                      │
└─────────────────────────────────────────┘
```

Si ves esto, ¡está funcionando! ✅

---

## 🚀 ¡AHORA SÍ! Ejecuta:

```bash
# 1. Crear tablas
npm run seed:mysql --workspace=apps/api

# 2. Ejecutar apps (3 terminales)
npm run dev:api
npm run dev:web
npm run dev:admin

# 3. Abrir navegador
http://tudestino.test
```

---

**¿Listo? ¡Ejecuta los comandos y cuéntame qué ves!** 🎉
