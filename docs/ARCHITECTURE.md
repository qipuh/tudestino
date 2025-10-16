# Arquitectura del Proyecto TuDestino

## 🏗️ Visión General

TuDestino es una plataforma de reservas tipo Airbnb construida con una arquitectura de microservicios y aplicaciones multi-plataforma.

## 📊 Diagrama de Arquitectura

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web App   │     │  Admin App  │     │  Mobile App │
│   (React)   │     │   (React)   │     │  (Flutter)  │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   API REST  │
                    │  (Node.js)  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   MongoDB   │
                    └─────────────┘
```

## 🔧 Stack Tecnológico

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Base de datos**: MongoDB + Mongoose
- **Autenticación**: JWT
- **Real-time**: Socket.io
- **Pagos**: Stripe

### Frontend Web
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router
- **State**: Zustand + React Query
- **Estilos**: Tailwind CSS
- **Mapas**: Leaflet

### Admin Panel
- **Framework**: React 18
- **Build Tool**: Vite
- **Charts**: Recharts
- **Estilos**: Tailwind CSS

### Mobile App
- **Framework**: Flutter 3+
- **State**: Provider
- **Routing**: Go Router
- **HTTP**: Dio
- **Maps**: Google Maps

## 📁 Organización de Código

### Arquitectura por Módulos (Backend)

```
apps/api/src/modules/
├── auth/                 # Autenticación
│   ├── auth.routes.js
│   ├── auth.controller.js
│   ├── auth.service.js
│   └── auth.middleware.js
├── users/                # Usuarios
├── properties/           # Propiedades
├── bookings/             # Reservas
└── ...
```

Cada módulo es independiente y sigue el patrón:
- **Routes**: Define los endpoints
- **Controller**: Maneja requests/responses
- **Service**: Lógica de negocio
- **Model**: Esquema de datos

### Arquitectura por Features (Frontend)

```
apps/web/src/modules/
├── auth/
│   ├── components/      # Componentes del módulo
│   ├── hooks/           # Custom hooks
│   ├── services/        # API calls
│   └── pages/           # Páginas del módulo
├── properties/
└── ...
```

## 🔐 Flujo de Autenticación

1. Usuario se registra/loguea
2. API genera JWT token
3. Frontend almacena token (localStorage/SecureStorage)
4. Todas las requests incluyen token en headers
5. Middleware verifica token en cada request

## 📡 Comunicación API

### REST API
- Endpoints RESTful estándar
- JSON para request/response
- Status codes HTTP apropiados

### WebSockets (Socket.io)
- Chat en tiempo real
- Notificaciones push
- Updates de disponibilidad

## 🗃️ Modelo de Datos

### Colecciones Principales

1. **Users**
   - Información personal
   - Roles (guest/host/admin)
   - Verificación

2. **Properties**
   - Detalles del alojamiento
   - Ubicación
   - Precios y disponibilidad

3. **Bookings**
   - Reservas
   - Fechas
   - Estado de pago

4. **Reviews**
   - Calificaciones
   - Comentarios

## 🚀 Flujo de Deployment

1. **Development**: localhost
2. **Staging**: ambiente de pruebas
3. **Production**: ambiente productivo

### Backend
- Deploy en servicios como Heroku, Railway, o DigitalOcean
- MongoDB Atlas para base de datos

### Frontend
- Deploy en Vercel, Netlify o similar
- CDN para assets estáticos

### Mobile
- App Store (iOS)
- Google Play (Android)

## 🔄 CI/CD (Futuro)

- GitHub Actions para tests automáticos
- Deploy automático en merge a main
- Tests E2E antes de producción
