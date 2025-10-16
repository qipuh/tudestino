# 🚀 Cómo Empezar con TuDestino

## ✅ Proyecto Completado

La estructura completa del proyecto TuDestino ha sido creada con éxito. Ahora tienes:

- ✅ **Backend API** (Node.js + Express + MongoDB)
- ✅ **Frontend Web** (React + Vite + Tailwind)
- ✅ **Panel Admin** (React + Vite + Tailwind)
- ✅ **App Móvil** (Flutter)
- ✅ **Paquete Compartido** (Constantes y utilidades)
- ✅ **Documentación Completa**

## 📋 Checklist Inicial

### 1. Verificar Requisitos
- [ ] Node.js 18+ instalado
- [ ] MongoDB instalado y corriendo
- [ ] Flutter 3+ instalado (para móvil)
- [ ] Git instalado

### 2. Instalar Dependencias

```bash
# En la raíz del proyecto
npm install
```

### 3. Configurar Variables de Entorno

#### Backend API
```bash
cd apps/api
cp .env.example .env
```

Editar `apps/api/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tudestino
JWT_SECRET=tu-super-secreto-cambiar-en-produccion
JWT_EXPIRES_IN=7d
```

#### Frontend Web
```bash
cd apps/web
cp .env.example .env
```

Editar `apps/web/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

#### Panel Admin
```bash
cd apps/admin
cp .env.example .env
```

Editar `apps/admin/.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Iniciar MongoDB

```bash
# En una terminal separada
mongod
```

O si usas servicios:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Ejecutar las Aplicaciones

#### Terminal 1: Backend API
```bash
npm run dev:api
```
Abre en: http://localhost:3000

#### Terminal 2: Frontend Web
```bash
npm run dev:web
```
Abre en: http://localhost:5173

#### Terminal 3: Panel Admin
```bash
npm run dev:admin
```
Abre en: http://localhost:5174

#### Terminal 4: App Móvil (opcional)
```bash
cd apps/mobile
flutter pub get
flutter run
```

## 🎯 Próximos Pasos de Desarrollo

### Fase 1: Autenticación (ACTUAL)
**Prioridad: ALTA**

1. **Backend:**
   - [ ] Completar lógica de registro
   - [ ] Completar lógica de login
   - [ ] Implementar verificación de email
   - [ ] Implementar reset de password

2. **Frontend Web:**
   - [ ] Crear formulario de registro
   - [ ] Crear formulario de login
   - [ ] Crear página de verificación
   - [ ] Implementar context de autenticación

3. **Panel Admin:**
   - [ ] Crear login de admin
   - [ ] Proteger rutas de admin

### Fase 2: Propiedades
**Prioridad: ALTA**

1. **Backend:**
   - [ ] Crear modelo de tipos de alojamiento
   - [ ] Implementar CRUD de propiedades
   - [ ] Implementar upload de imágenes (Multer)
   - [ ] Implementar búsqueda básica

2. **Frontend Web:**
   - [ ] Página de listado de propiedades
   - [ ] Página de detalle de propiedad
   - [ ] Formulario de creación (host)
   - [ ] Componente de galería de imágenes

3. **Panel Admin:**
   - [ ] CRUD de tipos de alojamiento
   - [ ] Gestión de propiedades
   - [ ] Aprobación de propiedades

### Fase 3: Búsqueda y Filtros
**Prioridad: MEDIA**

- [ ] Implementar búsqueda por ubicación
- [ ] Filtros avanzados (precio, amenities, etc.)
- [ ] Integrar mapas (Leaflet/Google Maps)
- [ ] Geolocalización

### Fase 4: Reservas y Pagos
**Prioridad: ALTA**

- [ ] Modelo de reservas
- [ ] Calendario de disponibilidad
- [ ] Integración con Stripe
- [ ] Sistema de confirmaciones

### Fase 5: Comunicación
**Prioridad: MEDIA**

