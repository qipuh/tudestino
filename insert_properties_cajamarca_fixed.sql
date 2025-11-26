USE tudestino_prod;

-- Generar UUIDs únicos para las propiedades
SET @uuid1 = UUID();
SET @uuid2 = UUID();
SET @uuid3 = UUID();
SET @uuid4 = UUID();
SET @uuid5 = UUID();
SET @uuid6 = UUID();
SET @uuid7 = UUID();
SET @uuid8 = UUID();
SET @uuid9 = UUID();

-- UUIDs para habitaciones
SET @room1 = UUID();
SET @room2 = UUID();
SET @room3 = UUID();
SET @room4 = UUID();
SET @room5 = UUID();
SET @room6 = UUID();
SET @room7 = UUID();
SET @room8 = UUID();
SET @room9 = UUID();
SET @room10 = UUID();
SET @room11 = UUID();
SET @room12 = UUID();
SET @room13 = UUID();
SET @room14 = UUID();

-- Usuario host demo
SET @hostId = '58a81942-55fb-4d71-9434-e45dccb3f634';

-- INSERTAR PROPIEDADES

-- 1. Hotel Plaza de Armas Cajamarca
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, hotelName, hotelCategory,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType, parkingDetails,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed, petFee, petFeePer,
    additionalRules, status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid1, @hostId, 'hotel', true, 'Hotel Plaza de Armas Cajamarca', 4,
    'Hotel Plaza de Armas Cajamarca', 'Elegante hotel ubicado en el corazón histórico de Cajamarca, frente a la emblemática Plaza de Armas. Ofrecemos habitaciones cómodas con vista panorámica, restaurante gourmet y servicios de primera clase para una experiencia inolvidable.',
    'flexible',
    'Jr. Amazonas 750', 'Cajamarca', 'Cajamarca', 'Perú', '06001',
    -7.1607, -78.5155,
    '["wifi", "restaurant", "room_service", "laundry", "concierge", "business_center", "elevator"]',
    true, 'paid', '{"price": 15, "currency": "PEN", "description": "Estacionamiento vigilado 24h"}',
    '14:00', '12:00', true, 'no', null, null,
    'No se permite fumar en las habitaciones. Respete el horario de silencio después de las 22:00.',
    'published', 4.5, 89, true,
    NOW(), NOW()
);

-- 2. Hotel El Portal del Marqués
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, hotelName, hotelCategory,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid2, @hostId, 'hotel', true, 'El Portal del Marqués', 3,
    'Hotel El Portal del Marqués', 'Hotel boutique con arquitectura colonial restaurada, ubicado en una casona histórica del siglo XVIII. Combina la elegancia del pasado con las comodidades modernas, ofreciendo una experiencia única en el centro histórico de Cajamarca.',
    'standard',
    'Jr. Del Comercio 644', 'Cajamarca', 'Cajamarca', 'Perú', '06001',
    -7.1615, -78.5149,
    '["wifi", "restaurant", "spa", "garden", "library", "terrace"]',
    true, 'free',
    '15:00', '11:00', true, 'yes_free',
    'published', 4.3, 67, true,
    NOW(), NOW()
);

-- 3. Hotel Costa del Sol Cajamarca
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, hotelName, hotelCategory,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid3, @hostId, 'hotel', true, 'Costa del Sol Cajamarca', 4,
    'Hotel Costa del Sol Cajamarca', 'Hotel moderno y sofisticado ubicado en la zona empresarial de Cajamarca. Cuenta con amplias habitaciones, centro de negocios, gimnasio y restaurante especializado en cocina novoandina. Ideal para viajeros de negocios y turismo.',
    'moderate',
    'Av. Vía de Evitamiento Norte 1611', 'Cajamarca', 'Cajamarca', 'Perú', '06003',
    -7.1421, -78.5089,
    '["wifi", "restaurant", "gym", "business_center", "pool", "spa", "bar", "room_service"]',
    true, 'free',
    '14:30', '12:00', true, 'yes_paid',
    'published', 4.6, 112, true,
    NOW(), NOW()
);

