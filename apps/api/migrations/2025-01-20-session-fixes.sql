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

-- 4. Actualizar tabla notifications para agregar campos faltantes (si no existen)
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS `businessId` CHAR(36) NULL AFTER `userId`,
  ADD COLUMN IF NOT EXISTS `postId` CHAR(36) NULL AFTER `businessId`,
  ADD COLUMN IF NOT EXISTS `propertyId` CHAR(36) NULL AFTER `postId`,
  ADD COLUMN IF NOT EXISTS `bookingId` CHAR(36) NULL AFTER `propertyId`,
  ADD COLUMN IF NOT EXISTS `actionUrl` VARCHAR(500) NULL AFTER `metadata`;

-- Agregar índice para businessId si no existe
CREATE INDEX IF NOT EXISTS `idx_businessId` ON notifications (`businessId`);
CREATE INDEX IF NOT EXISTS `idx_postId` ON notifications (`postId`);

-- 5. Actualizar categorías de menú para negocios de entretenimiento
UPDATE menu_items
SET category = 'drinks'
WHERE category = 'bebidas';

UPDATE menu_items
SET category = 'food'
WHERE category = 'comida';
