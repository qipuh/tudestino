# Guía de Inicio Rápido - TuDestino

## 📋 Requisitos Previos

- Node.js 18+ y npm
- MongoDB 6+
- Flutter 3+ (para app móvil)
- Git

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd tudestino
```

### 2. Instalar dependencias

```bash
# Instalar todas las dependencias del monorepo
npm install
```

### 3. Configurar variables de entorno

#### Backend API
```bash
cd apps/api
cp .env.example .env
# Editar .env con tus credenciales
```

#### Frontend Web
```bash
cd apps/web
cp .env.example .env
```

#### Admin Panel
```bash
cd apps/admin
cp .env.example .env
```

### 4. Iniciar MongoDB

```bash
# Asegúrate de que MongoDB esté corriendo
mongod
```

### 5. Ejecutar las aplicaciones

#### Backend API
```bash
npm run dev:api
# Corre en http://localhost:3000
```

#### Frontend Web
```bash
npm run dev:web
# Corre en http://localhost:5173
```

#### Admin Panel
```bash
npm run dev:admin
# Corre en http://localhost:5174
```

#### Mobile App
```bash
cd apps/mobile
flutter pub get
flutter run
```

## 📁 Estructura del Proyecto

```
tudestino/
├── apps/
│   ├── api/          # Backend Node.js + Express
│   ├── web/          # Frontend Web (React)
│   ├── admin/        # Panel Admin (React)
│   └── mobile/       # App Móvil (Flutter)
├── packages/
│   └── shared/       # Código compartido
└── docs/             # Documentación
```

## 🔑 Usuarios por Defecto

Después de la primera ejecución, puedes crear usuarios con estos roles:

- **Admin**: admin@tudestino.com / admin123
- **Host**: host@tudestino.com / host123
- **Guest**: guest@tudestino.com / guest123

## 📝 Próximos Pasos

1. Lee la [Arquitectura del Proyecto](./ARCHITECTURE.md)
2. Consulta la [Documentación de la API](./API.md)
3. Revisa las [Guías de Desarrollo](./DEVELOPMENT.md)

## 🐛 Problemas Comunes

### MongoDB no conecta
- Verifica que MongoDB esté corriendo
- Revisa la URL de conexión en `.env`

### Error en dependencias de Flutter
```bash
flutter clean
flutter pub get
```

### Puerto en uso
- Cambia el puerto en los archivos de configuración
