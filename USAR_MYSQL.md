# 🐬 Guía para Usar MySQL en TuDestino

## ✅ MySQL Ya Está Listo con Laragon

Si usas **Laragon**, ¡ya tienes MySQL instalado! Solo necesitas activarlo.

---

## 🚀 Opción 1: Usar MySQL (Recomendado para Laragon)

### Paso 1: Iniciar MySQL en Laragon

1. **Abrir Laragon**
2. **Click derecho** en el icono de Laragon en la bandeja del sistema
3. Seleccionar **"MySQL"** → **"Start"**
4. O simplemente click en **"Start All"** para iniciar todo

### Paso 2: Crear la Base de Datos

**Opción A: Usar HeidiSQL (Interfaz Gráfica)**

1. En Laragon, click derecho → **"Database"** → **"Open"**
2. Se abrirá **HeidiSQL**
3. Click derecho en la conexión → **"Create new"** → **"Database"**
4. Nombre: `tudestino`
5. Click **"OK"**

**Opción B: Usar línea de comandos**

```bash
# En Laragon Terminal
mysql -u root -p

# Dentro de MySQL (sin password, solo Enter)
CREATE DATABASE tudestino;
EXIT;
```

### Paso 3: Ejecutar el Seed

```bash
# En la raíz del proyecto
npm run seed:mysql --workspace=apps/api
```

Esto creará:
- ✅ Tabla `users`
- ✅ 3 usuarios de prueba

**Usuarios creados:**
- admin@tudestino.com / admin123 (Admin)
- host@tudestino.com / host123 (Host)
- guest@tudestino.com / guest123 (Guest)

### Paso 4: Ejecutar el Backend

```bash
npm run dev:api
```

El servidor iniciará en: http://localhost:3000

---

## 📊 Verificar que MySQL Funciona

### Ver tablas creadas

**En HeidiSQL:**
1. Abrir HeidiSQL desde Laragon
2. Seleccionar base de datos `tudestino`
3. Ver la tabla `users`

**En línea de comandos:**
```bash
mysql -u root -p tudestino

# Dentro de MySQL
SHOW TABLES;
SELECT * FROM users;
```

### Probar el API

```bash
# Health check
curl http://localhost:3000/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@tudestino.com\",\"password\":\"admin123\"}"
```

---

## 🔧 Configuración Actual

El archivo `.env` ya está configurado para MySQL:

```env
# Database - MySQL (Laragon)
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=
```

**Nota:** En Laragon, el usuario `root` no tiene contraseña por defecto.

---

## 📋 Modelos Creados (MySQL)

He creado versiones MySQL de los modelos principales:

### ✅ User Model
- **Archivo:** `apps/api/src/modules/users/user.model-mysql.js`
- **Tabla:** `users`
- **Campos:** name, email, password, role, phone, avatar, etc.

### ✅ Property Model
- **Archivo:** `apps/api/src/modules/properties/property.model-mysql.js`
- **Tabla:** `properties`
- **Campos:** title, description, type, location, pricing, capacity, etc.

### ✅ Database Config
- **Archivo:** `apps/api/src/config/database-mysql.js`
- **ORM:** Sequelize
- **Driver:** mysql2

---

## 🔄 Migración a MySQL (Pasos Completados)

✅ **Instalado:**
- Sequelize (ORM para Node.js)
- mysql2 (Driver MySQL)

✅ **Creado:**
- Configuración de base de datos MySQL
- Modelos User y Property con Sequelize
- Script de seed para MySQL
- Archivo .env actualizado

✅ **Scripts Disponibles:**
```bash
npm run seed:mysql --workspace=apps/api  # Crear usuarios de prueba
npm run dev:api                          # Ejecutar backend
```

---

## 🆚 MongoDB vs MySQL

| Característica | MongoDB | MySQL |
|----------------|---------|-------|
| **Instalación en Laragon** | ❌ No incluido | ✅ Incluido |
| **Interfaz Gráfica** | ❌ Necesita Compass | ✅ HeidiSQL incluido |
| **Facilidad de uso** | Media | ✅ Alta |
| **Estructura** | NoSQL (documentos) | SQL (tablas) |
| **Flexibilidad** | ✅ Alta | Media |

**Recomendación:** Si usas Laragon, **MySQL es más fácil** porque ya está instalado.

---

## 📝 Comandos Útiles

### MySQL en Laragon

```bash
# Iniciar MySQL
# En Laragon: Start All

# Conectar a MySQL
mysql -u root -p
# (presiona Enter, sin password)

# Crear base de datos
CREATE DATABASE tudestino;

# Usar base de datos
USE tudestino;

# Ver tablas
SHOW TABLES;

# Ver usuarios
SELECT * FROM users;

# Borrar todos los usuarios
DELETE FROM users;

# Reiniciar auto-increment
ALTER TABLE users AUTO_INCREMENT = 1;
```

### Gestión desde HeidiSQL

1. **Abrir:** Laragon → Database → Open
2. **Crear DB:** Click derecho → Create new → Database
3. **Ver datos:** Seleccionar tabla → Data
4. **Ejecutar SQL:** Click en "Query" tab

---

## 🐛 Solución de Problemas

### Error: Cannot connect to MySQL

**Solución:**
```bash
# 1. Verificar que MySQL esté corriendo en Laragon
# 2. Reiniciar MySQL en Laragon
# 3. Verificar puerto en .env (debe ser 3306)
```

### Error: Database 'tudestino' doesn't exist

**Solución:**
```bash
# Crear la base de datos manualmente
mysql -u root -p
CREATE DATABASE tudestino;
EXIT;
```

### Error: Access denied for user 'root'

**Solución:**
```env
# En .env, asegúrate de que DB_PASSWORD esté vacío
DB_PASSWORD=
```

### Quiero limpiar y empezar de nuevo

```bash
# 1. En HeidiSQL, borrar base de datos tudestino
# 2. Crear nueva base de datos tudestino
# 3. Ejecutar seed de nuevo
npm run seed:mysql --workspace=apps/api
```

---

## 🎯 Siguiente Paso

Una vez MySQL esté funcionando:

```bash
# 1. Verificar MySQL en Laragon (Start)
# 2. Crear base de datos 'tudestino'
# 3. Ejecutar seed
npm run seed:mysql --workspace=apps/api

# 4. Ejecutar backend
npm run dev:api

# 5. Ejecutar frontend
npm run dev:web
npm run dev:admin
```

---

## ✨ Ventajas de Usar MySQL con Laragon

- ✅ **Ya está instalado** (no necesitas descargar nada)
- ✅ **HeidiSQL incluido** (interfaz gráfica fácil de usar)
- ✅ **Bien documentado** (mucha ayuda en internet)
- ✅ **Rápido para desarrollo** (configuración simple)
- ✅ **Fácil de gestionar** (Laragon lo hace automático)

---

## 📚 Recursos

- **HeidiSQL:** Incluido en Laragon
- **MySQL Docs:** https://dev.mysql.com/doc/
- **Sequelize Docs:** https://sequelize.org/

---

**¿Prefieres MongoDB?** Ve a: [INSTALAR_MONGODB.md](./INSTALAR_MONGODB.md)

**¿Todo listo?** Ejecuta: `npm run seed:mysql --workspace=apps/api`
