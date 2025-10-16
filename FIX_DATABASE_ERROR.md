# 🔧 Solución al Error 500 en /my-properties

## Problema
El error ocurre porque las tablas `properties` y `rooms` no existen en la base de datos MySQL.

## ✅ Solución Rápida (3 pasos)

### 1. Ejecutar el script de migración

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
cd apps/api
node src/scripts/migrate-properties.js
```

Deberías ver:
```
🔄 Iniciando migración de tablas de propiedades y habitaciones...
✅ Tabla Properties sincronizada
✅ Tabla Rooms sincronizada
🎉 Migración completada exitosamente
```

### 2. Verificar en la base de datos

Abre phpMyAdmin (http://localhost/phpmyadmin) o cualquier cliente MySQL y verifica:

```sql
USE tudestino;
SHOW TABLES;
```

Deberías ver:
- `properties`
- `rooms`

### 3. Reiniciar el servidor API

Si el servidor ya estaba corriendo:

```bash
# Detener (Ctrl+C) y reiniciar
npm run dev:api
```

O desde la raíz:
```bash
npm run dev
```

## 🎯 Probar que funciona

1. Ve a: http://localhost:5173/host/properties
2. Ya NO deberías ver el error 500
3. Si no tienes propiedades, verás el mensaje "No tienes propiedades aún"

## 📝 Notas Importantes

### Si el script falla con error de conexión:

Verifica que tu archivo `apps/api/.env` tenga:

```env
DB_NAME=tudestino
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
```

### Si la base de datos `tudestino` no existe:

Créala primero:

```sql
CREATE DATABASE tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

O desde terminal:
```bash
mysql -u root -e "CREATE DATABASE tudestino CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Estructura de tablas creadas:

**Tabla: properties**
- id (UUID)
- hostId (UUID)
- accommodationType (ENUM)
- hotelName, hotelCategory
- cancellationPolicy
- Dirección (addressStreet, addressCity, addressState, addressCountry, addressZipCode)
- Coordenadas (addressLatitude, addressLongitude)
- Amenidades (propertyAmenities JSON)
- Parking (parkingType, parkingDetails JSON)
- Normas (checkInTime, checkOutTime, childrenAllowed, petsAllowed, etc.)
- Status, ratings, timestamps

**Tabla: rooms**
- id (UUID)
- propertyId (FK → properties)
- roomType (ENUM)
- name, guestCapacity
- beds (JSON array)
- pricePerNight
- amenities (JSON array)
- images (JSON array)
- isAvailable
- timestamps

## 🚀 Siguiente paso

Una vez que las tablas existan, podrás:

1. ✅ Ver la lista de propiedades en `/host/properties`
2. ✅ Registrar nuevas propiedades en `/host/properties/register`
3. ✅ Las propiedades se guardarán correctamente en MySQL

## ❓ Si aún hay errores

Revisa los logs del servidor API en la terminal para ver el error específico.

Comandos útiles para debug:

```bash
# Ver estructura de tabla
mysql -u root tudestino -e "DESCRIBE properties;"

# Ver si hay propiedades
mysql -u root tudestino -e "SELECT * FROM properties;"

# Ver relaciones
mysql -u root tudestino -e "SELECT p.hotelName, COUNT(r.id) as rooms FROM properties p LEFT JOIN rooms r ON p.id = r.propertyId GROUP BY p.id;"
```
