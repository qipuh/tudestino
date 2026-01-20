-- Actualizar tabla de Notificaciones con nuevos campos y tipos
-- Fecha: 2026-01-20

-- Verificar y agregar campo actorId
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'tudestino'
  AND TABLE_NAME = 'Notifications'
  AND COLUMN_NAME = 'actorId');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `Notifications` ADD COLUMN `actorId` CHAR(36) DEFAULT NULL COMMENT "ID del usuario que realizó la acción" AFTER `relatedType`',
  'SELECT "Column actorId already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar y agregar campo metadata
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'tudestino'
  AND TABLE_NAME = 'Notifications'
  AND COLUMN_NAME = 'metadata');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `Notifications` ADD COLUMN `metadata` JSON DEFAULT NULL COMMENT "Datos adicionales" AFTER `actorId`',
  'SELECT "Column metadata already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar el tipo ENUM para incluir todos los nuevos tipos
ALTER TABLE `Notifications`
MODIFY COLUMN `type` ENUM(
  'booking_request',
  'booking_confirmed',
  'booking_cancelled',
  'message_received',
  'payment_received',
  'review_received',
  'property_approved',
  'property_rejected',
  'business_verified',
  'business_suspended',
  'new_follower',
  'post_liked',
  'reel_liked',
  'comment_liked',
  'comment_received',
  'post_shared',
  'user_mentioned'
) NOT NULL;

-- Agregar foreign key para actorId si no existe
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = 'tudestino'
  AND TABLE_NAME = 'Notifications'
  AND CONSTRAINT_NAME = 'notifications_actorid_foreign');

SET @sql = IF(@fk_exists = 0,
  'ALTER TABLE `Notifications` ADD CONSTRAINT `notifications_actorid_foreign` FOREIGN KEY (`actorId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE',
  'SELECT "Foreign key already exists"');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
