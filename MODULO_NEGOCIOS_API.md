# 📚 Módulo de Negocios - Documentación API

## Descripción General

El módulo de negocios permite que los usuarios con rol `business_owner` puedan crear y gestionar sus negocios, agregar servicios, publicar contenido en redes sociales y recibir seguidores.

## Estructura del Modelo de Negocio

```
Usuario (business_owner)
  └── Negocio (Business)
      ├── Servicios (BusinessServices)
      │   ├── Propiedades
      │   ├── Restaurantes
      │   ├── Entretenimiento
      │   └── Eventos
      ├── Posts Sociales (BusinessSocialPosts)
      ├── Seguidores (BusinessFollows)
      └── Reseñas (ServiceReviews)
```

---

## 🏢 API de Negocios (Businesses)

### Base URL
```
/api/businesses
```

### Endpoints

#### 1. Crear un Negocio
```http
POST /api/businesses
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Hotel Cajamarca Paradise",
  "slug": "hotel-cajamarca-paradise",
  "description": "Hotel de lujo en el corazón de Cajamarca",
  "businessType": "hotel",
  "logo": "https://example.com/logo.png",
  "coverImage": "https://example.com/cover.jpg",
  "taxId": "20123456789",
  "address": {
    "street": "Jr. Amazonas 123",
    "city": "Cajamarca",
    "state": "Cajamarca",
    "country": "Perú",
    "zipCode": "06001",
    "latitude": -7.1619,
    "longitude": -78.5128
  },
  "contactPhone": "+51 976 123 456",
  "contactEmail": "info@hotelcajamarca.com",
  "website": "https://hotelcajamarca.com",
  "operatingHours": {
    "monday": { "open": "00:00", "close": "23:59" },
    "tuesday": { "open": "00:00", "close": "23:59" },
    "wednesday": { "open": "00:00", "close": "23:59" },
    "thursday": { "open": "00:00", "close": "23:59" },
    "friday": { "open": "00:00", "close": "23:59" },
    "saturday": { "open": "00:00", "close": "23:59" },
    "sunday": { "open": "00:00", "close": "23:59" }
  },
  "socialMediaLinks": {
    "facebook": "https://facebook.com/hotelcajamarca",
    "instagram": "https://instagram.com/hotelcajamarca",
    "twitter": "https://twitter.com/hotelcajamarca"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Negocio creado exitosamente",
  "data": {
    "id": "uuid-here",
    "ownerId": "user-uuid",
    "name": "Hotel Cajamarca Paradise",
    "slug": "hotel-cajamarca-paradise",
    "status": "pending_verification",
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

---

#### 2. Obtener Mis Negocios
```http
GET /api/businesses/my-businesses
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "Hotel Cajamarca Paradise",
      "slug": "hotel-cajamarca-paradise",
      "logo": "https://example.com/logo.png",
      "status": "active",
      "followersCount": 1523,
      "services": [...]
    }
  ]
}
```

---

#### 3. Obtener un Negocio por ID
```http
GET /api/businesses/:id?include=true
```

**Query Params:**
- `include=true` - Incluye servicios y posts recientes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Hotel Cajamarca Paradise",
    "slug": "hotel-cajamarca-paradise",
    "description": "Hotel de lujo...",
    "ratingAverage": 4.5,
    "reviewCount": 234,
    "followersCount": 1523,
    "services": [...],
    "posts": [...]
  }
}
```

---

#### 4. Actualizar Negocio
```http
PUT /api/businesses/:id
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "description": "Nueva descripción actualizada",
  "contactPhone": "+51 976 987 654"
}
```

---

#### 5. Buscar Negocios
```http
GET /api/businesses/search?type=hotel&q=cajamarca&page=1&limit=20
```

**Query Params:**
- `type` - Tipo de negocio (hotel, restaurant, etc.)
- `q` - Término de búsqueda
- `status` - Estado del negocio (default: active)
- `page` - Página (default: 1)
- `limit` - Límite por página (default: 20)

---

## 🎯 API de Servicios de Negocio

### Base URL
```
/api/businesses/:businessId/services
```

### Endpoints

#### 1. Crear un Servicio
```http
POST /api/businesses/:businessId/services
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "serviceType": "property",
  "name": "Habitaciones del Hotel",
  "description": "Servicio de alojamiento",
  "status": "active"
}
```

**Tipos de servicio disponibles:**
- `property` - Propiedades/Alojamiento
- `restaurant` - Restaurante
- `entertainment` - Entretenimiento
- `events` - Eventos
- `hotel` - Hotel
- `bar` - Bar
- `club` - Club/Discoteca
- `spa` - Spa
- `tour` - Tours
- `transport` - Transporte
- `other` - Otros

---

#### 2. Obtener Servicios de un Negocio
```http
GET /api/businesses/:businessId/services?type=property&status=active
```

---

#### 3. Actualizar Servicio
```http
PUT /api/businesses/services/:serviceId
Authorization: Bearer {token}
```

---

#### 4. Reordenar Servicios
```http
POST /api/businesses/:businessId/services/reorder
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "servicesOrder": [
    { "serviceId": "uuid-1" },
    { "serviceId": "uuid-2" },
    { "serviceId": "uuid-3" }
  ]
}
```

---

## 📱 API de Posts de Negocios

