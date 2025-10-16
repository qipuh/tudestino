export const PROPERTY_AMENITIES = {
  // Food & Dining (Servicios de Establecimiento - Solo hoteles/moteles)
  RESTAURANT: 'restaurant',
  ROOM_SERVICE: 'room_service',
  BAR: 'bar',
  BREAKFAST: 'breakfast',

  // Services (Servicios de Establecimiento - Solo hoteles/moteles)
  RECEPTION_24H: 'reception_24h',
  AIRPORT_SHUTTLE: 'airport_shuttle',
  CONCIERGE: 'concierge',
  LUGGAGE_STORAGE: 'luggage_storage',

  // Wellness & Recreation (Bienestar y Recreación - Todos)
  SAUNA: 'sauna',
  GYM: 'gym',
  SPA: 'spa',
  HOT_TUB: 'hot_tub',
  POOL: 'pool',
  WATER_PARK: 'water_park',
  BEACH: 'beach',

  // Outdoor (Espacios Exteriores - Todos)
  GARDEN: 'garden',
  TERRACE: 'terrace',
  BBQ: 'bbq',
  BALCONY: 'balcony',

  // General (Comodidades Generales - Todos)
  WIFI: 'wifi',
  AIR_CONDITIONING: 'air_conditioning',
  HEATING: 'heating',
  NON_SMOKING_ROOMS: 'non_smoking_rooms',
  FAMILY_ROOMS: 'family_rooms',
  EV_CHARGING: 'ev_charging',
  PETS_ALLOWED: 'pets_allowed',
  WHEELCHAIR_ACCESSIBLE: 'wheelchair_accessible',

  // Kitchen (Cocina - Para departamentos/casas)
  KITCHEN: 'kitchen',
  KITCHENETTE: 'kitchenette',
  STOVE: 'stove',
  OVEN: 'oven',
  DISHWASHER: 'dishwasher',
  WASHING_MACHINE: 'washing_machine',
  DRYER: 'dryer',

  // Shared Spaces (Ambientes compartidos - Todos)
  LIVING_ROOM: 'living_room',
  SHARED_KITCHEN: 'shared_kitchen',
  SHARED_BATHROOM: 'shared_bathroom',
  SHARED_LOUNGE: 'shared_lounge',

  // Parking
  PARKING_FREE: 'parking_free',
  PARKING_PAID: 'parking_paid',
  PARKING_PRIVATE: 'parking_private',
  PARKING_PUBLIC: 'parking_public',
};

