-- Crear tabla social_comment_likes para guardar los likes en comentarios
CREATE TABLE IF NOT EXISTS social_comment_likes (
  id CHAR(36) PRIMARY KEY,
  comment_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_comment_user (comment_id, user_id),
  KEY idx_comment_id (comment_id),
  KEY idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
