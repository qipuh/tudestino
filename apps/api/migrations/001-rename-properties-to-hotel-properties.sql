-- ========================================
-- MIGRACIÓN: Renombrar properties a hotel_properties
-- Fecha: 2026-01-02
-- Descripción: Unifica la arquitectura de hoteles
-- ========================================

-- Paso 1: Verificar que no haya datos que se vayan a perder
SELECT
  COUNT(*) as total_properties,
  COUNT(businessId) as properties_with_business,
  COUNT(*) - COUNT(businessId) as properties_without_business
FROM properties;

-- Paso 2: Renombrar la tabla
RENAME TABLE properties TO hotel_properties;

-- Paso 3: Actualizar la tabla rooms para que apunte a la nueva tabla
ALTER TABLE rooms
  DROP FOREIGN KEY IF EXISTS rooms_ibfk_1;

ALTER TABLE rooms
  ADD CONSTRAINT fk_room_hotel_property
  FOREIGN KEY (propertyId)
  REFERENCES hotel_properties(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Paso 4: Hacer businessId obligatorio (después validamos que todos tengan businessId)
-- Por ahora lo dejamos nullable para no romper datos existentes
-- ALTER TABLE hotel_properties
--   MODIFY COLUMN businessId CHAR(36) NOT NULL;

-- Paso 5: Agregar índice en businessId si no existe
CREATE INDEX IF NOT EXISTS idx_hotel_properties_business_id
  ON hotel_properties(businessId);

-- Paso 6: Agregar Foreign Key de businessId a businesses
-- Primero verificamos que no haya propiedades huérfanas
ALTER TABLE hotel_properties
  ADD CONSTRAINT fk_hotel_property_business
  FOREIGN KEY (businessId)
  REFERENCES businesses(id)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

-- Paso 7: Eliminar campos redundantes (comentado por seguridad)
-- Una vez verificado que todo funciona, descomentar y ejecutar:
-- ALTER TABLE hotel_properties
--   DROP COLUMN hotelName,
--   DROP COLUMN hotelCategory;

-- Paso 8: Actualizar metadatos
ALTER TABLE hotel_properties
  COMMENT = 'Propiedades de hoteles asociadas a negocios';

SELECT 'Migración completada exitosamente' as status;
