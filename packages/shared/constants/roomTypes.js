export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TRIPLE: 'triple',
  QUADRUPLE: 'quadruple',
  SUITE: 'suite',
  JUNIOR_SUITE: 'junior_suite',
  FAMILY: 'family',
  SHARED_DORMITORY: 'shared_dormitory',
  STUDIO: 'studio',
  DELUXE: 'deluxe',
  EXECUTIVE: 'executive',
  PENTHOUSE: 'penthouse',
};

export const ROOM_TYPE_LABELS = {
  [ROOM_TYPES.SINGLE]: 'Habitación Individual',
  [ROOM_TYPES.DOUBLE]: 'Habitación Doble',
  [ROOM_TYPES.TRIPLE]: 'Habitación Triple',
  [ROOM_TYPES.QUADRUPLE]: 'Habitación Cuádruple',
  [ROOM_TYPES.SUITE]: 'Suite',
  [ROOM_TYPES.JUNIOR_SUITE]: 'Junior Suite',
  [ROOM_TYPES.FAMILY]: 'Habitación Familiar',
  [ROOM_TYPES.SHARED_DORMITORY]: 'Dormitorio Compartido',
  [ROOM_TYPES.STUDIO]: 'Estudio',
  [ROOM_TYPES.DELUXE]: 'Habitación Deluxe',
  [ROOM_TYPES.EXECUTIVE]: 'Habitación Ejecutiva',
  [ROOM_TYPES.PENTHOUSE]: 'Penthouse',
};

export const ROOM_TYPE_DESCRIPTIONS = {
  [ROOM_TYPES.SINGLE]: 'Habitación para 1 persona con cama individual',
  [ROOM_TYPES.DOUBLE]: 'Habitación para 2 personas con cama doble o 2 individuales',
  [ROOM_TYPES.TRIPLE]: 'Habitación para 3 personas',
  [ROOM_TYPES.QUADRUPLE]: 'Habitación para 4 personas',
  [ROOM_TYPES.SUITE]: 'Habitación amplia con sala de estar separada',
  [ROOM_TYPES.JUNIOR_SUITE]: 'Habitación con zona de estar integrada',
  [ROOM_TYPES.FAMILY]: 'Habitación amplia ideal para familias (4+ personas)',
  [ROOM_TYPES.SHARED_DORMITORY]: 'Habitación compartida con múltiples camas (hostal)',
  [ROOM_TYPES.STUDIO]: 'Espacio único con cocina integrada',
  [ROOM_TYPES.DELUXE]: 'Habitación de lujo con amenidades premium',
  [ROOM_TYPES.EXECUTIVE]: 'Habitación premium para viajeros de negocios',
  [ROOM_TYPES.PENTHOUSE]: 'Suite de lujo en el último piso',
};

// Bed types
export const BED_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  QUEEN: 'queen',
  KING: 'king',
  SOFA_BED: 'sofa_bed',
  BUNK_BED: 'bunk_bed',
};

export const BED_TYPE_LABELS = {
  [BED_TYPES.SINGLE]: 'Individual (90-130cm)',
  [BED_TYPES.DOUBLE]: 'Doble (131-150cm)',
  [BED_TYPES.QUEEN]: 'Queen (151-180cm)',
  [BED_TYPES.KING]: 'King (181-210cm)',
  [BED_TYPES.SOFA_BED]: 'Sofá cama',
  [BED_TYPES.BUNK_BED]: 'Litera',
};
