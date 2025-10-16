# 🚀 Ejecutar Todo en UNA SOLA Terminal

## ✅ NUEVA FORMA: Un Solo Comando

Ahora puedes ejecutar **las 3 aplicaciones con un solo comando**:

```bash
npm run dev
```

Esto ejecutará simultáneamente:
- ✅ Backend API (puerto 3000)
- ✅ Frontend Web (puerto 5173)
- ✅ Admin Panel (puerto 5174)

**Con colores diferentes** para cada app:
- 🔵 API (azul)
- 🟣 WEB (magenta)
- 🟢 ADMIN (verde)

---

## 🎯 Cómo Usar

### **Paso 1: Crear tablas (solo primera vez)**

```bash
npm run seed:mysql
```

### **Paso 2: Ejecutar TODO**

```bash
npm run dev
```

**¡ESO ES TODO!** 🎉

---

## 📊 Lo que verás en la Terminal

```
[API] ✅ MySQL Connected successfully
[API] 🚀 Server running on port 3000
[WEB] VITE v5.x ready in xxx ms
[WEB] ➜  Local:   http://localhost:5173/
[ADMIN] VITE v5.x ready in xxx ms
[ADMIN] ➜  Local:   http://localhost:5174/
```

Todos los logs estarán en **la misma terminal**, con colores diferentes.

---

## 🌐 Acceder a las Apps

Una vez todo esté corriendo, abre:

- **Frontend Web:** http://tudestino.test
- **Admin Panel:** http://admin.tudestino.test
- **Backend API:** http://api.tudestino.test/health

O con localhost:
- http://localhost:5173 (Web)
- http://localhost:5174 (Admin)
- http://localhost:3000 (API)

---

## ⏹️ Detener Todo

Para detener todas las apps:

```bash
Ctrl + C
```

Se detendrán las 3 aplicaciones al mismo tiempo.

---

## 🔄 Otras Opciones

### Opción 1: Script único (Actual - Recomendado)
```bash
npm run dev
```
✅ Más fácil
✅ Una sola terminal
✅ Con colores
✅ Fácil de detener (Ctrl+C)

### Opción 2: 3 Terminales separadas
```bash
# Terminal 1
npm run dev:api

# Terminal 2
npm run dev:web

# Terminal 3
npm run dev:admin
```
✅ Logs separados por terminal
✅ Puedes reiniciar apps individualmente
❌ Más complicado

### Opción 3: Solo una app específica
```bash
npm run dev:api    # Solo backend
npm run dev:web    # Solo frontend
npm run dev:admin  # Solo admin
```

---

## 💡 Ventajas del Script Único

1. ✅ **Más rápido** - Un solo comando
2. ✅ **Más simple** - No necesitas 3 ventanas
3. ✅ **Con colores** - Fácil identificar qué app genera cada log
4. ✅ **Auto-restart** - Si una app falla, las otras siguen
5. ✅ **Detener todo** - Un solo Ctrl+C

---

## 🐛 Solución de Problemas

### Error: "Cannot find module 'concurrently'"

**Solución:**
```bash
npm install
```

### Quiero ver solo los logs de una app

**Solución:** Usa las 3 terminales separadas (Opción 2)

### Una app no inicia

**Verifica en los logs con colores:**
- 🔵 **[API]** - Verifica MySQL corriendo
- 🟣 **[WEB]** - Verifica puerto 5173 libre
- 🟢 **[ADMIN]** - Verifica puerto 5174 libre

### Quiero reiniciar solo una app

**Solución:**
1. Detén todo (Ctrl+C)
2. Ejecuta la app individual: `npm run dev:api`
3. O reinicia todo: `npm run dev`

---

## 📋 Resumen de Comandos

```bash
# Primera vez - crear tablas
npm run seed:mysql

# Ejecutar TODO (desarrollo)
npm run dev

# Detener TODO
Ctrl + C

# Ejecutar apps individuales (si lo necesitas)
npm run dev:api
npm run dev:web
npm run dev:admin
```

---

## ✨ Workflow Diario Recomendado

```bash
# 1. Al empezar el día
npm run dev

# 2. Desarrollar normalmente
# (las 3 apps se actualizan automáticamente - hot reload)

# 3. Al terminar
Ctrl + C
```

---

## 🎯 Respuesta a tu Pregunta

> "¿No se puede ejecutar en una sola terminal?"

**✅ SÍ**, ahora ejecuta:

```bash
npm run dev
```

Y verás las 3 apps corriendo en una sola terminal con colores.

---

## 🚀 ¡PRUÉBALO AHORA!

```bash
# Si ya ejecutaste el seed antes, solo:
npm run dev

# Si es primera vez:
npm run seed:mysql
npm run dev
```

Luego abre:
- http://tudestino.test
- http://admin.tudestino.test
- http://api.tudestino.test/health

---

**¡Mucho más fácil!** 🎉