export const PROPERTY_AMENITY_LABELS = {
  [PROPERTY_AMENITIES.RESTAURANT]: 'Restaurante',
  [PROPERTY_AMENITIES.ROOM_SERVICE]: 'Servicio de habitaciones',
  [PROPERTY_AMENITIES.BAR]: 'Bar',
  [PROPERTY_AMENITIES.BREAKFAST]: 'Desayuno',
  [PROPERTY_AMENITIES.RECEPTION_24H]: 'Recepción 24 horas',
  [PROPERTY_AMENITIES.AIRPORT_SHUTTLE]: 'Traslado aeropuerto',
  [PROPERTY_AMENITIES.CONCIERGE]: 'Conserje',
  [PROPERTY_AMENITIES.LUGGAGE_STORAGE]: 'Consigna de equipaje',
  [PROPERTY_AMENITIES.SAUNA]: 'Sauna',
  [PROPERTY_AMENITIES.GYM]: 'Gimnasio',
  [PROPERTY_AMENITIES.SPA]: 'Spa y centro de bienestar',
  [PROPERTY_AMENITIES.HOT_TUB]: 'Bañera de hidromasaje / jacuzzi',
  [PROPERTY_AMENITIES.POOL]: 'Piscina',
  [PROPERTY_AMENITIES.WATER_PARK]: 'Parque acuático',
  [PROPERTY_AMENITIES.BEACH]: 'Playa',
  [PROPERTY_AMENITIES.GARDEN]: 'Jardín',
  [PROPERTY_AMENITIES.TERRACE]: 'Terraza',
  [PROPERTY_AMENITIES.BBQ]: 'Barbacoa',
  [PROPERTY_AMENITIES.BALCONY]: 'Balcón',
  [PROPERTY_AMENITIES.WIFI]: 'WiFi gratis',
  [PROPERTY_AMENITIES.AIR_CONDITIONING]: 'Aire acondicionado',
  [PROPERTY_AMENITIES.HEATING]: 'Calefacción',
  [PROPERTY_AMENITIES.NON_SMOKING_ROOMS]: 'Habitaciones sin humo',
  [PROPERTY_AMENITIES.FAMILY_ROOMS]: 'Habitaciones familiares',
  [PROPERTY_AMENITIES.EV_CHARGING]: 'Estación de carga de vehículos eléctricos',
  [PROPERTY_AMENITIES.PETS_ALLOWED]: 'Se admiten mascotas',
  [PROPERTY_AMENITIES.WHEELCHAIR_ACCESSIBLE]: 'Accesible para sillas de ruedas',
  [PROPERTY_AMENITIES.KITCHEN]: 'Cocina completa',
  [PROPERTY_AMENITIES.KITCHENETTE]: 'Cocineta',
  [PROPERTY_AMENITIES.STOVE]: 'Estufa / Cocina',
  [PROPERTY_AMENITIES.OVEN]: 'Horno',
  [PROPERTY_AMENITIES.DISHWASHER]: 'Lavavajillas',
  [PROPERTY_AMENITIES.WASHING_MACHINE]: 'Lavadora',
  [PROPERTY_AMENITIES.DRYER]: 'Secadora',
  [PROPERTY_AMENITIES.LIVING_ROOM]: 'Sala de estar',
  [PROPERTY_AMENITIES.SHARED_KITCHEN]: 'Cocina compartida',
  [PROPERTY_AMENITIES.SHARED_BATHROOM]: 'Baño compartido',
  [PROPERTY_AMENITIES.SHARED_LOUNGE]: 'Salón compartido',
  [PROPERTY_AMENITIES.PARKING_FREE]: 'Parking gratis',
  [PROPERTY_AMENITIES.PARKING_PAID]: 'Parking de pago',
  [PROPERTY_AMENITIES.PARKING_PRIVATE]: 'Parking privado',
  [PROPERTY_AMENITIES.PARKING_PUBLIC]: 'Parking público',
};

export const ROOM_AMENITIES = {
  // General
  COAT_RACK: 'coat_rack',
  FLAT_SCREEN_TV: 'flat_screen_tv',
  AIR_CONDITIONING: 'air_conditioning',
  BEDDING: 'bedding',
  DESK: 'desk',
  ALARM_CLOCK: 'alarm_clock',
  TOWELS: 'towels',
  WARDROBE: 'wardrobe',
  HEATING: 'heating',
  FAN: 'fan',
  SAFE: 'safe',
  GROUND_FLOOR: 'ground_floor',

  // Views & Outdoor
  BALCONY: 'balcony',
  TERRACE: 'terrace',
  VIEWS: 'views',

  // Food & Drink
  ELECTRIC_KETTLE: 'electric_kettle',
  COFFEE_MACHINE: 'coffee_machine',
  DINING_AREA: 'dining_area',
  DINING_TABLE: 'dining_table',
  MICROWAVE: 'microwave',
  MINIBAR: 'minibar',
  REFRIGERATOR: 'refrigerator',

  // Bathroom
  PRIVATE_BATHROOM: 'private_bathroom',
  BATHTUB: 'bathtub',
  SHOWER: 'shower',
  HAIRDRYER: 'hairdryer',
  TOILETRIES: 'toiletries',
};

