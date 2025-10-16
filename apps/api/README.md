# TuDestino API

Backend API para la plataforma TuDestino.

## 🚀 Tecnologías

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Socket.io (Chat en tiempo real)

## 📁 Estructura de Módulos

```
src/
├── modules/
│   ├── auth/           # Autenticación (login, register)
│   ├── users/          # Gestión de usuarios
│   ├── properties/     # Propiedades/Alojamientos
│   ├── bookings/       # Reservas
│   ├── payments/       # Pagos (Stripe)
│   ├── reviews/        # Reseñas
│   ├── messaging/      # Chat entre usuarios
│   ├── search/         # Búsqueda y filtros
│   └── admin/          # Panel de administración
├── config/             # Configuraciones
├── middleware/         # Middlewares
└── utils/              # Utilidades
```

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Copiar .env.example a .env
cp .env.example .env

# Configurar variables de entorno
# Editar .env con tus credenciales

# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## 🔑 Variables de Entorno

Ver [.env.example](.env.example) para todas las variables requeridas.

## 📡 Endpoints Principales

### Auth
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/verify-email` - Verificar email

### Properties
- `GET /api/properties` - Listar propiedades
- `POST /api/properties` - Crear propiedad (host)
- `GET /api/properties/:id` - Detalle de propiedad

### Users
- `GET /api/users/profile` - Perfil del usuario
- `PUT /api/users/profile` - Actualizar perfil

## 🔐 Autenticación

Todas las rutas protegidas requieren JWT token en el header:

```
Authorization: Bearer <token>
```

## 👤 Roles de Usuario

- `guest` - Huésped
- `host` - Anfitrión
- `admin` - Administrador
