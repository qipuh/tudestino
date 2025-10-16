# 🍃 Guía para Instalar MongoDB

## Opción 2: Usar MongoDB

Si prefieres MongoDB en lugar de MySQL, aquí te muestro cómo instalarlo.

---

## 📥 Instalación de MongoDB

### Opción A: MongoDB en Laragon (Recomendado)

1. **Descargar MongoDB para Laragon**
   - Ir a: https://github.com/leokhoa/laragon/discussions/301
   - O buscar "Laragon MongoDB addon"

2. **Instalar en Laragon**
   - Descargar el archivo ZIP de MongoDB
   - Extraer en `C:\laragon\bin\mongodb\`
   - Reiniciar Laragon
   - Click derecho → MongoDB → Start

### Opción B: MongoDB Community Edition (Standalone)

#### 1. Descargar MongoDB

- Ir a: https://www.mongodb.com/try/download/community
- Seleccionar:
  - **Version:** 7.0.x (última estable)
  - **Platform:** Windows
  - **Package:** MSI

#### 2. Instalar MongoDB

1. Ejecutar el instalador `.msi`
2. Elegir **"Complete"** installation
3. ✅ Marcar **"Install MongoDB as a Service"**
4. ✅ Marcar **"Install MongoDB Compass"** (interfaz gráfica)
5. Click **"Install"**

#### 3. Configurar MongoDB

```bash
# Verificar instalación
mongod --version

# Verificar que el servicio esté corriendo
# Windows: Services → MongoDB Server
# O en CMD:
sc query MongoDB
```

#### 4. Iniciar MongoDB

**Como servicio (automático):**
```bash
# Ya debería estar corriendo
# Verificar en Services (services.msc)
```

**Manual (si no es servicio):**
```bash
# Crear carpeta de datos
mkdir C:\data\db

# Iniciar MongoDB
mongod
```

---

## 🧪 Verificar MongoDB

### Opción 1: Línea de comandos

```bash
# Conectar a MongoDB
mongosh

# Dentro de mongosh
show dbs
exit
```

### Opción 2: MongoDB Compass (GUI)

1. Abrir **MongoDB Compass**
2. Conectar a: `mongodb://localhost:27017`
3. Deberías ver tus bases de datos

---

## 🚀 Usar MongoDB en TuDestino

### Paso 1: Actualizar .env

Edita `apps/api/.env`:

```env
# Descomentar MongoDB y comentar MySQL
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=tudestino
# DB_USER=root
# DB_PASSWORD=

# Database - MongoDB (Activado)
MONGODB_URI=mongodb://localhost:27017/tudestino
```

### Paso 2: Actualizar database.js

El proyecto ya tiene `apps/api/src/config/database.js` configurado para MongoDB.

Solo asegúrate de que tu `src/index.js` use este archivo.

### Paso 3: Ejecutar Seed

```bash
npm run seed --workspace=apps/api
```

Esto creará:
- Base de datos `tudestino`
- Colección `users`
- 3 usuarios de prueba

### Paso 4: Ejecutar Backend

```bash
npm run dev:api
```

---

## 📊 Verificar que Funciona

### MongoDB Compass

1. Abrir MongoDB Compass
2. Conectar a `mongodb://localhost:27017`
3. Ver base de datos `tudestino`
4. Ver colección `users`
5. Ver los 3 documentos (usuarios)

### Línea de comandos

```bash
mongosh

# Dentro de mongosh
use tudestino
show collections
db.users.find().pretty()
```

### API

```bash
curl http://localhost:3000/health

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tudestino.com\",\"password\":\"admin123\"}"
```

---

## 🔄 Cambiar entre MySQL y MongoDB

Ya tienes **ambos** configurados. Para cambiar:

### Para usar MySQL:

1. Edita `apps/api/.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=

# MONGODB_URI=mongodb://localhost:27017/tudestino
```

2. Actualiza `apps/api/src/config/database.js` para usar Sequelize

3. Usa los modelos `-mysql.js`

### Para usar MongoDB:

1. Edita `apps/api/.env`:
```env
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=tudestino
# DB_USER=root
# DB_PASSWORD=

MONGODB_URI=mongodb://localhost:27017/tudestino
```

2. Usa `apps/api/src/config/database.js` (original)

3. Usa los modelos `.model.js` (originales)

---

## 🆚 ¿MySQL o MongoDB?

| Aspecto | MySQL | MongoDB |
|---------|-------|---------|
| **Instalación en Laragon** | ✅ Ya incluido | ❌ Requiere instalación |
| **Curva de aprendizaje** | Media (SQL) | Baja (JSON) |
| **Flexibilidad** | Estructurado | ✅ Muy flexible |
| **Para aprender** | SQL (universal) | NoSQL (moderno) |
| **Para producción** | ✅ Estable | ✅ Escalable |
| **GUI incluida** | ✅ HeidiSQL | MongoDB Compass |

### Recomendaciones:

**Usa MySQL si:**
- Ya conoces SQL
- Usas Laragon (ya está instalado)
- Prefieres estructura rígida
- Quieres empezar rápido

**Usa MongoDB si:**
- Prefieres trabajar con JSON
- Necesitas flexibilidad en esquemas
- Quieres aprender NoSQL
- Tu proyecto es tipo documento

---

## 🐛 Solución de Problemas

### MongoDB no inicia

**Error:** `MongoServerError: connect ECONNREFUSED`

**Soluciones:**
```bash
# 1. Verificar que el servicio esté corriendo
sc query MongoDB

# 2. Iniciar el servicio
net start MongoDB

# 3. O iniciar manualmente
mongod --dbpath C:\data\db
```

### No encuentra mongosh o mongod

**Solución:**
Agregar MongoDB al PATH:

1. Buscar "Environment Variables" en Windows
2. Agregar a PATH: `C:\Program Files\MongoDB\Server\7.0\bin\`
3. Reiniciar terminal

### Port 27017 en uso

**Solución:**
```bash
# Ver qué proceso usa el puerto
netstat -ano | findstr :27017

# Cambiar puerto en .env
MONGODB_URI=mongodb://localhost:27018/tudestino
```

---

## 📝 Comandos Útiles MongoDB

```bash
# Conectar
mongosh

# Listar bases de datos
show dbs

# Usar base de datos
use tudestino

# Ver colecciones
show collections

# Ver documentos
db.users.find()
db.users.find().pretty()

# Contar documentos
db.users.countDocuments()

# Buscar uno
db.users.findOne({email: 'admin@tudestino.com'})

# Borrar todos
db.users.deleteMany({})

# Borrar base de datos
db.dropDatabase()

# Salir
exit
```

---

## 📚 Recursos

- **Instalación:** https://www.mongodb.com/docs/manual/installation/
- **MongoDB Compass:** https://www.mongodb.com/products/compass
- **Mongoose Docs:** https://mongoosejs.com/

---

## ✅ Resumen

**Para Laragon (más fácil):**
→ Usa **MySQL** ([USAR_MYSQL.md](./USAR_MYSQL.md))

**Para aprender NoSQL:**
→ Instala **MongoDB** (esta guía)

**El proyecto soporta ambos**, solo cambia la configuración en `.env`.

---

**¿Listo?** Vuelve a: [LEER_PRIMERO.md](./LEER_PRIMERO.md)
