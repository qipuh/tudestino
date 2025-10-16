# Documentación API - TuDestino

Base URL: `http://localhost:3000/api`

## 🔐 Autenticación

Todas las rutas protegidas requieren un token JWT en el header:

```
Authorization: Bearer <token>
```

## 📝 Endpoints

### Auth

#### POST /api/auth/register
Registrar nuevo usuario

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "guest"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
Iniciar sesión

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Users

#### GET /api/users/profile
Obtener perfil del usuario autenticado

**Headers:** `Authorization: Bearer <token>`

#### PUT /api/users/profile
Actualizar perfil

**Body:**
```json
{
  "name": "John Updated",
  "phone": "+1234567890"
}
```

### Properties

#### GET /api/properties
Listar propiedades

**Query params:**
- `page` (default: 1)
- `limit` (default: 20)
- `city` (opcional)
- `minPrice` (opcional)
- `maxPrice` (opcional)

#### POST /api/properties
Crear propiedad (requiere rol `host` o `admin`)

**Body:**
```json
{
  "title": "Beautiful Apartment",
  "description": "...",
  "type": "apartment",
  "location": {
    "address": "123 Main St",
    "city": "Madrid",
    "country": "Spain"
  },
  "pricing": {
    "basePrice": 80
  },
  "capacity": {
    "guests": 4,
    "bedrooms": 2,
    "beds": 2,
    "bathrooms": 1
  }
}
```

#### GET /api/properties/:id
Obtener detalle de propiedad

#### PUT /api/properties/:id
Actualizar propiedad (solo el host propietario)

#### DELETE /api/properties/:id
Eliminar propiedad (solo el host propietario)

### Bookings

#### POST /api/bookings
Crear reserva

**Body:**
```json
{
  "propertyId": "property_id",
  "checkIn": "2024-03-20",
  "checkOut": "2024-03-25",
  "guests": 2
}
```

#### GET /api/bookings
Obtener reservas del usuario

#### GET /api/bookings/:id
Detalle de reserva

#### PUT /api/bookings/:id/cancel
Cancelar reserva

### Reviews

#### POST /api/reviews
Crear reseña

**Body:**
```json
{
  "propertyId": "property_id",
  "bookingId": "booking_id",
  "rating": 5,
  "comment": "Great place!"
}
```

#### GET /api/reviews/property/:propertyId
Obtener reseñas de una propiedad

### Admin (solo admin)

#### GET /api/admin/users
Listar todos los usuarios

#### PUT /api/admin/users/:id/verify
Verificar usuario/host

#### GET /api/admin/properties/pending
Propiedades pendientes de aprobación

## 🔄 Códigos de Respuesta

- `200 OK` - Éxito
- `201 Created` - Recurso creado
- `400 Bad Request` - Error en request
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - No autorizado
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

## 📊 Formato de Respuesta

### Éxito
```json
{
  "success": true,
  "data": { ... }
}
```

### Error
```json
{
  "success": false,
  "message": "Error message",
  "stack": "..." // solo en desarrollo
}
```
