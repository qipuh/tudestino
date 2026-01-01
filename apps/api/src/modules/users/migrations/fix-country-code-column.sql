-- Cambiar el campo country_code para que pueda almacenar códigos de teléfono
-- De CHAR(2) a VARCHAR(10) para soportar códigos como '+51', '+1', '+52', etc.
ALTER TABLE users MODIFY COLUMN country_code VARCHAR(10) NULL;
