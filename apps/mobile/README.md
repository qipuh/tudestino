# TuDestino Mobile App

Aplicación móvil de TuDestino desarrollada en Flutter.

## 📱 Plataformas

- iOS
- Android

## 🚀 Tecnologías

- Flutter 3.x
- Dart 3.x
- Provider (State Management)
- Dio (HTTP Client)
- Firebase (Push Notifications)
- Google Maps

## 📁 Estructura del Proyecto

```
lib/
├── core/
│   ├── services/      # API, Navigation, etc.
│   ├── models/        # Data models
│   ├── utils/         # Helpers & utilities
│   ├── widgets/       # Shared widgets
│   └── theme/         # App theme
├── modules/
│   ├── auth/          # Authentication
│   ├── home/          # Home screen
│   ├── search/        # Search & filters
│   ├── property/      # Property details
│   ├── booking/       # Booking flow
│   ├── profile/       # User profile
│   └── chat/          # Messaging
└── main.dart
```

## 🔧 Instalación

```bash
# Instalar dependencias
flutter pub get

# Ejecutar en iOS
flutter run -d ios

# Ejecutar en Android
flutter run -d android

# Build para producción
flutter build apk
flutter build ios
```

## 🔑 Configuración

1. Copiar `.env.example` a `.env`
2. Configurar API URL y credenciales
3. Configurar Firebase (google-services.json y GoogleService-Info.plist)

## 📦 Módulos Principales

- **Auth**: Login, Register, Verificación
- **Home**: Dashboard principal
- **Search**: Búsqueda y filtros
- **Property**: Detalles de propiedades
- **Booking**: Proceso de reserva
- **Profile**: Perfil de usuario
- **Chat**: Mensajería en tiempo real