-- 4. Hotel Laguna Seca
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, hotelName, hotelCategory,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid4, @hostId, 'hotel', true, 'Hotel Laguna Seca', 3,
    'Hotel Laguna Seca Cajamarca', 'Hotel temático inspirado en los famosos Baños del Inca, ofrece aguas termales naturales y tratamientos de relajación. Ubicado en los alrededores de Cajamarca, es perfecto para quienes buscan descanso y conexión con la naturaleza.',
    'flexible',
    'Carretera a los Baños del Inca Km 6', 'Cajamarca', 'Cajamarca', 'Perú', '06002',
    -7.1689, -78.4456,
    '["wifi", "restaurant", "spa", "hot_springs", "garden", "parking", "massage"]',
    true, 'free',
    '14:00', '12:00', true, 'yes_free',
    'published', 4.2, 78, true,
    NOW(), NOW()
);

-- 5. Hotel El Cabildo
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, hotelName, hotelCategory,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid5, @hostId, 'hotel', true, 'El Cabildo', 3,
    'Hotel El Cabildo', 'Acogedor hotel familiar ubicado a pocas cuadras de la Plaza de Armas. Combina hospitalidad cajamarquina con servicios modernos. Perfecto para familias y viajeros que buscan una experiencia auténtica en el corazón de la ciudad.',
    'standard',
    'Jr. Dos de Mayo 311', 'Cajamarca', 'Cajamarca', 'Perú', '06001',
    -7.1622, -78.5167,
    '["wifi", "restaurant", "laundry", "tour_desk", "family_friendly"]',
    true, 'no',
    '14:00', '11:30', true, 'no',
    'published', 4.1, 94, true,
    NOW(), NOW()
);

-- 6. Departamento Centro Histórico
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits, 
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid6, @hostId, 'apartment', false,
    'Departamento Moderno Centro Histórico', 'Hermoso departamento completamente equipado en el corazón del centro histórico de Cajamarca. A solo 2 cuadras de la Plaza de Armas, cuenta con 2 dormitorios, cocina completa, sala-comedor y balcón con vista a la ciudad colonial. Ideal para familias o grupos.',
    'flexible',
    'Jr. Amalia Puga 589, Piso 3', 'Cajamarca', 'Cajamarca', 'Perú', '06001',
    -7.1619, -78.5162,
    '["wifi", "kitchen", "washer", "balcony", "city_view", "heating"]',
    false, 'no',
    '15:00', '11:00', true, 'no',
    'published', 4.7, 23, true,
    NOW(), NOW()
);

-- 7. Departamento Vista Panorámica
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid7, @hostId, 'apartment', false,
    'Departamento Vista Panorámica Cajamarca', 'Moderno departamento de 3 dormitorios con espectacular vista panorámica de la ciudad y las montañas circundantes. Ubicado en edificio residencial con seguridad 24h, cuenta con todas las comodidades para una estadía perfecta. Terraza privada y estacionamiento incluido.',
    'moderate',
    'Av. Hoyos Rubio 1150, Piso 8', 'Cajamarca', 'Cajamarca', 'Perú', '06002',
    -7.1501, -78.5201,
    '["wifi", "kitchen", "washer", "terrace", "mountain_view", "security", "elevator", "parking"]',
    false, 'free',
    '16:00', '10:00', true, 'yes_free',
    'published', 4.8, 15, true,
    NOW(), NOW()
);

