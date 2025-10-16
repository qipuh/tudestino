# 🏠 TuDestino - Plataforma de Alojamiento

Plataforma de reservas de alojamiento tipo Airbnb con frontend web en React y aplicación móvil en Flutter.

> **✅ PROYECTO COMPLETAMENTE CONFIGURADO**
> Lee primero: **[LEER_PRIMERO.md](LEER_PRIMERO.md)** para comenzar rápidamente.

## 📁 Estructura del Proyecto

```
tudestino/
├── apps/
│   ├── api/          # Backend API (Node.js + Express)
│   ├── web/          # Frontend Web Público (React)
│   ├── admin/        # Panel de Administración (React)
│   └── mobile/       # Aplicación Móvil (Flutter)
├── packages/
│   └── shared/       # Código compartido (tipos, constantes, utils)
└── docs/             # Documentación del proyecto
```

## 🚀 Tecnologías

- **Backend**: Node.js, Express, MongoDB
- **Web Frontend**: React, Vite
- **Mobile App**: Flutter
- **Admin Panel**: React, Vite

## 📦 Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno (ya están configuradas)
# ✅ Ya listos para MySQL + Laragon

# 3. Crear base de datos 'tudestino' en Laragon/HeidiSQL

# 4. Crear tablas (solo primera vez)
npm run seed:mysql

# 5. Ejecutar TODO en una sola terminal 🚀
npm run dev

# Acceder a:
# - Web: http://tudestino.test
# - Admin: http://admin.tudestino.test
# - API: http://api.tudestino.test/health
```

## 📚 Documentación

### 🚀 Inicio Rápido
- **[LEER_PRIMERO.md](LEER_PRIMERO.md)** ⭐ - Empieza aquí
- **[INSTALACION_COMPLETA.md](INSTALACION_COMPLETA.md)** - Estado del proyecto
- **[COMANDOS.md](COMANDOS.md)** - Referencia de comandos

### 📖 Guías Completas
- [COMO_EMPEZAR.md](COMO_EMPEZAR.md) - Plan de desarrollo
- [PROYECTO_COMPLETO.md](PROYECTO_COMPLETO.md) - Visión completa
- [SETUP_COMPLETO.md](SETUP_COMPLETO.md) - Setup detallado

### 🗄️ Base de Datos y Configuración
- [BASE_DE_DATOS.md](BASE_DE_DATOS.md) - MySQL vs MongoDB
- [USAR_MYSQL.md](USAR_MYSQL.md) - Configurar MySQL (Laragon)
- [INSTALAR_MONGODB.md](INSTALAR_MONGODB.md) - Instalar MongoDB
- [CONFIGURAR_LARAGON.md](CONFIGURAR_LARAGON.md) - Usar dominios .test

### 🏗️ Documentación Técnica
- [docs/GETTING_STARTED.md](./docs/GETTING_STARTED.md) - Guía de inicio
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitectura
- [docs/API.md](./docs/API.md) - API Reference

## 🏗️ Módulos Principales

1. **Autenticación y Usuarios** (Auth, Perfiles, Verificación)
2. **Propiedades** (CRUD, Galerías, Amenities)
3. **Búsqueda y Filtros** (Geolocalización, Filtros avanzados)
4. **Reservas y Pagos** (Calendario, Pasarelas de pago)
5. **Comunicación** (Chat, Notificaciones)
6. **Administración** (Tipos de alojamiento, Verificación, Promociones)

## 📱 Aplicaciones

### API (Backend)
Puerto: `3000`
- RESTful API
- WebSockets para chat
- JWT Authentication

### Web (Frontend Público)
Puerto: `5173`
- Búsqueda de propiedades
- Reservas
- Perfil de usuario

### Admin (Panel de Administración)
Puerto: `5174`
- Gestión de propiedades
- Verificación de anfitriones
- Analytics

### Mobile (Flutter)
- iOS y Android
- Notificaciones push
- Chat en tiempo real

## 📄 Licencia

MIT
