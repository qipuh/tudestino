# 🧪 Guía de Prueba: Crear Hotel con Habitaciones

## ✅ Pre-requisitos

- ✅ API corriendo en http://localhost:3000
- ✅ Frontend corriendo en http://localhost:5173
- ✅ Base de datos `tudestino` con tablas creadas
- ✅ Usuario registrado como `business_owner`

---

## 📋 Paso a Paso

### 1. Registrar Usuario Business Owner

**URL:** http://localhost:5173/register

1. Click en "Soy dueño de negocio" 🏢
2. Completar formulario:
   - Nombre: Juan Pérez
   - Email: juan@hotel.com
   - Password: password123
   - Confirmar password: password123
3. Click "Registrarse"
4. **Verificar:** Debe redirigir a `/business/dashboard`

---

### 2. Crear Negocio (Hotel)

**URL:** http://localhost:5173/business/create

#### Paso 1: Información Básica
- **Nombre del negocio:** Hotel Paradise Cajamarca
- **Tipo de negocio:** hotel
- **Descripción:** Hotel de 4 estrellas en el corazón de Cajamarca con vistas espectaculares
- **Verificar:** El slug debe auto-generarse: `hotel-paradise-cajamarca`
- Click "Siguiente"

#### Paso 2: Ubicación
- **Calle:** Jr. Dos de Mayo 560
- **Ciudad:** Cajamarca
- **Departamento:** Cajamarca
- **País:** Perú
- **Código Postal:** 06001
- Click "Siguiente"

#### Paso 3: Contacto
- **Teléfono:** +51 976 123 456
- **Email:** contacto@hotelparadise.com
- **Sitio web:** https://hotelparadise.com
- Click "Crear Negocio"

**Verificar:**
- Debe aparecer mensaje "Negocio creado exitosamente"
- Debe redirigir al detalle del negocio

---

### 3. Agregar Habitaciones

En la página de detalle del negocio:

1. Click "Gestionar Servicios"
2. **Verificar:** El botón debe decir **"Agregar Habitaciones"** (no "Agregar Servicio")
3. Click "Agregar Habitaciones"

#### Paso 1: Configuración del Hotel

**URL:** `/business/{businessId}/property/create`

- **Check-in:** 14:00
- **Check-out:** 12:00
- **Servicios del hotel:**
  - ✅ WiFi
  - ✅ Piscina
  - ✅ Restaurante
  - ❌ Estacionamiento
- **Políticas:**
  - ❌ ¿Se permiten mascotas?
  - ✅ ¿Desayuno incluido?
  - ✅ ¿Se permiten niños?

Click "Continuar a Habitaciones →"

#### Paso 2: Agregar Habitaciones

**URL:** `/business/{businessId}/property/create-rooms`

##### Habitación 1: Doble Estándar

- **Tipo de habitación:** Doble (select)
- **Precio por noche:** 150
- **Cantidad de habitaciones:** 10
- **Capacidad:** 2 (se ajusta automáticamente)
- **Características:**
  - ✅ TV
  - ✅ WiFi
  - ✅ Baño privado
  - ✅ Aire acondicionado
- **Descripción:** Habitación doble estándar con vista a la ciudad
- Click "+ Agregar esta Habitación"

**Verificar:** La habitación aparece en la lista lateral:
- 🛏️ Habitación Doble
- 10 habitación(es) • 2 huéspedes
- S/. 150/noche

##### Habitación 2: Suite

- **Tipo de habitación:** Suite
- **Precio por noche:** 350
- **Cantidad de habitaciones:** 3
- **Capacidad:** 2
- **Características:**
  - ✅ TV
  - ✅ WiFi
  - ✅ Baño privado
  - ✅ Aire acondicionado
  - ✅ Minibar
  - ✅ Balcón
  - ✅ Jacuzzi
- **Descripción:** Suite de lujo con jacuzzi y vista panorámica
- Click "+ Agregar esta Habitación"

##### Habitación 3: Familiar

- **Tipo de habitación:** Familiar
- **Precio por noche:** 220
- **Cantidad de habitaciones:** 5
- **Capacidad:** 4
- **Características:**
  - ✅ TV
  - ✅ WiFi
  - ✅ Baño privado
  - ✅ Aire acondicionado
- **Descripción:** Habitación amplia ideal para familias
- Click "+ Agregar esta Habitación"

##### Habitación 4: Individual

- **Tipo de habitación:** Individual
- **Precio por noche:** 90
- **Cantidad de habitaciones:** 8
- **Capacidad:** 1
- **Características:**
  - ✅ TV
  - ✅ WiFi
  - ✅ Baño privado
- **Descripción:** Habitación individual cómoda
- Click "+ Agregar esta Habitación"

**Verificar:** Deberías tener 4 tipos de habitaciones en la lista lateral.

Click "✓ Finalizar y Guardar"

---

## ✅ Verificaciones

### 1. Verificar en el Frontend

Deberías ver:
- Mensaje: "¡Propiedad y habitaciones creadas exitosamente!"
- Redirección a la página de detalle del negocio

### 2. Verificar en la Base de Datos

Abre una terminal MySQL:

```bash
mysql -u root
```

