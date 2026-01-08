-- Crear tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS configs (
  id CHAR(36) PRIMARY KEY COMMENT 'UUID',
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT 'Clave única de configuración (ej: whatsapp_api_token)',
  value TEXT COMMENT 'Valor de la configuración',
  description VARCHAR(255) COMMENT 'Descripción de para qué sirve esta configuración',
  isEncrypted BOOLEAN DEFAULT FALSE COMMENT 'Si el valor está encriptado o no',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Tabla para almacenar configuraciones del sistema como tokens de APIs externas';

-- Insertar configuración inicial para WhatsApp API (Factiliza)
-- El token debe ser actualizado desde el panel de administración
INSERT INTO configs (id, `key`, value, description, isEncrypted) VALUES
(UUID(), 'whatsapp_api_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMDciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJjb25zdWx0b3IifQ.Fo5bYXz8TYd5l2FJi4HiqC_ifZDhPhukEb0Ln_CN9Oo', 'Token de autenticación para WhatsApp API (Factiliza)', FALSE)
ON DUPLICATE KEY UPDATE value = VALUES(value);
