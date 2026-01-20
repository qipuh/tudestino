-- Crear tabla business_follows si no existe
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
