# Panel de Administración - TuDestino

Panel de administración completo para gestionar usuarios, negocios y estadísticas de la plataforma TuDestino.

## 🚀 Características

- ✅ **Sistema de autenticación** para administradores
- 📊 **Dashboard** con estadísticas en tiempo real
- 👥 **Gestión de usuarios** con filtros y búsqueda
- 🏢 **Gestión de negocios** con detalles completos
- 🔗 **URLs cortas** para usuarios y negocios
- 📱 **Diseño responsive** con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 16+
- npm o yarn
- API de TuDestino corriendo en `http://localhost:3000/api`

## 🛠️ Instalación

1. **Instalar dependencias:**
```bash
cd apps/admin
npm install
```

2. **Instalar Zustand (para manejo de estado):**
```bash
npm install zustand
```

3. **Configurar variables de entorno:**
Edita el archivo `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

## 🎯 Uso

### Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El panel estará disponible en `http://localhost:5173`

### Credenciales de Administrador:

Para acceder al panel, necesitas crear un usuario administrador en la base de datos o usar el endpoint de la API.

**Ejemplo de usuario admin:**
```
Email: admin@tudestino.com
Password: (tu contraseña segura)
```

## 📁 Estructura del Proyecto

```
apps/admin/
├── src/
│   ├── modules/
│   │   ├── dashboard/
│   │   │   └── Dashboard.jsx          # Dashboard principal
│   │   ├── users/
│   │   │   └── UsersManagement.jsx    # Gestión de usuarios
│   │   └── properties/
│   │       └── PropertiesManagement.jsx # Gestión de negocios
│   ├── pages/
│   │   └── LoginPage.jsx              # Página de login
│   ├── services/
│   │   └── api.js                     # Configuración de Axios
│   ├── store/
│   │   └── authStore.js               # Store de autenticación (Zustand)
│   ├── layouts/
│   │   └── AdminLayout.jsx            # Layout principal
│   ├── App.jsx                        # Rutas y protección
│   └── main.jsx                       # Punto de entrada
├── .env                               # Variables de entorno
└── package.json
```

## 🔐 Endpoints de API Necesarios

El panel requiere que el backend tenga los siguientes endpoints:

### Autenticación
- `POST /api/auth/admin/login` - Login de administrador
- `GET /api/auth/me` - Obtener usuario actual

### Estadísticas
- `GET /api/admin/stats` - Estadísticas del dashboard
  ```json
  {
    "totalUsers": 1234,
    "totalBusinesses": 567,
    "totalBookings": 89,
    "totalRevenue": 12345,
    "newUsersThisMonth": 45,
    "newBusinessesThisMonth": 12
  }
  ```

### Usuarios
- `GET /api/admin/users` - Listar usuarios
  - Query params: `page`, `limit`, `search`, `userType`
  - Respuesta:
    ```json
    {
      "data": {
        "users": [...],
        "totalPages": 10,
        "currentPage": 1
      }
    }
    ```

### Negocios
- `GET /api/admin/businesses` - Listar negocios
  - Query params: `page`, `limit`, `search`, `type`
  - Respuesta:
    ```json
    {
      "data": {
        "businesses": [...],
        "totalPages": 5,
        "currentPage": 1
      }
    }
    ```

## 🎨 Módulos Principales

### 1. Dashboard (`/`)
- Muestra estadísticas generales
- Gráficos de usuarios nuevos
- Listado de negocios recientes
- Indicadores de ingresos

### 2. Gestión de Usuarios (`/users`)
- Tabla completa de usuarios
- Filtros por tipo (anfitrión, turista)
- Búsqueda por nombre, email, teléfono
- Acceso a URLs cortas
- Ver detalles del usuario
- Activar/desactivar usuarios

### 3. Gestión de Negocios (`/properties`)
- Tabla completa de negocios
- Filtros por tipo (hotel, restaurante, tour, evento)
- Búsqueda por nombre, ubicación
- Ver información del propietario
- Acceso a URLs cortas
- Ver detalles del negocio

## 🔒 Seguridad

- **Rutas protegidas**: Solo usuarios autenticados pueden acceder
- **Token JWT**: Almacenado en localStorage
- **Interceptores**: Manejo automático de tokens expirados
- **Redirección**: Auto-redirect a login si no autenticado

## 🚧 Próximas Funcionalidades

- [ ] Exportar datos a Excel/CSV
- [ ] Gráficos avanzados con Chart.js
- [ ] Notificaciones en tiempo real
- [ ] Gestión de roles y permisos
- [ ] Logs de actividad
- [ ] Respaldo y restauración de datos

## 🐛 Solución de Problemas

### Error: "Cannot read properties of undefined"
- Verifica que el backend esté corriendo
- Revisa la variable `VITE_API_URL` en `.env`

### Error: "401 Unauthorized"
- El token ha expirado, vuelve a iniciar sesión
- Verifica que el endpoint `/api/auth/admin/login` funcione

### Datos no se cargan
- Abre la consola del navegador (F12)
- Revisa los errores de red en la pestaña "Network"
- Verifica que los endpoints del backend devuelvan el formato correcto

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias, por favor abre un issue en el repositorio.

## 📝 Licencia

Este proyecto es parte de TuDestino Platform.
