-- Migraciones para sesión 2025-01-20
-- Incluye: AUTO_INCREMENT para conversations y messages, tabla business_follows, mejoras a notifications

-- 1. Agregar AUTO_INCREMENT a conversations.id
ALTER TABLE conversations MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- 2. Agregar AUTO_INCREMENT a messages.id
ALTER TABLE messages MODIFY COLUMN id INT NOT NULL AUTO_INCREMENT;

-- 3. Crear tabla business_follows si no existe
CREATE TABLE IF NOT EXISTS `business_follows` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `userId` CHAR(36) NOT NULL,
  `businessId` CHAR(36) NOT NULL,
  `status` ENUM('active', 'blocked') DEFAULT 'active',
  `notificationsEnabled` TINYINT(1) DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices
  INDEX `idx_userId` (`userId`),
  INDEX `idx_businessId` (`businessId`),
  INDEX `idx_status` (`status`),
  UNIQUE INDEX `unique_user_business` (`userId`, `businessId`),

  -- Claves foráneas
  CONSTRAINT `fk_business_follows_user`
    FOREIGN KEY (`userId`)
    REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_business_follows_business`
    FOREIGN KEY (`businessId`)
    REFERENCES `businesses` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. Actualizar tabla notifications para agregar campos faltantes
-- Verificamos si las columnas existen antes de agregarlas

-- Verificar y agregar businessId
SET @dbname = DATABASE();
SET @tablename = 'notifications';
SET @columnname = 'businessId';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  'ALTER TABLE notifications ADD COLUMN businessId CHAR(36) NULL AFTER userId'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar postId
SET @columnname = 'postId';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  'ALTER TABLE notifications ADD COLUMN postId CHAR(36) NULL AFTER businessId'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar propertyId
SET @columnname = 'propertyId';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  'ALTER TABLE notifications ADD COLUMN propertyId CHAR(36) NULL AFTER postId'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar bookingId
SET @columnname = 'bookingId';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  'ALTER TABLE notifications ADD COLUMN bookingId CHAR(36) NULL AFTER propertyId'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Verificar y agregar actionUrl
SET @columnname = 'actionUrl';
SET @preparedStatement = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
   WHERE (table_name = @tablename)
   AND (table_schema = @dbname)
   AND (column_name = @columnname)) > 0,
  'SELECT 1',
  'ALTER TABLE notifications ADD COLUMN actionUrl VARCHAR(500) NULL'
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Agregar índices si no existen
SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE (table_name = 'notifications')
   AND (table_schema = @dbname)
   AND (index_name = 'idx_businessId')) > 0,
  'SELECT 1',
  'CREATE INDEX idx_businessId ON notifications (businessId)'
));
PREPARE createIndexIfNotExists FROM @s;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

SET @s = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
   WHERE (table_name = 'notifications')
   AND (table_schema = @dbname)
   AND (index_name = 'idx_postId')) > 0,
  'SELECT 1',
  'CREATE INDEX idx_postId ON notifications (postId)'
));
PREPARE createIndexIfNotExists FROM @s;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

-- 5. Actualizar categorías de menú para negocios de entretenimiento
UPDATE menu_items
SET category = 'drinks'
WHERE category = 'bebidas';

UPDATE menu_items
SET category = 'food'
WHERE category = 'comida';
