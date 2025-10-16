# Guía de Implementación del Sistema de Registro de Alojamientos

## ✅ Completado

### 1. Constantes y Configuraciones (packages/shared/)
- ✅ `constants/accommodationTypes.js` - Tipos de alojamiento (departamento, hotel, motel, hostal, etc.)
- ✅ `constants/cancellationPolicies.js` - Políticas de cancelación (estándar, no reembolsable, estancia larga)
- ✅ `constants/amenities.js` - Amenidades de propiedad y habitación
- ✅ Actualizado `index.js` para exportar las nuevas constantes

### 2. Componentes Frontend
- ✅ `PropertyRegistrationPage.jsx` - Página principal con navegación multi-paso
- ✅ `AccommodationTypeStep.jsx` - Paso 1: Selección de tipo de alojamiento

## 📋 Pendiente de Implementar

### 3. Componentes de Pasos Restantes (apps/web/src/modules/properties/components/registration/)

#### CancellationPolicyStep.jsx
```jsx
import { CANCELLATION_POLICIES, CANCELLATION_POLICY_CONFIG } from '@tudestino/shared';

// Permite seleccionar:
// - Política estándar (cancelación gratis hasta 18:00 del día de llegada)
// - Política flexible (24 horas antes)
// - Política no reembolsable (10% descuento, sin cancelación)
// - Política de estancia larga (15% descuento para 7+ noches)
```

#### AccommodationDataStep.jsx
```jsx
// Campos a implementar:
// 1. Dirección completa (calle, ciudad, estado, país, código postal)
// 2. Mapa interactivo para seleccionar ubicación (lat/lng)
// 3. Servicios del establecimiento (checkboxes):
//    - Restaurante, Bar, Servicio de habitaciones
//    - Recepción 24h, WiFi, Aire acondicionado
//    - Piscina, Gimnasio, Spa, Sauna
//    - Jardín, Terraza, Playa
//    - Estación de carga EV, Parque acuático
// 4. Desayuno:
//    - ¿Incluye desayuno? (Sí/No)
// 5. Parking:
//    - No disponible
//    - Gratis
//    - De pago (precio por día/estancia, ubicación: dentro/fuera, tipo: privado/público)
```

#### RulesStep.jsx
```jsx
// Campos a implementar:
// 1. Check-in time (selector de hora)
// 2. Check-out time (selector de hora)
// 3. ¿Aloja niños? (Sí/No)
// 4. ¿Admite mascotas?
//    - No
//    - Sí, gratis
//    - Sí, con cargo (especificar monto por día/estancia)
```

#### RoomsStep.jsx
```jsx
// Para alojamientos de habitación única (departamento, casa, villa):
// - Configurar 1 sola habitación con todas las amenidades

// Para alojamientos multi-unidad (hotel, motel, hostal):
// - Botón "Agregar habitación"
// - Lista de habitaciones creadas
// - Cada habitación tiene:
//   a) Nombre de la habitación (Ej: "Habitación Doble Deluxe")
//   b) Capacidad (número de huéspedes)
//   c) Número de camas (tipo y cantidad)
//   d) Precio por noche
//   e) Amenidades de habitación (checkboxes agrupados):
//      - Servicios generales: Perchero, TV, Aire acondicionado, Ropa de cama,
//        Escritorio, Despertador, Toallas, Armario, Calefacción, Ventilador,
//        Caja fuerte, Planta baja
//      - Vistas y exterior: Balcón, Terraza, Vistas
//      - Comida y bebida: Hervidor eléctrico, Cafetera, Zona de comedor,
//        Mesa de comedor, Microondas, Minibar, Nevera
//      - Baño: Baño privado, Bañera, Ducha, Secador, Artículos de aseo
//   f) Galería de fotos de la habitación (mínimo 3, máximo 10)
```

#### ReviewStep.jsx
```jsx
// Resumen de todos los datos ingresados:
// - Tipo de alojamiento
// - Nombre y categoría (si aplica)
// - Política de cancelación
// - Dirección completa
// - Servicios del establecimiento
// - Normas (check-in/out, niños, mascotas)
// - Lista de habitaciones con detalles
// - Botón "Publicar alojamiento"
```

### 4. Backend - API Endpoints (apps/api/src/modules/)

#### Verificación de Email
```
POST /api/auth/send-verification-email
POST /api/auth/verify-email/:token
GET /api/auth/check-verification-status
```

