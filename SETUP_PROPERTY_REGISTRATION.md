# Guía de Configuración - Sistema de Registro de Propiedades

## ✅ Lo que se ha implementado:

### Backend
1. ✅ Modelos de base de datos actualizados:
   - `property.model.sequelize.js` - Modelo de Property con todos los campos nuevos
   - Modelo de Room con relaciones

2. ✅ API Endpoints creados:
   - `POST /api/properties/register` - Registrar propiedad completa con habitaciones
   - `GET /api/properties/:id/full` - Obtener propiedad con habitaciones
   - `PUT /api/properties/:id/full` - Actualizar propiedad completa

3. ✅ Controladores:
   - `property.controller.register.js` - Maneja transacciones para crear property + rooms

### Frontend
1. ✅ Formulario multi-paso completo (6 pasos)
2. ✅ Integración con API
3. ✅ Validaciones en ReviewStep
4. ✅ Indicador de carga durante envío

## 🚀 Pasos para hacer funcionar el sistema:

### 1. Ejecutar la migración de base de datos

Desde la raíz del proyecto:

```bash
cd apps/api
node src/scripts/migrate-properties.js
```

Esto creará/actualizará las tablas:
- `properties` con todos los nuevos campos
- `rooms` con relaciones a properties

### 2. Verificar configuración de base de datos

Asegúrate que `apps/api/.env` tiene:

```env
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

### 3. Iniciar la aplicación

```bash
# Desde la raíz del proyecto
npm run dev
```

O individualmente:
```bash
# API
npm run dev:api

# Web
npm run dev:web
```

### 4. Probar el flujo completo

1. **Login como host:**
   - Ir a `http://localhost:5173/login`
   - Iniciar sesión con un usuario host

2. **Registrar propiedad:**
   - Ir a `http://localhost:5173/host/properties/register`
   - Completar los 6 pasos
   - Click en "Publicar alojamiento"

3. **Verificar en base de datos:**
   ```sql
   SELECT * FROM properties;
   SELECT * FROM rooms;
   ```

## 📋 Estructura de la Base de Datos

### Tabla: `properties`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| hostId | UUID | ID del anfitrión |
| accommodationType | ENUM | Tipo de alojamiento |
| multipleUnits | BOOLEAN | Si es multi-unidad |
| hotelName | STRING | Nombre del hotel/motel |
| hotelCategory | INTEGER | Categoría 1-5 estrellas |
| cancellationPolicy | ENUM | Política de cancelación |
| addressStreet | STRING | Calle |
| addressCity | STRING | Ciudad |
| addressState | STRING | Estado/Provincia |
| addressCountry | STRING | País |
| addressZipCode | STRING | Código postal |
| addressLatitude | DECIMAL | Latitud |
| addressLongitude | DECIMAL | Longitud |
| propertyAmenities | JSON | Array de amenidades |
| breakfastIncluded | BOOLEAN | Incluye desayuno |
| parkingType | ENUM | no/free/paid |
| parkingDetails | JSON | Detalles del parking |
| checkInTime | TIME | Hora de check-in |
| checkOutTime | TIME | Hora de check-out |
| childrenAllowed | BOOLEAN | Admite niños |
| petsAllowed | ENUM | no/yes_free/yes_paid |
| petFee | DECIMAL | Cargo por mascota |
| petFeePer | ENUM | day/stay |
| additionalRules | TEXT | Normas adicionales |
| status | ENUM | draft/published/suspended |
| ratingAverage | DECIMAL | Rating promedio |
| ratingCount | INTEGER | Cantidad de reviews |

### Tabla: `rooms`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| propertyId | UUID | FK a properties |
| roomType | ENUM | Tipo de habitación |
| name | STRING | Nombre descriptivo |
| guestCapacity | INTEGER | Capacidad de huéspedes |
| beds | JSON | Array de camas [{type, count}] |
| pricePerNight | DECIMAL | Precio por noche |
| amenities | JSON | Array de amenidades |
| images | JSON | Array de URLs de imágenes |
| isAvailable | BOOLEAN | Disponible |

## 🔧 Solución de Problemas

### Error: "Cannot find module"
```bash
cd apps/api
npm install
```

### Error: "Authentication failed"
Verificar que el usuario está logueado y tiene rol 'host' o 'admin'

### Error: "Table doesn't exist"
Ejecutar el script de migración:
```bash
node src/scripts/migrate-properties.js
```

### Error: "Cannot read property 'id'"
El endpoint requiere autenticación. Verificar token JWT en localStorage.

## 📝 Ejemplo de Request

```json
POST /api/properties/register

{
  "accommodationType": "hotel",
  "multipleUnits": true,
  "hotelName": "Hotel Plaza Mayor",
  "hotelCategory": 4,
  "cancellationPolicy": "standard",
  "address": {
    "street": "Av. Libertador 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "country": "Argentina",
    "zipCode": "1425"
  },
  "propertyAmenities": ["wifi", "pool", "gym"],
  "breakfastIncluded": true,
  "parkingType": "free",
  "checkInTime": "14:00",
  "checkOutTime": "12:00",
  "childrenAllowed": true,
  "petsAllowed": "no",
  "rooms": [
    {
      "roomType": "double",
      "name": "Habitación Doble Estándar",
      "guestCapacity": 2,
      "beds": [{ "type": "double", "count": 1 }],
      "pricePerNight": 85.00,
      "amenities": ["wifi", "tv", "air_conditioning"],
      "images": ["url1.jpg", "url2.jpg", "url3.jpg"]
    }
  ]
}
```

## 🎯 Próximos Pasos

1. ✅ Sistema funcionando localmente
2. 🔄 Implementar subida de imágenes real (actualmente usa URLs temporales)
3. 🔄 Agregar validación de email antes de permitir publicar
4. 🔄 Implementar gestión de disponibilidad de habitaciones
5. 🔄 Agregar sistema de búsqueda por habitaciones

## 📚 Archivos Clave

### Backend
- `apps/api/src/modules/properties/property.model.sequelize.js` - Modelos
- `apps/api/src/modules/properties/property.controller.register.js` - Controlador
- `apps/api/src/modules/properties/properties.routes.js` - Rutas
- `apps/api/src/scripts/migrate-properties.js` - Script de migración

### Frontend
- `apps/web/src/modules/properties/pages/PropertyRegistrationPage.jsx` - Página principal
- `apps/web/src/modules/properties/components/registration/*` - Componentes de pasos
- `packages/shared/constants/*` - Constantes compartidas

## ✨ Características Implementadas

- ✅ 11 tipos de alojamiento
- ✅ 6 políticas de cancelación
- ✅ 20+ amenidades de propiedad
- ✅ 25+ amenidades de habitación
- ✅ 12 tipos de habitación
- ✅ 6 tipos de cama
- ✅ Sistema de parking configurable
- ✅ Normas de mascotas y niños
- ✅ Validación completa antes de publicar
- ✅ Soporte para alojamientos multi-unidad
