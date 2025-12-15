# 🎯 Guía Paso a Paso: REST Client en VS Code

## ✅ Servidor Verificado
Tu servidor está corriendo en: **http://localhost:3000** ✅

---

## 📥 Paso 1: Instalar REST Client

1. **Abre VS Code**
2. Presiona `Ctrl + Shift + X` (abre el panel de extensiones)
3. En la barra de búsqueda escribe: **REST Client**
4. Busca la extensión de **Huachao Mao** (tiene más de 3M descargas)
5. Click en el botón **Install**

![REST Client Extension](https://github.com/Huachao/vscode-restclient/raw/master/images/usage.gif)

---

## 📂 Paso 2: Abrir el Archivo de Pruebas

1. En VS Code, abre el archivo: **`test-businesses-api.http`**
2. Verás algo como esto:

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = TU_TOKEN_AQUI

### Crear Negocio
POST {{baseUrl}}/businesses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Hotel Test"
  ...
}
```

---

## 🔑 Paso 3: Obtener Tu Token JWT

**IMPORTANTE:** Necesitas un token de autenticación primero.

### Opción A: Si tienes usuario registrado

Agrega esto al inicio del archivo `test-businesses-api.http`:

```http
### Login para obtener token
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tupassword"
}
```

1. Click en **"Send Request"** que aparece arriba de `POST http://localhost...`
2. En el panel de la derecha verás la respuesta con el token
3. **Copia el token** (sin las comillas)

### Opción B: Crear usuario nuevo

Si no tienes usuario, primero regístralo:

```http
### Registrar usuario business_owner
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@test.com",
  "password": "password123",
  "role": "business_owner"
}
```

---

## ✏️ Paso 4: Configurar el Token

1. En el archivo `test-businesses-api.http`, busca la línea 7:
   ```http
   @token = TU_TOKEN_AQUI
   ```

2. **Reemplaza** `TU_TOKEN_AQUI` con tu token real:
   ```http
   @token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI...
   ```

3. Guarda el archivo (`Ctrl + S`)

---

## 🚀 Paso 5: ¡Probar los Endpoints!

Ahora puedes probar cualquier endpoint. Busca por ejemplo:

### 🏢 Crear un Negocio

```http
### Crear Negocio
POST {{baseUrl}}/businesses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Hotel Cajamarca Paradise",
  "slug": "hotel-cajamarca-paradise",
  "description": "Hotel de lujo en Cajamarca",
  "businessType": "hotel",
  ...
}
```

1. **Click en "Send Request"** (aparece justo arriba de `POST {{baseUrl}}/businesses`)
2. En el panel de la **derecha** verás la respuesta
3. **Copia el `id`** del negocio creado

### 📝 Guardar el Business ID

En la sección de variables, actualiza:
```http
@businessId = ID_QUE_COPIASTE
```

### 🎯 Crear un Servicio

Ahora puedes crear un servicio:

```http
### Crear Servicio
POST {{baseUrl}}/businesses/{{businessId}}/services
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "serviceType": "property",
  "name": "Habitaciones del Hotel",
  "description": "Servicio de alojamiento",
  "status": "active"
}
```

Click en **"Send Request"** y listo! ✅

---

## 📸 Cómo Se Ve REST Client

Cuando envías un request, VS Code se divide en 2 paneles:

```
┌─────────────────────────┬─────────────────────────┐
│  test-businesses-api.http│      RESPONSE           │
│                         │                         │
│  ### Crear Negocio      │  HTTP/1.1 201 Created   │
│  POST {{baseUrl}}/...   │  {                      │
│                         │    "success": true,     │
│  [Send Request] ←CLICK  │    "message": "...",    │
│                         │    "data": {            │
│  {                      │      "id": "uuid...",   │
│    "name": "Hotel..."   │      "name": "Hotel..." │
│  }                      │    }                    │
│                         │  }                      │
└─────────────────────────┴─────────────────────────┘
```

---

## 🎨 Tips y Trucos

### 1. **Separar Requests**
Usa `###` para separar diferentes requests:
```http
### Request 1
GET {{baseUrl}}/businesses/search

### Request 2
POST {{baseUrl}}/businesses
```

### 2. **Comentarios**
Usa `#` para comentarios:
```http
# Este es un comentario
### Crear Negocio (este es el título del request)
POST {{baseUrl}}/businesses
```

### 3. **Variables Dinámicas**
REST Client permite variables como:
```http
@timestamp = {{$timestamp}}
@guid = {{$guid}}
@randomInt = {{$randomInt 1 100}}
```

### 4. **Guardar Respuestas**
Click derecho en la respuesta → **Save Response** → Guardar como JSON

### 5. **Ver Historia**
`Ctrl + Alt + H` para ver el historial de requests

### 6. **Copiar como cURL**
Click derecho en un request → **Copy Request as cURL**

