-- Agregar businessId a la tabla properties
-- Esto vincula cada propiedad/hotel a su negocio correspondiente

ALTER TABLE properties
ADD COLUMN businessId VARCHAR(36) NULL AFTER hostId,
ADD CONSTRAINT fk_property_business
  FOREIGN KEY (businessId)
  REFERENCES businesses(id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Índice para mejorar el rendimiento
CREATE INDEX idx_properties_business_id ON properties(businessId);

-- Comentario para documentar
ALTER TABLE properties MODIFY businessId VARCHAR(36) NULL COMMENT 'ID del negocio al que pertenece esta propiedad';
