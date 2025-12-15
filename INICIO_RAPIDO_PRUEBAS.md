# 🚀 Inicio Rápido - Prueba la API de Negocios

## ⚡ Opción Más Rápida: REST Client en VS Code

### Paso 1: Instalar REST Client
1. Abre VS Code
2. Ve a Extensions (Ctrl+Shift+X)
3. Busca "REST Client" por Huachao Mao
4. Click en **Install**

### Paso 2: Abrir el Archivo de Pruebas
1. En VS Code, abre el archivo: `test-businesses-api.http`
2. Verás todos los endpoints listos para usar

### Paso 3: Obtener Token de Autenticación
Primero necesitas un token JWT. Si ya tienes el endpoint de auth:

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "tu@email.com",
  "password": "tupassword"
}
```

**Copia el token** de la respuesta.

### Paso 4: Configurar el Token
En `test-businesses-api.http`, línea 7:
```http
@token = PEGA_TU_TOKEN_AQUI
```

### Paso 5: ¡Probar!
1. Busca la sección "Crear Negocio"
2. Click en **"Send Request"** encima de la línea `POST {{baseUrl}}/businesses`
3. ¡Verás la respuesta en el panel derecho! 🎉

---

## 📱 Opción 2: Postman (Recomendado)

### Paso 1: Descargar Postman
- Descarga desde: https://www.postman.com/downloads/

### Paso 2: Importar Colección
1. Abre Postman
2. Click en **Import** (arriba izquierda)
3. Arrastra el archivo: `postman/businesses-api.postman_collection.json`
4. Click en **Import**

### Paso 3: Configurar Variables
1. Click en la colección "TuDestino - Módulo de Negocios API"
2. Tab **Variables**
3. En "Current Value" edita:
   - `base_url`: http://localhost:3000/api ✅ (ya está)
   - `token`: TU_TOKEN_JWT_AQUI ⚠️ (editar)

### Paso 4: Obtener Token
1. Ve a tu endpoint de login (fuera de esta colección)
2. Haz login
3. Copia el token
4. Pégalo en la variable `token`

### Paso 5: Probar Endpoints
1. Expande "1. NEGOCIOS"
2. Click en "Crear Negocio"
3. Click en **Send**
4. ¡Listo! Verás la respuesta abajo

### Paso 6: Guardar IDs Automáticamente
Después de crear un negocio:
1. Copia el `id` de la respuesta
2. Pégalo en la variable `businessId`
3. Ahora puedes usar `{{businessId}}` en otros endpoints

---

## 💻 Opción 3: cURL (Terminal)

### Para Windows (PowerShell):

```powershell
# 1. Configurar variables
$TOKEN = "tu-token-aqui"
$BASE_URL = "http://localhost:3000/api"

# 2. Crear negocio
$response = Invoke-RestMethod -Uri "$BASE_URL/businesses" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    name = "Mi Hotel Test"
    slug = "mi-hotel-test-$(Get-Date -Format 'yyyyMMddHHmmss')"
    description = "Hotel de prueba"
    businessType = "hotel"
    address = @{
      street = "Calle Test 123"
      city = "Cajamarca"
      country = "Perú"
      latitude = -7.1619
      longitude = -78.5128
    }
    contactPhone = "+51 999 999 999"
    contactEmail = "test@test.com"
  } | ConvertTo-Json -Depth 10)

# Guardar el ID
$BUSINESS_ID = $response.data.id
Write-Host "✅ Negocio creado: $BUSINESS_ID"

# 3. Crear servicio
$service = Invoke-RestMethod -Uri "$BASE_URL/businesses/$BUSINESS_ID/services" `
  -Method POST `
  -Headers @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type" = "application/json"
  } `
  -Body (@{
    serviceType = "property"
    name = "Habitaciones"
    description = "Servicio de alojamiento"
    status = "active"
  } | ConvertTo-Json)

Write-Host "✅ Servicio creado: $($service.data.id)"

# 4. Ver mis negocios
$myBusinesses = Invoke-RestMethod -Uri "$BASE_URL/businesses/my-businesses" `
  -Headers @{ "Authorization" = "Bearer $TOKEN" }

