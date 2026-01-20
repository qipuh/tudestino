-- Migration para agregar categorías de entertainment al menú
-- Fecha: 2026-01-20
-- Descripción: Agrega categorías para negocios de entretenimiento (bares, discotecas, etc.)

-- Modificar el ENUM de category en menu_items para incluir las nuevas categorías
ALTER TABLE menu_items
MODIFY COLUMN category ENUM(
  'appetizers',
  'main_courses',
  'desserts',
  'beverages',
  'alcoholic',
  'breakfast',
  'specials',
  'drinks',
  'cocktails',
  'beer',
  'wine',
  'spirits',
  'snacks',
  'packages'
) NOT NULL DEFAULT 'main_courses';
