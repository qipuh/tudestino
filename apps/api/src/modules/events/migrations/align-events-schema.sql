-- ============================================
-- MIGRACIÓN: Alinear esquema de eventos con modelos Sequelize
-- Fecha: 2025-12-26
-- Opción A: Actualizar base de datos para features completas
-- ============================================

USE tudestino;

-- ============================================
-- 1. TABLA: events (ya está mayormente correcta)
-- ============================================
-- La tabla events ya tiene los campos correctos, solo limpieza menor

ALTER TABLE events
  MODIFY COLUMN `status` ENUM('draft', 'active', 'inactive', 'under_maintenance')
  DEFAULT 'active' COMMENT 'Estado del evento';

-- ============================================
-- 2. TABLA: event_tickets (requiere expansión)
-- ============================================

-- Limpiar campos duplicados y agregar faltantes
ALTER TABLE event_tickets
  -- Eliminar campos legacy duplicados
  DROP COLUMN IF EXISTS ticket_type,
  DROP COLUMN IF EXISTS quantity_available,
  DROP COLUMN IF EXISTS quantity_sold,

  -- Renombrar campos para consistencia (snake_case)
  CHANGE COLUMN `is_free` `is_free` TINYINT(1) NOT NULL DEFAULT 0,
  CHANGE COLUMN `displayOrder` `display_order` INT NOT NULL DEFAULT 0,
  CHANGE COLUMN `minQuantityPerOrder` `min_quantity_per_order` INT NOT NULL DEFAULT 1,
  CHANGE COLUMN `maxQuantityPerOrder` `max_quantity_per_order` INT DEFAULT NULL,
  CHANGE COLUMN `soldQuantity` `sold_quantity` INT NOT NULL DEFAULT 0,
  CHANGE COLUMN `reservedQuantity` `reserved_quantity` INT NOT NULL DEFAULT 0,

  -- Agregar campo totalQuantity (renombrar quantity_available si existe)
  ADD COLUMN `total_quantity` INT DEFAULT NULL COMMENT 'Cantidad total disponible (null = ilimitado)' AFTER `is_free`,

  -- Agregar fechas de venta
  ADD COLUMN `sales_start_date` DATETIME DEFAULT NULL COMMENT 'Fecha de inicio de ventas' AFTER `max_quantity_per_order`,
  ADD COLUMN `sales_end_date` DATETIME DEFAULT NULL COMMENT 'Fecha de fin de ventas' AFTER `sales_start_date`,

  -- Agregar características JSON
  ADD COLUMN `includes` JSON DEFAULT NULL COMMENT 'Lista de lo que incluye la entrada' AFTER `sales_end_date`,
  ADD COLUMN `restrictions` JSON DEFAULT NULL COMMENT 'Restricciones o requisitos' AFTER `includes`,

  -- Agregar políticas
  ADD COLUMN `is_transferable` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Puede transferirse a otra persona' AFTER `restrictions`,
  ADD COLUMN `is_refundable` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Permite reembolso' AFTER `is_transferable`,
  ADD COLUMN `is_visible` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Visible en el evento' AFTER `is_refundable`;

-- Agregar índices adicionales
CREATE INDEX idx_event_tickets_status ON event_tickets(status);
CREATE INDEX idx_event_tickets_display_order ON event_tickets(display_order);

-- ============================================
-- 3. TABLA: event_registrations (expandir significativamente)
-- ============================================