Write-Host "✅ Tienes $($myBusinesses.data.Count) negocio(s)"
```

---

## 🧪 Flujo de Prueba Completo (5 minutos)

### 1️⃣ Verificar que el servidor corre
```bash
curl http://localhost:3000/health
```
✅ Debe responder: `{"status":"OK",...}`

### 2️⃣ Iniciar el servidor si no está corriendo
```bash
cd c:\laragon\www\tudestino\apps\api
npm run dev
```

### 3️⃣ Verificar tablas en MySQL
```bash
"C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe" -u root -e "USE tudestino; SHOW TABLES LIKE 'business%';"
```
✅ Debe mostrar: businesses, business_follows, business_services, business_social_posts

### 4️⃣ Crear un usuario business_owner (si no tienes)
```sql
UPDATE users SET role = 'business_owner' WHERE id = 'TU_USER_ID';
```

### 5️⃣ Obtener token JWT
- Haz login con tu usuario business_owner
- Guarda el token

### 6️⃣ Probar secuencia completa
Usa cualquiera de las opciones (REST Client, Postman, cURL) para:

```
✅ Crear negocio
✅ Crear servicio
✅ Crear post
✅ Seguir negocio (con otro usuario)
✅ Ver feed
```

---

## 📋 Checklist de Pruebas

### Negocios
- [ ] ✅ Crear negocio
- [ ] ✅ Obtener mis negocios
- [ ] ✅ Obtener negocio por ID
- [ ] ✅ Buscar negocios
- [ ] ✅ Actualizar negocio
- [ ] ✅ Eliminar negocio

### Servicios
- [ ] ✅ Crear servicio (property)
- [ ] ✅ Crear servicio (restaurant)
- [ ] ✅ Obtener servicios del negocio
- [ ] ✅ Actualizar servicio
- [ ] ✅ Reordenar servicios

### Posts
- [ ] ✅ Crear post normal
- [ ] ✅ Crear reel
- [ ] ✅ Obtener posts del negocio
- [ ] ✅ Like post
- [ ] ✅ Ver feed

### Seguidores
- [ ] ✅ Seguir negocio
- [ ] ✅ Dejar de seguir
- [ ] ✅ Ver mis seguidos
- [ ] ✅ Ver seguidores del negocio

---

## 🐛 Si Algo No Funciona

### Error: "Cannot connect to server"
```bash
# Asegúrate que el servidor esté corriendo
cd c:\laragon\www\tudestino\apps\api
npm run dev
```

### Error: "Token inválido" o "Unauthorized"
- Verifica que el token sea válido
- Obtén un nuevo token haciendo login
- Asegúrate de poner "Bearer " antes del token

### Error: "Solo usuarios business_owner..."
```sql
-- Actualizar tu usuario a business_owner
UPDATE users
SET role = 'business_owner'
WHERE email = 'tu@email.com';
```

### Error: "Table doesn't exist"
- Verifica que las tablas existan en MySQL
- Ejecuta el script de migración si es necesario

### Error: "Slug already exists"
- Cambia el slug a uno único
- O elimina el negocio existente con ese slug

---

## 📊 Ver Datos en la Base de Datos

Después de crear datos, verifica en MySQL:

```sql
-- Ver negocios
SELECT id, name, slug, status FROM businesses;

-- Ver servicios
SELECT id, businessId, serviceType, name FROM business_services;

-- Ver posts
SELECT id, businessId, caption, type, likesCount FROM business_social_posts;

-- Ver seguidores
SELECT id, userId, businessId, status FROM business_follows;
```

---

## 🎯 Siguiente Paso

Una vez que hayas probado los endpoints:
1. ✅ Crea datos de prueba realistas
2. ✅ Prueba el flujo completo (crear negocio → servicio → post → seguir)
3. ✅ Verifica que los contadores funcionen (likes, seguidores, etc.)
4. ✅ Prueba permisos (intentar editar negocio de otro usuario)

---

## 💡 Tips Útiles

### En Postman:
- Usa **Environment Variables** para cambiar entre dev/prod
- Guarda los IDs automáticamente con **Tests**:
  ```javascript
  pm.environment.set("businessId", pm.response.json().data.id);
  ```

### En REST Client:
- Usa `###` para separar requests
- Click derecho → "Copy Request as cURL"
- Los resultados se guardan automáticamente

### En cURL:
- Usa `| jq` para formatear JSON (si tienes jq instalado)
- Guarda respuestas: `curl ... > response.json`

---

## 📚 Documentación Completa

- **API Endpoints:** [MODULO_NEGOCIOS_API.md](MODULO_NEGOCIOS_API.md)
- **Guía de Pruebas:** [COMO_PROBAR_API.md](COMO_PROBAR_API.md)
- **Resumen Técnico:** [MODULO_NEGOCIOS_COMPLETO.md](MODULO_NEGOCIOS_COMPLETO.md)

---

¡Listo! Ahora tienes todo para probar la API 🚀
