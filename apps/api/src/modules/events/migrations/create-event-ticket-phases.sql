-- Migración: Crear tabla event_ticket_phases para gestionar descuentos por fases
-- Fecha: 2025-01-31
-- Descripción: Permite definir múltiples fases de precio para un mismo tipo de entrada
--              Ejemplo: Early Bird (S/ 50), Fase 1 (S/ 70), Fase 2 (S/ 90)

CREATE TABLE IF NOT EXISTS event_ticket_phases (
  id CHAR(36) PRIMARY KEY,
  ticket_id CHAR(36) NOT NULL,

  -- Información de la fase
  name VARCHAR(255) NOT NULL COMMENT 'Nombre de la fase (Ej: Early Bird, Fase 1, Última oportunidad)',
  description TEXT COMMENT 'Descripción opcional de la fase',

  -- Precio de esta fase
  price DECIMAL(10, 2) NOT NULL DEFAULT 0 COMMENT 'Precio de la entrada en esta fase',

  -- Disponibilidad
  quantity_available INT COMMENT 'Cantidad de entradas disponibles en esta fase (NULL = ilimitado)',
  sold_quantity INT NOT NULL DEFAULT 0 COMMENT 'Cantidad vendida en esta fase',

  -- Período de validez de la fase
  start_date DATETIME NOT NULL COMMENT 'Fecha/hora de inicio de esta fase',
  end_date DATETIME NOT NULL COMMENT 'Fecha/hora de fin de esta fase',

  -- Orden de visualización
  display_order INT NOT NULL DEFAULT 0 COMMENT 'Orden en que se muestra la fase',

  -- Estado
  status ENUM('upcoming', 'active', 'ended', 'sold_out', 'inactive') NOT NULL DEFAULT 'upcoming' COMMENT 'Estado actual de la fase',
  is_visible BOOLEAN NOT NULL DEFAULT TRUE COMMENT 'Si la fase es visible para los usuarios',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Restricciones
  CONSTRAINT fk_phase_ticket FOREIGN KEY (ticket_id) REFERENCES event_tickets(id) ON DELETE CASCADE,

  -- Índices
  INDEX idx_ticket_id (ticket_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_status (status),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Fases de precio para tickets de eventos';

-- Agregar campo para indicar si un ticket usa fases
ALTER TABLE event_tickets
ADD COLUMN uses_phases BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Si este ticket usa sistema de fases de precio' AFTER is_visible;

-- Comentarios informativos
-- NOTA: Cuando uses_phases = TRUE:
--   - El precio base del ticket (event_tickets.price) se ignora
--   - Se usa el precio de la fase activa actual
--   - La cantidad disponible se calcula sumando todas las fases