### Base URL
```
/api/businesses/:businessId/posts
```

### Endpoints

#### 1. Crear un Post
```http
POST /api/businesses/:businessId/posts
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "caption": "¡Descubre nuestras nuevas habitaciones renovadas! 🏨✨",
  "media": [
    {
      "url": "https://example.com/media/image1.jpg",
      "type": "image",
      "thumbnail": "https://example.com/media/thumb1.jpg",
      "alt": "Habitación deluxe"
    }
  ],
  "type": "post",
  "location": "Cajamarca, Perú",
  "tags": ["#hotel", "#cajamarca", "#lujo"]
}
```

**Tipos de post:**
- `post` - Publicación normal
- `reel` - Video corto
- `story` - Historia temporal

---

#### 2. Obtener Posts de un Negocio
```http
GET /api/businesses/:businessId/posts?page=1&limit=20&type=post
```

---

#### 3. Obtener Feed de Posts
```http
GET /api/businesses/posts/feed?page=1&limit=20
Authorization: Bearer {token}
```

Retorna posts de los negocios que sigue el usuario.

---

#### 4. Like/Unlike un Post
```http
POST /api/businesses/posts/:postId/like
Authorization: Bearer {token}
```

---

## 👥 API de Seguidores de Negocios

### Base URL
```
/api/businesses/:businessId/follow
```

### Endpoints

#### 1. Seguir un Negocio
```http
POST /api/businesses/:businessId/follow
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "message": "Ahora sigues este negocio",
  "data": {
    "following": true
  }
}
```

---

#### 2. Dejar de Seguir un Negocio
```http
DELETE /api/businesses/:businessId/follow
Authorization: Bearer {token}
```

---

#### 3. Verificar si Sigo un Negocio
```http
GET /api/businesses/:businessId/following
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isFollowing": true
  }
}
```

---

#### 4. Obtener Mis Negocios Seguidos
```http
GET /api/businesses/following/my-followed?page=1&limit=20
Authorization: Bearer {token}
```

---

#### 5. Obtener Seguidores de un Negocio
```http
GET /api/businesses/:businessId/followers?page=1&limit=20
```

---

#### 6. Configurar Notificaciones
```http
PATCH /api/businesses/:businessId/follow/notifications
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "notificationsEnabled": false
}
```

---

## 🔐 Middlewares de Autorización

### 1. `requireBusinessOwnerRole`
Verifica que el usuario tenga rol `business_owner` o `admin`.

### 2. `isBusinessOwner`
Verifica que el usuario sea dueño del negocio.

### 3. `canManageService`
Verifica que el usuario pueda gestionar un servicio específico.

### 4. `requireActiveVerifiedBusiness`
Verifica que el negocio esté activo y verificado.

### Uso en Rutas:
```javascript
import { authenticate } from '../middlewares/auth.js';
import { isBusinessOwner, requireBusinessOwnerRole } from '../middlewares/business-auth.js';

router.post(
  '/:businessId/services',
  authenticate,
  requireBusinessOwnerRole,
  isBusinessOwner,
  businessServiceController.createService
);
```

---

## 🎨 Flujo de Uso Completo

### 1. Usuario Crea un Negocio
```bash
# Usuario cambia su rol a business_owner (si es necesario)
PUT /api/users/profile
{ "role": "business_owner" }

# Crea su negocio
POST /api/businesses
{ ...datos del negocio... }
```

### 2. Agrega Servicios al Negocio
```bash
# Crear servicio de alojamiento
POST /api/businesses/{businessId}/services
{
  "serviceType": "property",
  "name": "Habitaciones",
  "status": "active"
}

# Crear servicio de restaurante
POST /api/businesses/{businessId}/services
{
  "serviceType": "restaurant",
  "name": "Restaurante del Hotel",
  "status": "active"
}
```

### 3. Publica Contenido
```bash
# Crear post promocional
POST /api/businesses/{businessId}/posts
{
  "caption": "¡Oferta especial!",
  "media": [...]
}
```

### 4. Usuarios Siguen el Negocio
```bash
# Usuario sigue el negocio
POST /api/businesses/{businessId}/follow

# Usuario ve posts en su feed
GET /api/businesses/posts/feed
```

---

## 📊 Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos inválidos
- `401 Unauthorized` - No autenticado
- `403 Forbidden` - Sin permisos
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## 🚀 Próximas Mejoras

- [ ] Sistema de reseñas y calificaciones
- [ ] Estadísticas y analytics para negocios
- [ ] Sistema de promociones y descuentos
- [ ] Chat directo con el negocio
- [ ] Sistema de reservas integrado
- [ ] Verificación automática con documentos

---

## 📝 Notas Importantes

1. **Autenticación**: Todos los endpoints protegidos requieren token JWT en el header `Authorization: Bearer {token}`

2. **Roles**: Solo usuarios con rol `business_owner` o `admin` pueden crear y gestionar negocios

3. **Verificación**: Los negocios nuevos requieren verificación admin antes de estar `active`

4. **Slugs**: Los slugs deben ser únicos. El sistema genera uno automático si no se proporciona

5. **Paginación**: Por defecto, todos los endpoints con paginación retornan 20 items por página

6. **Archivos**: Las URLs de imágenes deben apuntar a archivos ya subidos a tu servidor o CDN