---

## 🧪 Secuencia de Prueba Completa

Sigue este orden para probar todo:

```
1. ✅ Login (obtener token)
   → Copiar token a @token

2. ✅ Crear Negocio
   POST /businesses
   → Copiar id a @businessId

3. ✅ Ver Mis Negocios
   GET /businesses/my-businesses

4. ✅ Crear Servicio
   POST /businesses/{{businessId}}/services
   → Copiar id a @serviceId

5. ✅ Crear Post
   POST /businesses/{{businessId}}/posts
   → Copiar id a @postId

6. ✅ Like al Post
   POST /businesses/posts/{{postId}}/like

7. ✅ Seguir Negocio
   POST /businesses/{{businessId}}/follow

8. ✅ Ver Feed
   GET /businesses/posts/feed

9. ✅ Buscar Negocios (público)
   GET /businesses/search?type=hotel&q=cajamarca
```

---

## ⚠️ Errores Comunes

### "Send Request" no aparece
**Solución:** Asegúrate de que:
1. La extensión REST Client esté instalada
2. El archivo tenga extensión `.http` o `.rest`
3. El formato del request sea correcto

### "Authorization failed"
**Solución:**
1. Verifica que el token sea válido
2. Asegúrate de que diga `Bearer {{token}}` no solo `{{token}}`
3. Obtén un nuevo token haciendo login

### "Cannot connect to localhost:3000"
**Solución:**
```bash
# Verifica que el servidor esté corriendo
curl http://localhost:3000/health

# Si no está corriendo, inícialo
cd apps/api
npm run dev
```

### Variables no se reemplazan
**Solución:**
1. Asegúrate de usar `{{nombreVariable}}` (doble llave)
2. Las variables deben estar definidas con `@nombreVariable = valor`
3. Guarda el archivo después de editar variables

---

## 🎯 Ejemplo Práctico Completo

Aquí está un ejemplo mínimo que puedes copiar al inicio de tu archivo:

```http
### ============================================
### CONFIGURACIÓN
### ============================================
@baseUrl = http://localhost:3000/api
@token =
@businessId =
@serviceId =
@postId =

### ============================================
### 1. LOGIN - EJECUTA PRIMERO
### ============================================
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tupassword"
}

# Después de obtener el token, cópialo arriba en @token

### ============================================
### 2. CREAR NEGOCIO
### ============================================
POST {{baseUrl}}/businesses
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Mi Hotel Test",
  "slug": "mi-hotel-test",
  "description": "Hotel de prueba",
  "businessType": "hotel",
  "address": {
    "street": "Calle Principal 123",
    "city": "Cajamarca",
    "country": "Perú",
    "latitude": -7.1619,
    "longitude": -78.5128
  },
  "contactPhone": "+51 999 999 999",
  "contactEmail": "info@mihotel.com"
}

# Después de crear, copia el id arriba en @businessId

### ============================================
### 3. VER MIS NEGOCIOS
### ============================================
GET {{baseUrl}}/businesses/my-businesses
Authorization: Bearer {{token}}

### ============================================
### 4. CREAR SERVICIO
### ============================================
POST {{baseUrl}}/businesses/{{businessId}}/services
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "serviceType": "property",
  "name": "Habitaciones",
  "description": "Servicio de alojamiento",
  "status": "active"
}

### ============================================
### 5. CREAR POST
### ============================================
POST {{baseUrl}}/businesses/{{businessId}}/posts
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "caption": "¡Bienvenidos a nuestro hotel! 🏨",
  "media": [
    {
      "url": "https://picsum.photos/800/600",
      "type": "image",
      "thumbnail": "https://picsum.photos/200/150",
      "alt": "Hotel exterior"
    }
  ],
  "type": "post",
  "location": "Cajamarca, Perú",
  "tags": ["#hotel", "#cajamarca"]
}

### ============================================
### 6. BUSCAR NEGOCIOS (NO REQUIERE AUTH)
### ============================================
GET {{baseUrl}}/businesses/search?type=hotel&page=1&limit=10
```

---

## ✅ ¡Listo para Probar!

Ahora tienes todo configurado. Solo:

1. ✅ Abre `test-businesses-api.http` en VS Code
2. ✅ Instala REST Client (si aún no lo hiciste)
3. ✅ Configura tu token en la variable `@token`
4. ✅ Click en "Send Request" sobre cualquier endpoint
5. ✅ ¡Disfruta viendo las respuestas! 🎉

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas:
1. Verifica que el servidor esté corriendo: http://localhost:3000/health
2. Revisa que REST Client esté instalado
3. Asegúrate de tener un token válido
4. Verifica que las variables estén configuradas

---

**Tu servidor está listo en:** http://localhost:3000 ✅
**Empieza probando:** `test-businesses-api.http` 🚀
