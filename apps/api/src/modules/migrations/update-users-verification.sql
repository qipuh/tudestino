-- Agregar campos de verificación a la tabla users
ALTER TABLE users
  -- Campos de verificación
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE COMMENT 'Email verificado',
  ADD COLUMN IF NOT EXISTS email_verification_code VARCHAR(6) COMMENT 'Código de verificación de email',
  ADD COLUMN IF NOT EXISTS email_verification_expires DATETIME COMMENT 'Expiración del código de email',
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE COMMENT 'Teléfono verificado',
  ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6) COMMENT 'Código de verificación de teléfono',
  ADD COLUMN IF NOT EXISTS phone_verification_expires DATETIME COMMENT 'Expiración del código de teléfono',
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN DEFAULT FALSE COMMENT 'Identidad verificada',
  ADD COLUMN IF NOT EXISTS verification_status ENUM('pending', 'email_verified', 'phone_verified', 'fully_verified', 'rejected') DEFAULT 'pending' COMMENT 'Estado general de verificación',

  -- Campos de identidad
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) COMMENT 'Nombre(s)',
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) COMMENT 'Apellido paterno',
  ADD COLUMN IF NOT EXISTS middle_name VARCHAR(100) COMMENT 'Apellido materno',
  ADD COLUMN IF NOT EXISTS birth_date DATE COMMENT 'Fecha de nacimiento',
  ADD COLUMN IF NOT EXISTS nationality_code CHAR(2) COMMENT 'Código de país de nacionalidad',
  ADD COLUMN IF NOT EXISTS document_type VARCHAR(50) COMMENT 'Tipo de documento',
  ADD COLUMN IF NOT EXISTS document_number VARCHAR(50) COMMENT 'Número de documento',
  ADD COLUMN IF NOT EXISTS document_front_photo VARCHAR(255) COMMENT 'Foto frontal del documento',
  ADD COLUMN IF NOT EXISTS document_back_photo VARCHAR(255) COMMENT 'Foto trasera del documento',
  ADD COLUMN IF NOT EXISTS selfie_photo VARCHAR(255) COMMENT 'Foto selfie del usuario',
  ADD COLUMN IF NOT EXISTS identity_verification_date DATETIME COMMENT 'Fecha de verificación de identidad',
  ADD COLUMN IF NOT EXISTS identity_verified_by INT COMMENT 'Admin que verificó',
  ADD COLUMN IF NOT EXISTS identity_rejection_reason TEXT COMMENT 'Razón de rechazo de verificación',

  -- Campos adicionales
  ADD COLUMN IF NOT EXISTS country_code CHAR(2) COMMENT 'Código de país del teléfono',
  ADD COLUMN IF NOT EXISTS trust_score INT DEFAULT 0 COMMENT 'Puntuación de confianza (0-100)',

  -- Índices
  ADD INDEX IF NOT EXISTS idx_email_verified (email_verified),
  ADD INDEX IF NOT EXISTS idx_verification_status (verification_status),
  ADD INDEX IF NOT EXISTS idx_document_number (document_number),
  ADD INDEX IF NOT EXISTS idx_nationality (nationality_code),
  ADD FOREIGN KEY IF NOT EXISTS fk_nationality (nationality_code) REFERENCES countries(code) ON UPDATE CASCADE,
  ADD FOREIGN KEY IF NOT EXISTS fk_country_code (country_code) REFERENCES countries(code) ON UPDATE CASCADE;

-- Actualizar usuarios existentes a email_verified si tienen email
UPDATE users
SET
  verification_status = 'email_verified',
  email_verified = TRUE
WHERE email IS NOT NULL AND email_verified = FALSE;
