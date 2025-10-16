# 🗄️ Elección de Base de Datos - TuDestino

El proyecto **TuDestino soporta AMBAS bases de datos**: MySQL y MongoDB.

---

## 🎯 ¿Cuál Usar?

### ✅ Opción 1: MySQL (Recomendado para Laragon)

**Ventajas:**
- ✅ **Ya está instalado** en Laragon
- ✅ **HeidiSQL incluido** (interfaz gráfica)
- ✅ **Configuración cero** - Solo iniciar
- ✅ **SQL estándar** - Bien documentado
- ✅ **Fácil de gestionar**

**Ideal para:**
- Usuarios de Laragon
- Desarrollo rápido local
- Aprender SQL
- Estructura de datos clara

**Guía:** → **[USAR_MYSQL.md](./USAR_MYSQL.md)**

---

### ✅ Opción 2: MongoDB

**Ventajas:**
- ✅ **NoSQL** - Flexible y moderno
- ✅ **JSON nativo** - Fácil de entender
- ✅ **Escalable** - Para proyectos grandes
- ✅ **Esquema flexible** - Cambios rápidos

**Ideal para:**
- Aprender NoSQL
- Proyectos con datos no estructurados
- Escalabilidad futura
- Desarrollo ágil

**Guía:** → **[INSTALAR_MONGODB.md](./INSTALAR_MONGODB.md)**

---

## 🚀 Inicio Rápido

### Para MySQL (Laragon):

```bash
# 1. Iniciar MySQL en Laragon
#    Click derecho → MySQL → Start

# 2. Crear base de datos
#    Laragon → Database → Open (HeidiSQL)
#    Create new → Database → "tudestino"

# 3. Ejecutar seed
npm run seed:mysql --workspace=apps/api

# 4. Ejecutar backend
npm run dev:api
```

### Para MongoDB:

```bash
# 1. Instalar MongoDB
#    Ver: INSTALAR_MONGODB.md

# 2. Iniciar MongoDB
net start MongoDB

# 3. Ejecutar seed
npm run seed --workspace=apps/api

# 4. Ejecutar backend
npm run dev:api
```

---

## 📊 Comparación Detallada

| Característica | MySQL | MongoDB |
|----------------|-------|---------|
| **Instalación en Laragon** | ✅ Incluido | ❌ Requiere instalación |
| **Interfaz Gráfica** | ✅ HeidiSQL | MongoDB Compass |
| **Lenguaje de Consulta** | SQL | JavaScript/JSON |
| **Estructura** | Tablas rígidas | Documentos flexibles |
| **Relaciones** | ✅ JOIN nativo | Referencias manuales |
| **Transacciones** | ✅ ACID completo | ✅ ACID (desde v4) |
| **Velocidad Setup** | ✅ Inmediata | Media |
| **Curva Aprendizaje** | Media | Baja |
| **Producción** | ✅ Muy estable | ✅ Escalable |
| **Comunidad** | ✅ Enorme | ✅ Grande |

---

## 🔧 Configuración Actual

### Archivos Creados

**Para MySQL:**
- ✅ `apps/api/src/config/database-mysql.js` - Configuración Sequelize
- ✅ `apps/api/src/modules/users/user.model-mysql.js` - Modelo User
- ✅ `apps/api/src/modules/properties/property.model-mysql.js` - Modelo Property
- ✅ `apps/api/src/config/seed-mysql.js` - Seed MySQL
- ✅ Script: `npm run seed:mysql`

**Para MongoDB:**
- ✅ `apps/api/src/config/database.js` - Configuración Mongoose
- ✅ `apps/api/src/modules/users/user.model.js` - Modelo User
- ✅ `apps/api/src/modules/properties/property.model.js` - Modelo Property
- ✅ `apps/api/src/config/seed.js` - Seed MongoDB
- ✅ Script: `npm run seed`

### Archivo .env

Actualmente configurado para **MySQL**:

```env
# Database - MySQL (Laragon) - ACTIVO
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=

# Database - MongoDB (Comentado)
# MONGODB_URI=mongodb://localhost:27017/tudestino
```

Para cambiar a MongoDB, invierte los comentarios.

---

## 🔄 Cambiar de Base de Datos

### De MySQL a MongoDB:

1. Edita `apps/api/.env`:
```env
# Comentar MySQL
# DB_HOST=localhost
# DB_PORT=3306
# ...

# Descomentar MongoDB
MONGODB_URI=mongodb://localhost:27017/tudestino
```

2. Actualiza `apps/api/src/index.js` para usar `database.js`

3. Usa los modelos sin `-mysql` en el nombre

### De MongoDB a MySQL:

1. Edita `apps/api/.env`:
```env
# Descomentar MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=

# Comentar MongoDB
# MONGODB_URI=mongodb://localhost:27017/tudestino
```

2. Actualiza `apps/api/src/index.js` para usar `database-mysql.js`

3. Usa los modelos con `-mysql` en el nombre

---

## 📚 Documentación Disponible

1. **[USAR_MYSQL.md](./USAR_MYSQL.md)** - Guía completa MySQL + Laragon
2. **[INSTALAR_MONGODB.md](./INSTALAR_MONGODB.md)** - Guía instalación MongoDB
3. Este archivo - Comparación y elección

---

## 💡 Recomendación

### Si usas Laragon:
👉 **Usa MySQL** - Es más rápido y fácil porque ya está instalado.

### Si quieres aprender NoSQL:
👉 **Instala MongoDB** - Es una tecnología moderna y valiosa.

### ¿No sabes qué elegir?
👉 **Empieza con MySQL** - Puedes cambiar después sin problemas.

---

## 🎯 Siguiente Paso

**Opción 1 (MySQL):**
1. Lee: [USAR_MYSQL.md](./USAR_MYSQL.md)
2. Inicia MySQL en Laragon
3. Ejecuta: `npm run seed:mysql --workspace=apps/api`

**Opción 2 (MongoDB):**
1. Lee: [INSTALAR_MONGODB.md](./INSTALAR_MONGODB.md)
2. Instala y configura MongoDB
3. Ejecuta: `npm run seed --workspace=apps/api`

---

**Ambas opciones son válidas y el proyecto funciona igual con ambas.** 🎉

Volver a: [LEER_PRIMERO.md](./LEER_PRIMERO.md)