-- 8. Habitación Privada Casa Colonial
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid8, @hostId, 'room', false,
    'Habitación en Casa Colonial Histórica', 'Hermosa habitación privada en una auténtica casa colonial del siglo XIX, cuidadosamente restaurada manteniendo su encanto original. La habitación cuenta con baño privado, mobiliario de época y acceso a patios coloniales con jardines. Experiencia cultural única.',
    'standard',
    'Jr. Cinco Esquinas 570', 'Cajamarca', 'Cajamarca', 'Perú', '06001',
    -7.1635, -78.5143,
    '["wifi", "garden", "historical", "shared_kitchen", "private_bathroom", "colonial_architecture"]',
    true, 'no',
    '14:00', '11:00', false, 'no',
    'published', 4.4, 31, true,
    NOW(), NOW()
);

-- 9. Habitación Familiar Los Eucaliptos
INSERT INTO properties (
    id, hostId, accommodationType, multipleUnits,
    propertyName, description, cancellationPolicy,
    addressStreet, addressCity, addressState, addressCountry, addressZipCode,
    addressLatitude, addressLongitude,
    propertyAmenities, breakfastIncluded, parkingType,
    checkInTime, checkOutTime, childrenAllowed, petsAllowed,
    status, ratingAverage, ratingCount, isActive, 
    createdAt, updatedAt
) VALUES (
    @uuid9, @hostId, 'room', false,
    'Habitación Familiar Los Eucaliptos', 'Amplia habitación familiar en casa residencial ubicada en el tranquilo barrio Los Eucaliptos. Perfecta para familias, cuenta con cama matrimonial y litera, baño privado, área de estar y acceso a jardín. Ambiente familiar y acogedor con desayuno incluido.',
    'flexible',
    'Urb. Los Eucaliptos Mz. C Lote 15', 'Cajamarca', 'Cajamarca', 'Perú', '06004',
    -7.1389, -78.5298,
    '["wifi", "garden", "family_friendly", "private_bathroom", "shared_areas", "quiet_area"]',
    true, 'free',
    '15:00', '10:00', true, 'yes_free',
    'published', 4.6, 18, true,
    NOW(), NOW()
);

-- INSERTAR HABITACIONES CON ESTRUCTURA CORRECTA

-- Habitaciones Hotel Plaza de Armas
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room1, @uuid1, 'double', 'Habitación Standard Vista Ciudad', 1, 2, '[{"type": "double", "count": 1}]', 180.00, 
'["wifi", "tv", "minibar", "air_conditioning", "safe", "city_view"]',
'["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800", "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800"]', 
true, NOW(), NOW()),

(@room2, @uuid1, 'suite', 'Suite Ejecutiva Plaza de Armas', 1, 4, '[{"type": "king", "count": 1}, {"type": "sofa_bed", "count": 1}]', 320.00,
'["wifi", "tv", "minibar", "air_conditioning", "safe", "plaza_view", "sitting_area", "bathtub"]',
'["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"]',
true, NOW(), NOW());

-- Habitaciones Hotel El Portal del Marqués  
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room3, @uuid2, 'double', 'Habitación Colonial', 1, 2, '[{"type": "double", "count": 1}]', 150.00,
'["wifi", "tv", "heating", "colonial_decor", "private_bathroom"]',
'["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800", "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800"]',
true, NOW(), NOW()),

(@room4, @uuid2, 'deluxe', 'Habitación Deluxe Marqués', 1, 3, '[{"type": "queen", "count": 1}, {"type": "single", "count": 1}]', 220.00,
'["wifi", "tv", "heating", "colonial_decor", "garden_view", "sitting_area"]',
'["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800"]',
true, NOW(), NOW());

-- Habitaciones Hotel Costa del Sol
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room5, @uuid3, 'double', 'Habitación Superior', 1, 2, '[{"type": "double", "count": 1}]', 240.00,
'["wifi", "tv", "air_conditioning", "minibar", "safe", "work_desk", "modern_bathroom"]',
'["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800", "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"]',
true, NOW(), NOW()),