export const ROOM_AMENITY_LABELS = {
  [ROOM_AMENITIES.COAT_RACK]: 'Perchero',
  [ROOM_AMENITIES.FLAT_SCREEN_TV]: 'TV de pantalla plana',
  [ROOM_AMENITIES.AIR_CONDITIONING]: 'Aire acondicionado',
  [ROOM_AMENITIES.BEDDING]: 'Ropa de cama',
  [ROOM_AMENITIES.DESK]: 'Escritorio',
  [ROOM_AMENITIES.ALARM_CLOCK]: 'Servicio de despertador',
  [ROOM_AMENITIES.TOWELS]: 'Toallas',
  [ROOM_AMENITIES.WARDROBE]: 'Armario',
  [ROOM_AMENITIES.HEATING]: 'Calefacción',
  [ROOM_AMENITIES.FAN]: 'Ventilador',
  [ROOM_AMENITIES.SAFE]: 'Caja fuerte',
  [ROOM_AMENITIES.GROUND_FLOOR]: 'Toda la unidad en la planta baja',
  [ROOM_AMENITIES.BALCONY]: 'Balcón',
  [ROOM_AMENITIES.TERRACE]: 'Terraza',
  [ROOM_AMENITIES.VIEWS]: 'Vistas',
  [ROOM_AMENITIES.ELECTRIC_KETTLE]: 'Hervidor eléctrico',
  [ROOM_AMENITIES.COFFEE_MACHINE]: 'Tetera / cafetera',
  [ROOM_AMENITIES.DINING_AREA]: 'Zona de comedor',
  [ROOM_AMENITIES.DINING_TABLE]: 'Mesa de comedor',
  [ROOM_AMENITIES.MICROWAVE]: 'Microondas',
  [ROOM_AMENITIES.MINIBAR]: 'Minibar',
  [ROOM_AMENITIES.REFRIGERATOR]: 'Nevera',
  [ROOM_AMENITIES.PRIVATE_BATHROOM]: 'Baño privado',
  [ROOM_AMENITIES.BATHTUB]: 'Bañera',
  [ROOM_AMENITIES.SHOWER]: 'Ducha',
  [ROOM_AMENITIES.HAIRDRYER]: 'Secador de pelo',
  [ROOM_AMENITIES.TOILETRIES]: 'Artículos de aseo',
};

export const AMENITY_CATEGORIES = {
  GENERAL: 'general',
  VIEWS_OUTDOOR: 'views_outdoor',
  FOOD_DRINK: 'food_drink',
  BATHROOM: 'bathroom',
};

export const AMENITY_CATEGORY_LABELS = {
  [AMENITY_CATEGORIES.GENERAL]: 'Servicios generales',
  [AMENITY_CATEGORIES.VIEWS_OUTDOOR]: 'Vistas y exterior',
  [AMENITY_CATEGORIES.FOOD_DRINK]: 'Comida y bebida',
  [AMENITY_CATEGORIES.BATHROOM]: 'Baño',
};

// Categorías de amenities de propiedad
export const PROPERTY_AMENITY_CATEGORIES = {
  ESTABLISHMENT_SERVICES: 'establishment_services', // Solo hoteles/moteles
  WELLNESS_RECREATION: 'wellness_recreation', // Todos
  OUTDOOR: 'outdoor', // Todos
  GENERAL_COMFORTS: 'general_comforts', // Todos (sin family_rooms para departamentos)
  KITCHEN: 'kitchen', // Departamentos/casas
  SHARED_SPACES: 'shared_spaces', // Todos
};

export const PROPERTY_AMENITY_CATEGORY_LABELS = {
  [PROPERTY_AMENITY_CATEGORIES.ESTABLISHMENT_SERVICES]: 'Servicios del establecimiento',
  [PROPERTY_AMENITY_CATEGORIES.WELLNESS_RECREATION]: 'Bienestar y recreación',
  [PROPERTY_AMENITY_CATEGORIES.OUTDOOR]: 'Espacios exteriores',
  [PROPERTY_AMENITY_CATEGORIES.GENERAL_COMFORTS]: 'Comodidades generales',
  [PROPERTY_AMENITY_CATEGORIES.KITCHEN]: 'Cocina',
  [PROPERTY_AMENITY_CATEGORIES.SHARED_SPACES]: 'Ambientes compartidos',
};

