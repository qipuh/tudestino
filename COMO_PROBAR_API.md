# 🧪 Guía para Probar la API del Módulo de Negocios

## 📥 Opción 1: Importar en Postman

### Paso 1: Importar la Colección
1. Abre **Postman**
2. Click en **Import** (arriba izquierda)
3. Selecciona el archivo: `postman/businesses-api.postman_collection.json`
4. Click **Import**

### Paso 2: Configurar Variables
Después de importar, configura estas variables en el entorno:

```
base_url = http://localhost:3000/api
token = (tu token JWT aquí)
businessId = (ID del negocio a probar)
serviceId = (ID del servicio a probar)
postId = (ID del post a probar)
```

**Para configurar variables:**
1. Click en el nombre de la colección
2. Tab "Variables"
3. Edita los valores en "Current Value"

### Paso 3: Obtener Token de Autenticación
Primero necesitas autenticarte (asumiendo que ya tienes el endpoint de auth):

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tupassword"
}
```

Copia el `token` de la respuesta y pégalo en la variable `{{token}}` de Postman.

---

## 📋 Opción 2: Usar cURL (Terminal)

### Variables de Entorno
Primero, configura estas variables en tu terminal:

```bash
# Windows (PowerShell)
$BASE_URL = "http://localhost:3000/api"
$TOKEN = "tu-token-jwt-aqui"
$BUSINESS_ID = ""
$SERVICE_ID = ""
$POST_ID = ""

# Linux/Mac (Bash)
export BASE_URL="http://localhost:3000/api"
export TOKEN="tu-token-jwt-aqui"
export BUSINESS_ID=""
export SERVICE_ID=""
export POST_ID=""
```

### 1️⃣ Crear un Negocio

```bash
# Windows (PowerShell)
curl -X POST "$BASE_URL/businesses" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
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
      "monday": {"open": "00:00", "close": "23:59"},
      "tuesday": {"open": "00:00", "close": "23:59"}
    },
    "socialMediaLinks": {
      "facebook": "https://facebook.com/hotelcajamarca",
      "instagram": "https://instagram.com/hotelcajamarca"
    }
  }'

# Linux/Mac (Bash)
curl -X POST "$BASE_URL/businesses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Hotel Cajamarca Paradise",
    "slug": "hotel-cajamarca-paradise",
    "description": "Hotel de lujo en el corazón de Cajamarca",
    "businessType": "hotel",
    "address": {
      "street": "Jr. Amazonas 123",
      "city": "Cajamarca",
      "country": "Perú",
      "latitude": -7.1619,
      "longitude": -78.5128
    },
    "contactPhone": "+51 976 123 456",
    "contactEmail": "info@hotelcajamarca.com"
  }'
```

**Guarda el `id` de la respuesta como `BUSINESS_ID`**

---

### 2️⃣ Crear un Servicio

```bash
# Windows (PowerShell)
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/services" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "serviceType": "property",
    "name": "Habitaciones del Hotel",
    "description": "Servicio de alojamiento",
    "status": "active"
  }'

# Linux/Mac
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/services" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceType": "property",
    "name": "Habitaciones del Hotel",
    "description": "Servicio de alojamiento",
    "status": "active"
  }'
```

**Guarda el `id` como `SERVICE_ID`**

---

### 3️⃣ Crear un Post

```bash
# Windows (PowerShell)
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/posts" `
  -H "Authorization: Bearer $TOKEN" `
  -H "Content-Type: application/json" `
  -d '{
    "caption": "¡Descubre nuestras nuevas habitaciones! 🏨✨",
    "media": [
      {
        "url": "https://example.com/room1.jpg",
        "type": "image",
        "thumbnail": "https://example.com/thumb1.jpg",
        "alt": "Habitación deluxe"
      }
    ],
    "type": "post",
    "location": "Cajamarca, Perú",
    "tags": ["#hotel", "#cajamarca"]
  }'

# Linux/Mac
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "caption": "¡Descubre nuestras nuevas habitaciones! 🏨✨",
    "media": [
      {
        "url": "https://example.com/room1.jpg",
        "type": "image",
        "thumbnail": "https://example.com/thumb1.jpg",
        "alt": "Habitación deluxe"
      }
    ],
    "type": "post",
    "location": "Cajamarca, Perú",
    "tags": ["#hotel", "#cajamarca"]
  }'
```

---

### 4️⃣ Seguir un Negocio

```bash
# Windows
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/follow" `
  -H "Authorization: Bearer $TOKEN"

# Linux/Mac
curl -X POST "$BASE_URL/businesses/$BUSINESS_ID/follow" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 5️⃣ Obtener Feed de Posts

```bash
# Windows
curl -X GET "$BASE_URL/businesses/posts/feed?page=1&limit=20" `
  -H "Authorization: Bearer $TOKEN"

# Linux/Mac
curl -X GET "$BASE_URL/businesses/posts/feed?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6️⃣ Buscar Negocios (Público)

```bash
# Windows
curl -X GET "$BASE_URL/businesses/search?type=hotel&q=cajamarca&page=1&limit=20"

# Linux/Mac
curl -X GET "$BASE_URL/businesses/search?type=hotel&q=cajamarca&page=1&limit=20"
```

---

## 🔧 Opción 3: Script de Node.js

Crea un archivo `test-api.js`:

```javascript
const API_BASE = 'http://localhost:3000/api';
const TOKEN = 'tu-token-aqui';

async function testAPI() {
  try {
    // 1. Crear negocio
    console.log('1. Creando negocio...');
    const businessRes = await fetch(`${API_BASE}/businesses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Hotel Test',
        slug: 'hotel-test-' + Date.now(),
        description: 'Hotel de prueba',
        businessType: 'hotel',
        address: {
          street: 'Calle Test 123',
          city: 'Cajamarca',
          country: 'Perú',
          latitude: -7.1619,
          longitude: -78.5128
        },
        contactPhone: '+51 999 999 999',
        contactEmail: 'test@test.com'
      })
    });

    const business = await businessRes.json();
    console.log('✅ Negocio creado:', business.data.id);
    const businessId = business.data.id;

    // 2. Crear servicio
    console.log('\n2. Creando servicio...');
    const serviceRes = await fetch(`${API_BASE}/businesses/${businessId}/services`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceType: 'property',
        name: 'Habitaciones',
        description: 'Servicio de alojamiento',
        status: 'active'
      })
    });

    const service = await serviceRes.json();
    console.log('✅ Servicio creado:', service.data.id);

    // 3. Crear post
    console.log('\n3. Creando post...');
    const postRes = await fetch(`${API_BASE}/businesses/${businessId}/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        caption: 'Post de prueba desde script',
        media: [{
          url: 'https://example.com/image.jpg',
          type: 'image',
          thumbnail: 'https://example.com/thumb.jpg',
          alt: 'Imagen de prueba'
        }],
        type: 'post',
        location: 'Cajamarca',
        tags: ['#test']
      })
    });

    const post = await postRes.json();
    console.log('✅ Post creado:', post.data.id);

    // 4. Seguir negocio
    console.log('\n4. Siguiendo negocio...');
    const followRes = await fetch(`${API_BASE}/businesses/${businessId}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    const follow = await followRes.json();
    console.log('✅ Ahora sigues el negocio:', follow.message);

    console.log('\n🎉 ¡Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
```

**Ejecutar:**
```bash
node test-api.js
```

---

## 📱 Opción 4: Thunder Client (VS Code Extension)

Si usas VS Code:

1. Instala la extensión **Thunder Client**
2. Click en el icono de Thunder Client en la barra lateral
3. Click en "Import" → "From File"
4. Selecciona `postman/businesses-api.postman_collection.json`
5. Configura las variables de entorno

---

## 🗂️ Flujo de Prueba Completo

### Requisitos Previos
1. ✅ Servidor corriendo en `http://localhost:3000`
2. ✅ Base de datos con tablas creadas
3. ✅ Usuario con rol `business_owner` creado
4. ✅ Token JWT válido obtenido

### Flujo Recomendado

```
1. Autenticación
   └─> POST /api/auth/login
       └─> Guardar TOKEN

2. Crear Negocio
   └─> POST /api/businesses
       └─> Guardar BUSINESS_ID

3. Crear Servicios
   └─> POST /api/businesses/{BUSINESS_ID}/services
       └─> Guardar SERVICE_ID

4. Publicar Contenido
   └─> POST /api/businesses/{BUSINESS_ID}/posts
       └─> Guardar POST_ID

5. Interacción Social
   ├─> POST /api/businesses/{BUSINESS_ID}/follow (seguir)
   ├─> POST /api/businesses/posts/{POST_ID}/like (like)
   └─> GET /api/businesses/posts/feed (ver feed)

6. Consultas Públicas
   ├─> GET /api/businesses/search?q=hotel
   ├─> GET /api/businesses/{BUSINESS_ID}
   └─> GET /api/businesses/{BUSINESS_ID}/posts
```

---

## 🔍 Verificar que Todo Funciona

### 1. Health Check
```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:00:00.000Z"
}
```

### 2. Verificar Tablas en MySQL
```bash
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "USE tudestino; SHOW TABLES LIKE 'business%';"
```

**Debe mostrar:**
```
businesses
business_follows
business_services
business_social_posts
```

---

## ⚠️ Errores Comunes

### Error: "Cannot POST /api/businesses"
**Solución:** Verifica que el servidor esté corriendo y las rutas estén registradas.

### Error: "Token inválido"
**Solución:** Obtén un nuevo token con `/api/auth/login`

### Error: "Solo los usuarios con rol business_owner..."
**Solución:** Tu usuario necesita tener `role: "business_owner"` en la tabla users.

### Error: "Negocio no encontrado"
**Solución:** Verifica que el `businessId` exista y sea correcto.

---

## 📊 Monitorear Requests

Para ver los logs de las peticiones en tiempo real:

```bash
# En la terminal donde corre el servidor verás:
🚀 Server running on port 3000
✅ MySQL Connected successfully
```

---

## 🎯 Siguiente Paso

Una vez que hayas probado los endpoints:
1. Verifica los datos en la base de datos
2. Prueba el flujo completo desde el frontend (cuando esté listo)
3. Configura datos de prueba realistas

---

## 💡 Tips

- **Postman:** Usa "Tests" para guardar automáticamente IDs en variables
- **cURL:** Usa `jq` para formatear JSON: `curl ... | jq`
- **VS Code:** Usa la extensión REST Client con archivos `.http`

---

¿Necesitas ayuda? Revisa:
- [MODULO_NEGOCIOS_API.md](MODULO_NEGOCIOS_API.md) - Documentación completa
- [MODULO_NEGOCIOS_COMPLETO.md](MODULO_NEGOCIOS_COMPLETO.md) - Resumen técnico
