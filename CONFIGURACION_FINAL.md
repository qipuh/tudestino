# ✅ Configuración Final - Subdominios Listos

## 🎉 ¡Ya Casi Está Todo Configurado!

He creado los archivos de configuración para que uses:
- ✅ `http://tudestino.test` → Frontend Web
- ✅ `http://admin.tudestino.test` → Admin Panel
- ✅ `http://api.tudestino.test` → Backend API

---

## 🔧 Pasos Finales (2 minutos)

### **Paso 1: Agregar Subdominios al Archivo Hosts**

1. **Click derecho en Laragon**
2. **Tools** → **Edit Hosts File**
3. **Agregar estas líneas al final:**

```
127.0.0.1    api.tudestino.test
127.0.0.1    admin.tudestino.test
```

4. **Guardar** (Ctrl+S) y cerrar

### **Paso 2: Habilitar Módulos Proxy en Apache**

1. **Click derecho en Laragon**
2. **Apache** → **httpd.conf**
3. Buscar (Ctrl+F) estas líneas y **quitar el #** si lo tienen:

```apache
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
```

4. **Guardar** (Ctrl+S) y cerrar

### **Paso 3: Reiniciar Apache**

1. **Click derecho en Laragon**
2. **Apache** → **Reload**

---

## 🚀 Ejecutar las Aplicaciones

### **Paso 4: Crear las Tablas en MySQL**

```bash
npm run seed:mysql --workspace=apps/api
```

Deberías ver:
```
✅ Conectado a MySQL
✅ Tablas creadas/actualizadas
✅ Usuarios de prueba creados:
   - admin@tudestino.com / admin123 (Admin)
   - host@tudestino.com / host123 (Host)
   - guest@tudestino.com / guest123 (Guest)
```

### **Paso 5: Ejecutar las 3 Aplicaciones**

Abre **3 terminales** (o 3 CMD):

**Terminal 1 - Backend API:**
```bash
cd c:\laragon\www\tudestino
npm run dev:api
```

**Terminal 2 - Frontend Web:**
```bash
cd c:\laragon\www\tudestino
npm run dev:web
```

**Terminal 3 - Admin Panel:**
```bash
cd c:\laragon\www\tudestino
npm run dev:admin
```

---

## 🌐 Acceder a las Aplicaciones

Una vez las 3 terminales estén corriendo, abre en tu navegador:

### **Con Subdominios (Recomendado):**
- ✅ **Frontend Web:** http://tudestino.test
- ✅ **Admin Panel:** http://admin.tudestino.test
- ✅ **Backend API:** http://api.tudestino.test/health

### **Con Localhost (Alternativa):**
- ✅ **Frontend Web:** http://localhost:5173
- ✅ **Admin Panel:** http://localhost:5174
- ✅ **Backend API:** http://localhost:3000/health

**Ambas formas funcionarán!** 🎉

---

## 🔐 Usuarios de Prueba

Después de ejecutar el seed, puedes hacer login con:

| Email | Password | Rol |
|-------|----------|-----|
| admin@tudestino.com | admin123 | Administrador |
| host@tudestino.com | host123 | Anfitrión |
| guest@tudestino.com | guest123 | Huésped |

---

## 📊 Resumen de URLs Finales

| Aplicación | Con Subdominio | Con Localhost |
|------------|----------------|---------------|
| **Frontend Web** | http://tudestino.test | http://localhost:5173 |
| **Admin Panel** | http://admin.tudestino.test | http://localhost:5174 |
| **Backend API** | http://api.tudestino.test | http://localhost:3000 |
| **API Health** | http://api.tudestino.test/health | http://localhost:3000/health |

---

## ✨ Con HTTPS (Opcional)

Laragon ya tiene certificados SSL configurados. Solo usa:

- https://tudestino.test
- https://admin.tudestino.test
- https://api.tudestino.test

**Nota:** El navegador mostrará advertencia de "No seguro" porque es un certificado autofirmado. Solo dale "Avanzado" → "Continuar".

---

## 🐛 Solución de Problemas

### Error "Cannot connect to database"

**Solución:**
1. Verifica que MySQL esté corriendo en Laragon
2. Verifica que existe la base de datos `tudestino` en HeidiSQL
3. Ejecuta el seed: `npm run seed:mysql --workspace=apps/api`

### Subdominios no cargan

**Solución:**
```bash
# Limpiar caché DNS
ipconfig /flushdns

# Verificar archivo hosts
notepad C:\Windows\System32\drivers\etc\hosts
```

Debe contener:
```
127.0.0.1    tudestino.test
127.0.0.1    api.tudestino.test
127.0.0.1    admin.tudestino.test
```

### Error de CORS

**Solución:** Ya está configurado en `apps/api/.env`:
```env
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://tudestino.test,http://admin.tudestino.test
```

---

## ✅ Checklist Final

- [ ] Archivo hosts actualizado (api.tudestino.test, admin.tudestino.test)
- [ ] Módulos proxy habilitados en httpd.conf
- [ ] Apache reiniciado
- [ ] MySQL corriendo en Laragon
- [ ] Base de datos `tudestino` creada
- [ ] Seed ejecutado (`npm run seed:mysql`)
- [ ] 3 terminales con las apps corriendo
- [ ] Navegador abierto en http://tudestino.test

---

## 🎯 Siguiente Paso

```bash
# 1. Ejecutar seed (crear tablas)
npm run seed:mysql --workspace=apps/api

# 2. Ejecutar apps (3 terminales)
npm run dev:api
npm run dev:web
npm run dev:admin

# 3. Abrir navegador
http://tudestino.test
http://admin.tudestino.test
http://api.tudestino.test/health
```

---

**¿Todo listo?** ¡Ejecuta los comandos y disfruta de tus subdominios! 🚀