#### Propiedades
```
POST /api/properties/register - Crear alojamiento completo
PUT /api/properties/:id/rooms - Actualizar habitaciones
GET /api/properties/:id/full - Obtener alojamiento con todas las habitaciones
```

### 5. Modelos de Base de Datos

#### Actualizar Property Model (Sequelize)
```javascript
// Nuevos campos:
accommodationType: STRING (apartment, hotel, motel, etc.)
multipleUnits: BOOLEAN
hotelName: STRING (para hoteles/moteles)
hotelCategory: INTEGER (1-5 estrellas)
cancellationPolicy: STRING
propertyAmenities: JSON (array de amenidades)
parkingType: STRING (no, free, paid)
parkingDetails: JSON
breakfastIncluded: BOOLEAN
checkInTime: TIME
checkOutTime: TIME
childrenAllowed: BOOLEAN
petsAllowed: STRING (no, yes_free, yes_paid)
petFee: DECIMAL
```

#### Crear Room Model (Sequelize)
```javascript
// Tabla: rooms
id: UUID
propertyId: UUID (foreign key)
name: STRING
guestCapacity: INTEGER
beds: JSON [{type: 'single/double/queen/king', count: 1}]
pricePerNight: DECIMAL
amenities: JSON (array de amenidades de habitación)
images: JSON (array de URLs)
isAvailable: BOOLEAN
createdAt: TIMESTAMP
updatedAt: TIMESTAMP
```

#### Actualizar User Model
```javascript
// Nuevo campo:
emailVerified: BOOLEAN
emailVerificationToken: STRING
emailVerificationExpires: TIMESTAMP
```

### 6. Servicios de Email

#### Crear Email Service (apps/api/src/services/emailService.js)
```javascript
// Usar nodemailer o servicio como SendGrid
sendVerificationEmail(user, verificationUrl)
sendWelcomeEmail(user)
sendBookingConfirmation(booking)
```

### 7. Actualizar Rutas

#### apps/web/src/App.jsx
```jsx
// Agregar ruta:
<Route path="host/properties/register" element={<PropertyRegistrationPage />} />
```

### 8. Validaciones

#### Frontend
- Validar que todos los campos obligatorios estén completos antes de avanzar
- Validar formato de email y teléfono
- Validar que check-out sea después de check-in
- Validar que el precio sea mayor a 0
- Validar que se suban al menos 3 fotos por habitación

#### Backend
- Validar que el usuario esté autenticado
- Validar que el email esté verificado antes de permitir publicar
- Validar integridad de datos
- Sanitizar inputs

### 9. Flujo Completo de Registro

1. Usuario se registra como host
2. Sistema envía email de verificación
3. Usuario verifica su email haciendo clic en el enlace
4. Usuario accede a "Pon tu espacio en TuDestino"
5. Sistema verifica que el email esté confirmado
6. Usuario completa el formulario multi-paso:
   - Paso 1: Selecciona tipo de alojamiento
   - Paso 2: Configura política de cancelación
   - Paso 3: Ingresa datos del alojamiento
   - Paso 4: Define normas
   - Paso 5: Agrega habitaciones (1 o múltiples)
   - Paso 6: Revisa y publica
7. Sistema crea el alojamiento y habitaciones en la BD
8. Alojamiento queda publicado y visible para huéspedes

## 🚀 Próximos Pasos Recomendados

1. Crear los componentes de pasos restantes (CancellationPolicyStep, AccommodationDataStep, RulesStep, RoomsStep, ReviewStep)
2. Implementar sistema de verificación de email en el backend
3. Actualizar modelos de base de datos (Property y crear Room)
4. Crear endpoints de API
5. Integrar subida de imágenes (usar multer en backend)
6. Probar flujo completo
7. Agregar manejo de errores y mensajes de éxito

## 📚 Recursos Útiles

- Constantes compartidas: `packages/shared/constants/`
- Componentes de formulario: `apps/web/src/modules/properties/components/registration/`
- API de propiedades: `apps/api/src/modules/properties/`
- Modelos: `apps/api/src/modules/properties/property.model.js`

## ⚠️ Notas Importantes

- El sistema de verificación de email es CRÍTICO - no permitir publicar sin verificar
- Las políticas de cancelación afectan el precio final - implementar correctamente el cálculo
- Para hoteles con múltiples habitaciones, cada habitación se reserva independientemente
- Mantener consistencia entre tipos de alojamiento single-unit vs multi-unit
- Validar que las fotos sean obligatorias (mínimo 3 por habitación)