- [ ] Implementar Socket.io para chat
- [ ] Sistema de notificaciones
- [ ] Emails transaccionales (Nodemailer)

### Fase 6: Reviews
**Prioridad: MEDIA**

- [ ] Sistema de calificaciones
- [ ] CRUD de reviews
- [ ] Moderación de reviews

### Fase 7: Admin y Analytics
**Prioridad: BAJA**

- [ ] Dashboard con estadísticas
- [ ] Verificación de anfitriones
- [ ] Sistema de promociones
- [ ] Reportes y analytics

## 📂 Estructura de Archivos Importantes

```
tudestino/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── index.js              # Entry point
│   │   │   ├── config/
│   │   │   │   └── database.js       # Configuración MongoDB
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.js
│   │   │   │   └── errorHandler.js
│   │   │   └── modules/
│   │   │       ├── auth/             # Empezar aquí
│   │   │       ├── users/
│   │   │       └── properties/
│   │   └── .env                      # Configurar
│   │
│   ├── web/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   ├── modules/
│   │   │   │   └── auth/             # Empezar aquí
│   │   │   └── services/
│   │   │       └── api.js            # Cliente HTTP
│   │   └── .env                      # Configurar
│   │
│   ├── admin/
│   │   ├── src/
│   │   │   ├── App.jsx
│   │   │   └── modules/
│   │   │       └── dashboard/
│   │   └── .env                      # Configurar
│   │
│   └── mobile/
│       ├── lib/
│       │   ├── main.dart
│       │   └── modules/
│       └── pubspec.yaml
│
├── packages/
│   └── shared/                       # Importar desde apps
│       └── index.js
│
└── docs/                             # Leer primero
    ├── GETTING_STARTED.md
    ├── ARCHITECTURE.md
    └── API.md
```

## 🔍 Comandos Útiles

### Development
```bash
# Ver logs de API
npm run dev:api

# Build para producción
npm run build:api
npm run build:web
npm run build:admin

# Linting
npm run lint

# Tests (cuando se implementen)
npm run test
```

### Flutter
```bash
# Limpiar cache
flutter clean

# Ver dispositivos
flutter devices

# Build APK
flutter build apk

# Build iOS
flutter build ios
```

### MongoDB
```bash
# Conectar a MongoDB
mongosh

# Ver bases de datos
show dbs

# Usar base de datos tudestino
use tudestino

# Ver colecciones
show collections
```

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
ps aux | grep mongod

# O en Windows
tasklist | findstr mongod

# Reiniciar MongoDB
brew services restart mongodb-community  # macOS
sudo systemctl restart mongod            # Linux
net stop MongoDB && net start MongoDB    # Windows
```

### Puerto en uso
```bash
# Cambiar puerto en .env (API) o vite.config.js (web/admin)
PORT=3001  # En .env
```

### Dependencias de Flutter
```bash
cd apps/mobile
flutter clean
flutter pub get
```

## 📞 Ayuda y Recursos

- **Documentación del Proyecto:** Ver carpeta `docs/`
- **Estructura Completa:** Ver [PROYECTO_COMPLETO.md](./PROYECTO_COMPLETO.md)
- **API Reference:** Ver [docs/API.md](./docs/API.md)
- **Arquitectura:** Ver [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## ✨ Características Implementadas

- ✅ Estructura modular escalable
- ✅ Autenticación JWT
- ✅ Roles de usuario (guest/host/admin)
- ✅ API RESTful
- ✅ Responsive design
- ✅ Multi-plataforma (Web + Mobile)
- ✅ Sistema de módulos independientes
- ✅ Código compartido (shared package)

---

**¡Empieza por la Fase 1: Autenticación!** 🚀

**Archivos para modificar primero:**
1. `apps/api/src/modules/auth/` - Implementar lógica de autenticación
2. `apps/web/src/modules/auth/` - Crear formularios de login/registro
3. `apps/api/src/modules/users/` - Completar gestión de usuarios

¡Buena suerte con el desarrollo! 🎉
