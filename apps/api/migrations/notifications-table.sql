-- Migración para crear la tabla de Notificaciones
-- Fecha: 2026-01-20

CREATE TABLE IF NOT EXISTS `Notifications` (
  `id` CHAR(36) NOT NULL PRIMARY KEY,
  `userId` CHAR(36) NOT NULL,
  `type` ENUM(
    'booking_request',
    'booking_confirmed',
    'booking_cancelled',
    'message_received',
    'payment_received',
    'review_received',
    'property_approved',
    'property_rejected',
    'new_follower',
    'post_liked',
    'reel_liked',
    'comment_liked',
    'comment_received',
    'post_shared',
    'user_mentioned'
  ) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `relatedId` CHAR(36) DEFAULT NULL COMMENT 'ID relacionado (bookingId, messageId, postId, etc.)',
  `actorId` CHAR(36) DEFAULT NULL COMMENT 'ID del usuario que realizó la acción',
  `metadata` JSON DEFAULT NULL COMMENT 'Datos adicionales (avatar, nombre del actor, etc.)',
  `isRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `readAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`actorId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,

  INDEX `idx_userId` (`userId`),
  INDEX `idx_actorId` (`actorId`),
  INDEX `idx_type` (`type`),
  INDEX `idx_isRead` (`isRead`),
  INDEX `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
