# Configuración del Panel de Administración

## Variables de Entorno

El panel de administración utiliza variables de entorno para configurar la conexión con el backend. Estas variables se definen en el archivo `.env` en la raíz del proyecto admin.

### Configuración Básica

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

### Variables Disponibles

#### `VITE_API_URL` (Requerido)
URL base del API backend. Esta URL es dinámica y se ajusta según el entorno.

**Opciones:**
- Desarrollo local: `http://localhost:3000/api`
- Laragon: `http://api.tudestino.test/api`
- Producción: `https://api.tudestino.com/api`

**Ejemplo:**
```bash
VITE_API_URL=http://localhost:3000/api
```

#### `VITE_API_TIMEOUT` (Opcional)
Tiempo máximo de espera para las peticiones al API en milisegundos.

**Default:** `30000` (30 segundos)

**Ejemplo:**
```bash
VITE_API_TIMEOUT=30000
```

## Arquitectura de la Configuración

### 1. Archivo de Configuración Central
[src/config/api.config.js](src/config/api.config.js)

Este archivo centraliza toda la configuración del API:
```javascript
import API_CONFIG from '../config/api.config';

// Configuración completa
API_CONFIG.baseURL    // URL base del API
API_CONFIG.timeout    // Timeout de peticiones
API_CONFIG.headers    // Headers por defecto
```

### 2. Endpoints Dinámicos
Los endpoints están definidos de forma dinámica en `API_ENDPOINTS`:

```javascript
import { API_ENDPOINTS } from '../config/api.config';

// Uso en servicios
api.post(API_ENDPOINTS.AUTH.LOGIN, data);
api.get(API_ENDPOINTS.USERS.LIST);
api.get(API_ENDPOINTS.USERS.DETAIL(userId));
```

### 3. Servicios por Módulo
Cada módulo tiene su propio servicio que usa los endpoints dinámicos:

- [src/services/users.service.js](src/services/users.service.js) - Gestión de usuarios
- [src/services/properties.service.js](src/services/properties.service.js) - Gestión de propiedades
- [src/services/api.js](src/services/api.js) - Cliente HTTP base (axios)

**Ejemplo de uso:**
```javascript
import usersService from '../services/users.service';

// Obtener todos los usuarios
const users = await usersService.getAll();

// Obtener usuario por ID
const user = await usersService.getById(userId);

// Actualizar usuario
const updated = await usersService.update(userId, data);
```

## Cambiar entre Entornos

### Para Desarrollo Local
```bash
# .env
VITE_API_URL=http://localhost:3000/api
```

### Para Laragon
```bash
# .env
VITE_API_URL=http://api.tudestino.test/api
```

### Para Producción
```bash
# .env
VITE_API_URL=https://api.tudestino.com/api
```

## Ventajas de esta Arquitectura

1. **Configuración Centralizada**: Un solo lugar para cambiar URLs
2. **Endpoints Tipados**: Menos errores en las rutas
3. **Fácil Mantenimiento**: Agregar nuevos endpoints es sencillo
4. **Múltiples Entornos**: Cambiar entre dev/staging/prod es simple
5. **Servicios Reutilizables**: Lógica de API encapsulada

## Agregar Nuevos Endpoints

1. Editar [src/config/api.config.js](src/config/api.config.js):
```javascript
export const API_ENDPOINTS = {
  // ... endpoints existentes

  // Nuevo módulo
  NUEVO_MODULO: {
    LIST: '/nuevo-modulo',
    DETAIL: (id) => `/nuevo-modulo/${id}`,
    CREATE: '/nuevo-modulo',
    UPDATE: (id) => `/nuevo-modulo/${id}`,
    DELETE: (id) => `/nuevo-modulo/${id}`,
  },
};
```

2. Crear servicio correspondiente:
```javascript
// src/services/nuevo-modulo.service.js
import api from './api';
import { API_ENDPOINTS } from '../config/api.config';

export const nuevoModuloService = {
  getAll: async () => {
    return await api.get(API_ENDPOINTS.NUEVO_MODULO.LIST);
  },
  // ... otros métodos
};
```

## Troubleshooting

### Error de Conexión
Si recibes errores de conexión:
1. Verifica que el backend esté corriendo
2. Revisa que `VITE_API_URL` apunte al servidor correcto
3. Confirma que no haya problemas de CORS

### Variables no se Actualizan
Después de cambiar `.env`, debes reiniciar el servidor de desarrollo:
```bash
npm run dev
```

### URL Incorrecta
Las variables de Vite deben empezar con `VITE_` para ser accesibles en el frontend.
