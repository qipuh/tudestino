-- Migración: Agregar soporte para Google OAuth
-- Fecha: 2026-02-01
-- Descripción: Agrega campo google_id a la tabla users para autenticación con Google

-- Agregar columna google_id
ALTER TABLE users
ADD COLUMN google_id VARCHAR(255) NULL UNIQUE
AFTER password;

-- Crear índice para mejorar búsquedas por google_id
CREATE INDEX idx_users_google_id ON users(google_id);

-- Comentario para documentación
ALTER TABLE users MODIFY COLUMN google_id VARCHAR(255) NULL UNIQUE
COMMENT 'ID único de Google OAuth para autenticación con cuenta Google';