// Helper: Obtener amenities disponibles según tipo de alojamiento
export const getAvailableAmenitiesByType = (accommodationType) => {
  const isMultiUnit = ['hotel', 'motel', 'hostel', 'resort', 'bed_and_breakfast'].includes(accommodationType);
  const isPrivateSpace = ['apartment', 'house', 'villa', 'cabin', 'room'].includes(accommodationType);

  const categories = {};

  if (isMultiUnit) {
    // Hoteles/Moteles/Hostales: Mostrar servicios de establecimiento
    categories[PROPERTY_AMENITY_CATEGORIES.ESTABLISHMENT_SERVICES] = [
      PROPERTY_AMENITIES.RESTAURANT,
      PROPERTY_AMENITIES.ROOM_SERVICE,
      PROPERTY_AMENITIES.BAR,
      PROPERTY_AMENITIES.BREAKFAST,
      PROPERTY_AMENITIES.RECEPTION_24H,
      PROPERTY_AMENITIES.AIRPORT_SHUTTLE,
      PROPERTY_AMENITIES.CONCIERGE,
      PROPERTY_AMENITIES.LUGGAGE_STORAGE,
    ];
  }

  // Bienestar y Recreación (Todos)
  categories[PROPERTY_AMENITY_CATEGORIES.WELLNESS_RECREATION] = [
    PROPERTY_AMENITIES.SAUNA,
    PROPERTY_AMENITIES.GYM,
    PROPERTY_AMENITIES.SPA,
    PROPERTY_AMENITIES.HOT_TUB,
    PROPERTY_AMENITIES.POOL,
    PROPERTY_AMENITIES.WATER_PARK,
    PROPERTY_AMENITIES.BEACH,
  ];

  // Espacios Exteriores (Todos)
  categories[PROPERTY_AMENITY_CATEGORIES.OUTDOOR] = [
    PROPERTY_AMENITIES.GARDEN,
    PROPERTY_AMENITIES.TERRACE,
    PROPERTY_AMENITIES.BBQ,
    PROPERTY_AMENITIES.BALCONY,
  ];

  // Comodidades Generales
  const generalComforts = [
    PROPERTY_AMENITIES.WIFI,
    PROPERTY_AMENITIES.AIR_CONDITIONING,
    PROPERTY_AMENITIES.HEATING,
    PROPERTY_AMENITIES.NON_SMOKING_ROOMS,
    PROPERTY_AMENITIES.EV_CHARGING,
    PROPERTY_AMENITIES.PETS_ALLOWED,
    PROPERTY_AMENITIES.WHEELCHAIR_ACCESSIBLE,
  ];

  // Solo incluir family_rooms en hoteles
  if (isMultiUnit) {
    generalComforts.push(PROPERTY_AMENITIES.FAMILY_ROOMS);
  }

  categories[PROPERTY_AMENITY_CATEGORIES.GENERAL_COMFORTS] = generalComforts;

  // Cocina (Para departamentos/casas)
  if (isPrivateSpace) {
    categories[PROPERTY_AMENITY_CATEGORIES.KITCHEN] = [
      PROPERTY_AMENITIES.KITCHEN,
      PROPERTY_AMENITIES.KITCHENETTE,
      PROPERTY_AMENITIES.STOVE,
      PROPERTY_AMENITIES.OVEN,
      PROPERTY_AMENITIES.DISHWASHER,
      PROPERTY_AMENITIES.WASHING_MACHINE,
      PROPERTY_AMENITIES.DRYER,
    ];
  }

  // Ambientes Compartidos (Todos)
  categories[PROPERTY_AMENITY_CATEGORIES.SHARED_SPACES] = [
    PROPERTY_AMENITIES.LIVING_ROOM,
    PROPERTY_AMENITIES.SHARED_KITCHEN,
    PROPERTY_AMENITIES.SHARED_BATHROOM,
    PROPERTY_AMENITIES.SHARED_LOUNGE,
  ];

  return categories;
};