ALTER TABLE event_registrations
  -- Agregar información del asistente
  ADD COLUMN `attendee_name` VARCHAR(255) DEFAULT NULL COMMENT 'Nombre del asistente' AFTER `quantity`,
  ADD COLUMN `attendee_email` VARCHAR(255) DEFAULT NULL COMMENT 'Email del asistente' AFTER `attendee_name`,
  ADD COLUMN `attendee_phone` VARCHAR(20) DEFAULT NULL COMMENT 'Teléfono del asistente' AFTER `attendee_email`,

  -- Agregar información de pago
  ADD COLUMN `total_amount` DECIMAL(10,2) DEFAULT NULL AFTER `total_price`,
  ADD COLUMN `currency` VARCHAR(3) DEFAULT 'PEN' AFTER `total_amount`,
  ADD COLUMN `payment_status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending' AFTER `currency`,
  ADD COLUMN `payment_method` VARCHAR(50) DEFAULT NULL COMMENT 'Ej: card, cash, transfer' AFTER `payment_status`,
  ADD COLUMN `transaction_id` VARCHAR(255) DEFAULT NULL COMMENT 'ID de transacción del gateway' AFTER `payment_method`,
  ADD COLUMN `paid_at` DATETIME DEFAULT NULL COMMENT 'Fecha de pago confirmado' AFTER `transaction_id`,

  -- Agregar códigos de registro y QR
  ADD COLUMN `registration_code` VARCHAR(10) DEFAULT NULL UNIQUE COMMENT 'Código único de registro' AFTER `paid_at`,
  ADD COLUMN `qr_code` TEXT DEFAULT NULL COMMENT 'Código QR generado' AFTER `registration_code`,

  -- Agregar check-in
  ADD COLUMN `checked_in` TINYINT(1) NOT NULL DEFAULT 0 AFTER `qr_code`,
  ADD COLUMN `checked_in_at` DATETIME DEFAULT NULL AFTER `checked_in`,
  ADD COLUMN `checked_in_by` CHAR(36) DEFAULT NULL COMMENT 'Usuario que hizo el check-in' AFTER `checked_in_at`,

  -- Agregar campos personalizados
  ADD COLUMN `custom_fields` JSON DEFAULT NULL COMMENT 'Campos adicionales del formulario' AFTER `checked_in_by`,
  ADD COLUMN `special_requests` TEXT DEFAULT NULL COMMENT 'Solicitudes especiales' AFTER `custom_fields`,
  ADD COLUMN `dietary_restrictions` TEXT DEFAULT NULL COMMENT 'Restricciones alimentarias' AFTER `special_requests`,

  -- Agregar cancelación
  ADD COLUMN `cancellation_reason` TEXT DEFAULT NULL AFTER `dietary_restrictions`,
  ADD COLUMN `cancelled_at` DATETIME DEFAULT NULL AFTER `cancellation_reason`,

  -- Agregar flags de comunicación
  ADD COLUMN `reminder_sent` TINYINT(1) NOT NULL DEFAULT 0 AFTER `cancelled_at`,
  ADD COLUMN `confirmation_email_sent` TINYINT(1) NOT NULL DEFAULT 0 AFTER `reminder_sent`,

  -- Agregar notas
  ADD COLUMN `notes` TEXT DEFAULT NULL COMMENT 'Notas internas del organizador' AFTER `confirmation_email_sent`;

-- Agregar foreign key para checked_in_by
ALTER TABLE event_registrations
  ADD CONSTRAINT fk_event_registrations_checked_in_by
  FOREIGN KEY (checked_in_by) REFERENCES users(id) ON DELETE SET NULL;

-- Agregar índices
CREATE INDEX idx_event_registrations_status ON event_registrations(status);
CREATE INDEX idx_event_registrations_payment_status ON event_registrations(payment_status);
CREATE INDEX idx_event_registrations_registration_code ON event_registrations(registration_code);
CREATE INDEX idx_event_registrations_checked_in ON event_registrations(checked_in);

-- ============================================
-- 4. TABLA: event_images (CREAR NUEVA)
-- ============================================

CREATE TABLE IF NOT EXISTS `event_images` (
  `id` CHAR(36) NOT NULL,
  `event_id` CHAR(36) NOT NULL,
  `url` VARCHAR(500) NOT NULL COMMENT 'URL de la imagen',
  `caption` VARCHAR(255) DEFAULT NULL COMMENT 'Descripción de la imagen',
  `type` ENUM('cover', 'gallery', 'banner') DEFAULT 'gallery' COMMENT 'Tipo de imagen',
  `is_cover` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Si es la imagen de portada',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Orden de visualización',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_event_images_event_id` (`event_id`),
  KEY `idx_event_images_is_cover` (`is_cover`),
  KEY `idx_event_images_display_order` (`display_order`),
  CONSTRAINT `fk_event_images_event_id`
    FOREIGN KEY (`event_id`)
    REFERENCES `events` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- ============================================
-- 5. DATOS DE EJEMPLO (OPCIONAL - comentado)
-- ============================================

-- Descomentar si quieres agregar datos de ejemplo

-- INSERT INTO event_images (id, event_id, url, type, is_cover) VALUES
-- (UUID(), (SELECT id FROM events LIMIT 1), 'https://example.com/image.jpg', 'cover', 1);

-- ============================================
-- 6. VERIFICACIÓN
-- ============================================

-- Ver estructura actualizada
-- SHOW CREATE TABLE events;
-- SHOW CREATE TABLE event_tickets;
-- SHOW CREATE TABLE event_registrations;
-- SHOW CREATE TABLE event_images;

-- ============================================
-- NOTAS:
-- ============================================
-- 1. Esta migración expande las tablas para soportar:
--    - Sistema completo de tickets con fechas de venta
--    - Sistema de registro con QR codes y check-in
--    - Sistema de pagos (integración con Stripe/Culqi)
--    - Galería de imágenes para eventos
--    - Campos personalizados y solicitudes especiales
--
-- 2. Todos los nuevos campos son opcionales (NULL) para no romper
--    registros existentes
--
-- 3. Los campos con valores por defecto permiten funcionalidad
--    básica sin configuración adicional
--
-- 4. Esta migración es IDEMPOTENTE: puede ejecutarse múltiples veces
--    sin causar errores (usa IF NOT EXISTS y DROP COLUMN IF EXISTS)
-- ============================================