```sql
USE tudestino;

-- Ver el negocio creado
SELECT id, name, slug, businessType, address->>'$.city' as city
FROM businesses
WHERE businessType = 'hotel'
ORDER BY createdAt DESC
LIMIT 1;

-- Ver la propiedad creada
SELECT
  id,
  hotelName,
  accommodationType,
  checkInTime,
  checkOutTime,
  propertyAmenities,
  breakfastIncluded
FROM properties
ORDER BY createdAt DESC
LIMIT 1;

-- Ver las habitaciones creadas
SELECT
  id,
  roomType,
  name,
  quantity,
  guestCapacity,
  pricePerNight,
  amenities,
  beds
FROM rooms
ORDER BY createdAt DESC;
```

### 3. Verificar Logs del Backend

En la consola del servidor deberías ver algo como:

```
Datos completos para enviar: {
  checkInTime: '14:00',
  checkOutTime: '12:00',
  hasWifi: true,
  hasParking: false,
  hasSwimmingPool: true,
  hasRestaurant: true,
  petsAllowed: false,
  breakfastIncluded: true,
  childrenAllowed: true,
  rooms: [
    {
      type: 'double',
      quantity: 10,
      capacity: 2,
      pricePerNight: 150,
      amenities: ['tv', 'wifi', 'private_bathroom', 'air_conditioning'],
      description: 'Habitación doble estándar con vista a la ciudad'
    },
    ...
  ]
}
```

---

## 🔍 Resultados Esperados

### En la tabla `properties`:

```
id: uuid-generado
hostId: uuid-del-usuario
accommodationType: 'hotel'
hotelName: 'Hotel Paradise Cajamarca'
propertyName: 'Hotel Paradise Cajamarca'
checkInTime: '14:00:00'
checkOutTime: '12:00:00'
propertyAmenities: ["wifi", "swimming_pool", "restaurant"]
breakfastIncluded: 1
parkingType: 'no'
childrenAllowed: 1
petsAllowed: 'no'
status: 'published'
addressCity: 'Cajamarca'
addressCountry: 'Perú'
```

### En la tabla `rooms` (4 registros):

**Habitación 1:**
```
roomType: 'double'
name: 'Habitación Doble'
quantity: 10
guestCapacity: 2
pricePerNight: 150.00
amenities: ["tv", "wifi", "private_bathroom", "air_conditioning"]
beds: [{"type": "queen_bed", "count": 1}]
```

**Habitación 2:**
```
roomType: 'suite'
name: 'Suite'
quantity: 3
guestCapacity: 2
pricePerNight: 350.00
amenities: ["tv", "wifi", "private_bathroom", "air_conditioning", "minibar", "balcony", "jacuzzi_tub"]
beds: [{"type": "king_bed", "count": 1}]
```

**Habitación 3:**
```
roomType: 'family'
name: 'Habitación Familiar'
quantity: 5
guestCapacity: 4
pricePerNight: 220.00
amenities: ["tv", "wifi", "private_bathroom", "air_conditioning"]
beds: [{"type": "queen_bed", "count": 1}, {"type": "single_bed", "count": 2}]
```

**Habitación 4:**
```
roomType: 'single'
name: 'Habitación Individual'
quantity: 8
guestCapacity: 1
pricePerNight: 90.00
amenities: ["tv", "wifi", "private_bathroom"]
beds: [{"type": "single_bed", "count": 1}]
```

---

## 🎯 Total de Habitaciones Físicas

Con esta configuración, el hotel tiene:
- 10 habitaciones dobles
- 3 suites
- 5 habitaciones familiares
- 8 habitaciones individuales
- **TOTAL: 26 habitaciones físicas**

Representadas en **4 tipos de habitación** en la base de datos.

---

## ⚠️ Troubleshooting

### Error: "Solo los negocios tipo hotel pueden crear propiedades"

**Causa:** El negocio fue creado con tipo diferente a `hotel`

**Solución:**
1. Ir a la base de datos
2. Actualizar: `UPDATE businesses SET businessType = 'hotel' WHERE id = 'uuid-del-negocio';`

### Error: "Negocio no encontrado"

**Causa:** El `businessId` en la URL no coincide con ningún negocio del usuario

**Solución:**
1. Verificar que estás logueado con el usuario correcto
2. Verificar el `businessId` en la URL
3. Verificar en la BD: `SELECT id, name, ownerId FROM businesses;`

### Error: "Debes agregar al menos una habitación"

**Causa:** Hiciste click en "Finalizar y Guardar" sin agregar ninguna habitación

**Solución:**
1. Completar el formulario de habitación
2. Click "+ Agregar esta Habitación" ANTES de "Finalizar"

### No aparece el botón "Agregar Habitaciones"

**Causa:** El negocio no es tipo `hotel`

**Solución:**
1. Verificar en BD: `SELECT businessType FROM businesses WHERE id = 'uuid';`
2. Si no es `hotel`, actualizar

---

## 📊 Resumen de la Prueba

Si todo salió bien, habrás:

1. ✅ Creado un usuario business_owner
2. ✅ Creado un negocio tipo hotel con slug automático
3. ✅ Configurado el hotel (check-in/out, servicios, políticas)
4. ✅ Agregado 4 tipos de habitación (26 habitaciones físicas)
5. ✅ Guardado todo en la base de datos
6. ✅ Verificado la transacción en MySQL

**¡Felicidades! El flujo completo está funcionando.** 🎉
