-- Script para actualizar el esquema de comentarios y likes
-- Agregar soporte para comentarios anidados y likes en comentarios

USE tudestino;

-- 1. Actualizar tabla social_comments
-- Agregar columnas para soportar respuestas anidadas
ALTER TABLE social_comments
ADD COLUMN IF NOT EXISTS parent_comment_id CHAR(36) NULL COMMENT 'ID del comentario padre si es una respuesta' AFTER content_id,
ADD COLUMN IF NOT EXISTS replies_count INT DEFAULT 0 NOT NULL COMMENT 'Número de respuestas a este comentario' AFTER likes_count;

-- Agregar índice para buscar respuestas rápidamente
ALTER TABLE social_comments
ADD INDEX IF NOT EXISTS idx_parent_comment (parent_comment_id);

-- 2. Actualizar tabla social_likes
-- Modificar el ENUM para incluir 'comment'
ALTER TABLE social_likes
MODIFY COLUMN content_type ENUM('post', 'reel', 'comment') NOT NULL COMMENT 'Tipo de contenido: post, reel o comment';

-- 3. Crear tabla social_reels si no existe
CREATE TABLE IF NOT EXISTS social_reels (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  caption TEXT NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  duration INT COMMENT 'Duration in seconds',
  location VARCHAR(255),
  views_count INT DEFAULT 0,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Crear tabla social_posts si no existe
CREATE TABLE IF NOT EXISTS social_posts (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  caption TEXT NOT NULL,
  location VARCHAR(255),
  media JSON NOT NULL COMMENT 'Array of media objects: [{url, type: image|video, thumbnail}]',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  shares_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Verificar índices existentes
SHOW INDEX FROM social_comments;
SHOW INDEX FROM social_likes;

SELECT 'Schema actualizado correctamente ✅' AS status;
