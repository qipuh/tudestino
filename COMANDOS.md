# 📝 Comandos Útiles - TuDestino

Referencia rápida de comandos para el proyecto TuDestino.

## 🔍 Verificación

```bash
# Verificar que todo esté configurado
npm run verify
```

## 🚀 Ejecución

### Desarrollo (Todas las apps)

```bash
# Terminal 1: Backend API
npm run dev:api

# Terminal 2: Frontend Web
npm run dev:web

# Terminal 3: Admin Panel
npm run dev:admin
```

### Desarrollo Individual

```bash
# Solo Backend
cd apps/api && npm run dev

# Solo Web
cd apps/web && npm run dev

# Solo Admin
cd apps/admin && npm run dev
```

## 🗄️ Base de Datos

```bash
# Crear usuarios de prueba (requiere MongoDB corriendo)
npm run seed

# Ejecutar seed manualmente
cd apps/api && npm run seed

# Conectar a MongoDB
mongosh

# Ver bases de datos
show dbs

# Usar base de datos tudestino
use tudestino

# Ver colecciones
show collections

# Ver usuarios
db.users.find().pretty()

# Limpiar colección de usuarios
db.users.deleteMany({})
```

## 📦 Instalación y Dependencias

```bash
# Instalar todas las dependencias
npm install

# Instalar en workspace específico
npm install <package> --workspace=apps/api
npm install <package> --workspace=apps/web
npm install <package> --workspace=apps/admin

# Actualizar dependencias
npm update

# Auditoría de seguridad
npm audit
npm audit fix
```

## 🏗️ Build

```bash
# Build de todas las apps
npm run build:api
npm run build:web
npm run build:admin

# Build individual
cd apps/api && npm run build
cd apps/web && npm run build
cd apps/admin && npm run build
```

## 🧪 Testing

```bash
# Ejecutar tests de todas las apps
npm run test

# Test de workspace específico
npm run test --workspace=apps/api
```

## 🎨 Linting

```bash
# Lint de todas las apps
npm run lint

# Lint de workspace específico
npm run lint --workspace=apps/api
npm run lint --workspace=apps/web
npm run lint --workspace=apps/admin
```

## 📱 Flutter (Mobile)

```bash
# Navegar a mobile
cd apps/mobile

# Instalar dependencias
flutter pub get

# Ver dispositivos disponibles
flutter devices

# Ejecutar en dispositivo específico
flutter run -d <device-id>

# Ejecutar en Chrome (web)
flutter run -d chrome

# Build APK (Android)
flutter build apk

# Build App Bundle (Android)
flutter build appbundle

# Build iOS
flutter build ios

# Limpiar cache
flutter clean

# Ver doctor
flutter doctor
```

## 🔧 MongoDB (Laragon)

```bash
# Iniciar MongoDB
net start MongoDB

# Detener MongoDB
net stop MongoDB

# Reiniciar MongoDB
net stop MongoDB && net start MongoDB

# Verificar estado
sc query MongoDB
```

## 📊 Puertos y URLs

```bash
# Backend API
http://localhost:3000
http://localhost:3000/health

# API Endpoints
http://localhost:3000/api/auth/login
http://localhost:3000/api/properties
http://localhost:3000/api/users/profile

# Frontend Web
http://localhost:5173

# Admin Panel
http://localhost:5174
```

## 🧹 Limpieza

```bash
# Limpiar node_modules de todas las apps
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# Limpiar package-lock
rm package-lock.json
rm apps/*/package-lock.json

# Reinstalar todo
npm install

# Limpiar cache de npm
npm cache clean --force
```

## 📝 Git (cuando inicies versionado)

```bash
# Inicializar repositorio
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: TuDestino project structure"

# Ver status
git status

# Ver ramas
git branch

# Crear nueva rama
git checkout -b feature/authentication

# Cambiar de rama
git checkout main
```

## 🔍 Debugging

```bash
# Ver logs del API con detalles
cd apps/api && npm run dev

# Ver procesos en puerto específico
netstat -ano | findstr :3000
netstat -ano | findstr :5173

# Matar proceso en puerto
# 1. Buscar PID con netstat
# 2. taskkill /PID <PID> /F

# Ver variables de entorno
cat apps/api/.env
cat apps/web/.env
cat apps/admin/.env
```

## 📦 Workspace Commands

```bash
# Listar workspaces
npm ls --workspaces

# Ejecutar comando en todos los workspaces
npm run <script> --workspaces

# Ejecutar comando en workspace específico
npm run <script> --workspace=apps/api

# Ver dependencias de workspace
npm ls --workspace=apps/api
```

## 🚀 Producción (Futuro)

```bash
# Variables de entorno producción
NODE_ENV=production

# Build optimizado
npm run build:api
npm run build:web
npm run build:admin

# Iniciar en producción (API)
cd apps/api && npm start
```

## 🔐 Variables de Entorno

```bash
# Copiar archivos de ejemplo
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp apps/admin/.env.example apps/admin/.env

# Editar variables
# Windows: notepad apps/api/.env
# Linux/Mac: nano apps/api/.env
```

## 📚 Documentación

```bash
# Leer documentación
cat README.md
cat INSTALACION_COMPLETA.md
cat COMO_EMPEZAR.md
cat SETUP_COMPLETO.md

# Ver documentación en docs/
ls docs/
cat docs/GETTING_STARTED.md
cat docs/ARCHITECTURE.md
cat docs/API.md
```

## 🎯 Workflow Típico

### Inicio del día

```bash
# 1. Verificar proyecto
npm run verify

# 2. Iniciar MongoDB (si no está corriendo)
net start MongoDB

# 3. Ejecutar aplicaciones
npm run dev:api      # Terminal 1
npm run dev:web      # Terminal 2
npm run dev:admin    # Terminal 3
```

### Desarrollo

```bash
# 1. Trabajar en código
# 2. Ver cambios en tiempo real (hot reload)
# 3. Probar en navegador
```

### Testing

```bash
# 1. Ejecutar tests
npm run test

# 2. Verificar linting
npm run lint
```

### Fin del día

```bash
# 1. Guardar cambios
git add .
git commit -m "descripción de cambios"

# 2. Cerrar aplicaciones (Ctrl+C en cada terminal)

# 3. Opcional: Detener MongoDB
net stop MongoDB
```

## 🆘 Solución Rápida de Problemas

```bash
# MongoDB no conecta
net start MongoDB
mongosh  # Verificar conexión

# Puerto en uso
netstat -ano | findstr :3000
# Cambiar puerto en .env

# Dependencias rotas
rm -rf node_modules package-lock.json
npm install

# Cache corrupto
npm cache clean --force
npm install

# Error de permisos
# Ejecutar terminal como administrador (Windows)
```

## 📊 Cheat Sheet

| Comando | Descripción |
|---------|-------------|
| `npm run verify` | Verificar instalación |
| `npm run seed` | Crear usuarios de prueba |
| `npm run dev:api` | Backend API |
| `npm run dev:web` | Frontend Web |
| `npm run dev:admin` | Admin Panel |
| `npm install` | Instalar dependencias |
| `npm run build:*` | Build producción |
| `npm run lint` | Verificar código |
| `npm run test` | Ejecutar tests |

---

**💡 Tip:** Guarda este archivo en marcadores para referencia rápida.
