-- Agregar campos de verificación a la tabla users (verificando existencia)

-- Campos de verificación
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE COMMENT ''Email verificado''', 'SELECT ''Column email_verified already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_code');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN email_verification_code VARCHAR(6) COMMENT ''Código de verificación de email''', 'SELECT ''Column email_verification_code already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_expires');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN email_verification_expires DATETIME COMMENT ''Expiración del código de email''', 'SELECT ''Column email_verification_expires already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone_verified');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE COMMENT ''Teléfono verificado''', 'SELECT ''Column phone_verified already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone_verification_code');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN phone_verification_code VARCHAR(6) COMMENT ''Código de verificación de teléfono''', 'SELECT ''Column phone_verification_code already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone_verification_expires');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN phone_verification_expires DATETIME COMMENT ''Expiración del código de teléfono''', 'SELECT ''Column phone_verification_expires already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'identity_verified');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN identity_verified BOOLEAN DEFAULT FALSE COMMENT ''Identidad verificada''', 'SELECT ''Column identity_verified already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'verification_status');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN verification_status ENUM(''pending'', ''email_verified'', ''phone_verified'', ''fully_verified'', ''rejected'') DEFAULT ''pending'' COMMENT ''Estado general de verificación''', 'SELECT ''Column verification_status already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Campos de identidad
SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'first_name');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN first_name VARCHAR(100) COMMENT ''Nombre(s)''', 'SELECT ''Column first_name already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'last_name');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN last_name VARCHAR(100) COMMENT ''Apellido paterno''', 'SELECT ''Column last_name already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'middle_name');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN middle_name VARCHAR(100) COMMENT ''Apellido materno''', 'SELECT ''Column middle_name already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'birth_date');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN birth_date DATE COMMENT ''Fecha de nacimiento''', 'SELECT ''Column birth_date already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nationality_code');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN nationality_code CHAR(2) COMMENT ''Código de país de nacionalidad''', 'SELECT ''Column nationality_code already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'document_type');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN document_type VARCHAR(50) COMMENT ''Tipo de documento''', 'SELECT ''Column document_type already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'document_number');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN document_number VARCHAR(50) COMMENT ''Número de documento''', 'SELECT ''Column document_number already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'document_front_photo');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN document_front_photo VARCHAR(255) COMMENT ''Foto frontal del documento''', 'SELECT ''Column document_front_photo already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'document_back_photo');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN document_back_photo VARCHAR(255) COMMENT ''Foto trasera del documento''', 'SELECT ''Column document_back_photo already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'selfie_photo');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN selfie_photo VARCHAR(255) COMMENT ''Foto selfie del usuario''', 'SELECT ''Column selfie_photo already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'identity_verification_date');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN identity_verification_date DATETIME COMMENT ''Fecha de verificación de identidad''', 'SELECT ''Column identity_verification_date already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'identity_verified_by');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN identity_verified_by INT COMMENT ''Admin que verificó''', 'SELECT ''Column identity_verified_by already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'identity_rejection_reason');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN identity_rejection_reason TEXT COMMENT ''Razón de rechazo de verificación''', 'SELECT ''Column identity_rejection_reason already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'country_code');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN country_code CHAR(2) COMMENT ''Código de país del teléfono''', 'SELECT ''Column country_code already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

SET @exist := (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'tudestino' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'trust_score');
SET @sqlstmt := IF(@exist = 0, 'ALTER TABLE users ADD COLUMN trust_score INT DEFAULT 0 COMMENT ''Puntuación de confianza (0-100)''', 'SELECT ''Column trust_score already exists'' AS info');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;

-- Actualizar usuarios existentes a email_verified si tienen email
UPDATE users
SET
  verification_status = 'email_verified',
  email_verified = TRUE
WHERE email IS NOT NULL AND (email_verified IS NULL OR email_verified = FALSE);