(@room6, @uuid3, 'suite', 'Suite Ejecutiva Costa del Sol', 1, 4, '[{"type": "king", "count": 1}, {"type": "sofa_bed", "count": 1}]', 420.00,
'["wifi", "tv", "air_conditioning", "minibar", "safe", "mountain_view", "living_room", "jacuzzi"]',
'["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800", "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800"]',
true, NOW(), NOW());

-- Habitaciones Hotel Laguna Seca
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room7, @uuid4, 'double', 'Habitación Termal', 1, 2, '[{"type": "double", "count": 1}]', 195.00,
'["wifi", "tv", "heating", "thermal_access", "nature_view", "spa_access"]',
'["https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800", "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"]',
true, NOW(), NOW()),

(@room8, @uuid4, 'deluxe', 'Suite Termal con Jacuzzi', 1, 4, '[{"type": "king", "count": 1}, {"type": "sofa_bed", "count": 1}]', 350.00,
'["wifi", "tv", "heating", "private_jacuzzi", "thermal_access", "mountain_view", "spa_access"]',
'["https://images.unsplash.com/photo-1578874691223-64558db19d3d?w=800", "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800"]',
true, NOW(), NOW());

-- Habitaciones Hotel El Cabildo
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room9, @uuid5, 'family', 'Habitación Familiar', 1, 4, '[{"type": "double", "count": 1}, {"type": "single", "count": 2}]', 140.00,
'["wifi", "tv", "heating", "family_friendly", "private_bathroom"]',
'["https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=800", "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800"]',
true, NOW(), NOW()),

(@room10, @uuid5, 'double', 'Habitación Doble', 1, 2, '[{"type": "double", "count": 1}]', 120.00,
'["wifi", "tv", "heating", "private_bathroom", "city_view"]',
'["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", "https://images.unsplash.com/photo-1584132915807-fd1f5bc078f?w=800"]',
true, NOW(), NOW());

-- Habitaciones Departamento Centro Histórico
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room11, @uuid6, 'studio', 'Departamento Completo 2 Dormitorios', 1, 6, '[{"type": "double", "count": 2}, {"type": "sofa_bed", "count": 1}]', 280.00,
'["wifi", "kitchen", "washer", "balcony", "city_view", "heating", "full_apartment"]',
'["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800", "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=800"]',
true, NOW(), NOW());

-- Habitaciones Departamento Vista Panorámica
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room12, @uuid7, 'studio', 'Departamento 3 Dormitorios Vista Panorámica', 1, 8, '[{"type": "king", "count": 1}, {"type": "double", "count": 2}, {"type": "sofa_bed", "count": 1}]', 380.00,
'["wifi", "kitchen", "washer", "terrace", "mountain_view", "security", "elevator", "parking", "full_apartment"]',
'["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800", "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=800", "https://images.unsplash.com/photo-1615875221669-1d9088dcb02d?w=800"]',
true, NOW(), NOW());

-- Habitaciones Casa Colonial
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room13, @uuid8, 'single', 'Habitación Colonial Privada', 1, 2, '[{"type": "double", "count": 1}]', 95.00,
'["wifi", "garden", "historical", "shared_kitchen", "private_bathroom", "colonial_architecture"]',
'["https://images.unsplash.com/photo-1609598645675-23e3c3a8ea88?w=800", "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800"]',
true, NOW(), NOW());

-- Habitaciones Los Eucaliptos
INSERT INTO rooms (id, propertyId, roomType, name, quantity, guestCapacity, beds, pricePerNight, amenities, images, isAvailable, createdAt, updatedAt) VALUES
(@room14, @uuid9, 'family', 'Habitación Familiar Los Eucaliptos', 1, 4, '[{"type": "double", "count": 1}, {"type": "bunk", "count": 1}]', 110.00,
'["wifi", "garden", "family_friendly", "private_bathroom", "shared_areas", "quiet_area"]',
'["https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=800", "https://images.unsplash.com/photo-1560472354-9b1ca9c6e54e?w=800"]',
true, NOW(), NOW());