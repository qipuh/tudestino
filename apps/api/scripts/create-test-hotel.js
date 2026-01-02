import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';
import { Property, Room } from '../src/modules/properties/hotel-property.model.js';
import User from '../src/modules/users/user.model-mysql.js';

async function createTestHotel() {
  try {
    console.log('🏨 Creando hotel de prueba...\n');

    // Usar usuario existente (debe existir un business_owner en la BD)
    let user = await User.findOne({
      where: { role: 'business_owner' }
    });

    if (!user) {
      console.log('❌ No hay usuarios con rol business_owner en la BD');
      console.log('   Por favor crea un usuario con rol business_owner primero');
      return;
    }

    console.log('✅ Usando usuario:', user.email);

    // Crear Business (hotel)
    const business = await Business.create({
      ownerId: user.id,
      name: 'Hotel Cajamarca Plaza',
      slug: 'hotel-cajamarca',
      description: 'Un acogedor hotel en el corazón de Cajamarca, con vistas espectaculares a la plaza de armas.',
      businessType: 'hotel',
      logo: null,
      coverImage: null,
      address: {
        street: 'Jr. Del Comercio 644',
        city: 'Cajamarca',
        state: 'Cajamarca',
        country: 'Perú',
        zipCode: '06001',
        latitude: -7.1637,
        longitude: -78.5125
      },
      contactPhone: '+51 976 123 456',
      contactEmail: 'info@hotelcajamarca.com',
      website: 'https://hotelcajamarca.com',
      operatingHours: {
        monday: { open: '00:00', close: '23:59', closed: false },
        tuesday: { open: '00:00', close: '23:59', closed: false },
        wednesday: { open: '00:00', close: '23:59', closed: false },
        thursday: { open: '00:00', close: '23:59', closed: false },
        friday: { open: '00:00', close: '23:59', closed: false },
        saturday: { open: '00:00', close: '23:59', closed: false },
        sunday: { open: '00:00', close: '23:59', closed: false },
      },
      socialMediaLinks: {
        facebook: 'https://facebook.com/hotelcajamarca',
        instagram: 'https://instagram.com/hotelcajamarca',
      },
      status: 'active',
      isActive: true,
    });

    console.log('✅ Negocio creado:', business.name);
    console.log('   ID:', business.id);
    console.log('   Slug:', business.slug);

    // Crear Property (propiedad del hotel)
    const property = await Property.create({
      hostId: user.id,
      businessId: business.id,
      accommodationType: 'hotel',
      hotelName: business.name,
      hotelCategory: 3,
      description: business.description,
      addressStreet: business.address.street,
      addressCity: business.address.city,
      addressState: business.address.state,
      addressCountry: business.address.country,
      addressZipCode: business.address.zipCode,
      addressLatitude: business.address.latitude,
      addressLongitude: business.address.longitude,
      propertyAmenities: ['wifi', 'parking', 'restaurant', 'room_service', '24_hour_reception'],
      breakfastIncluded: true,
      parkingType: 'free',
      checkInTime: '14:00:00',
      checkOutTime: '12:00:00',
      childrenAllowed: true,
      petsAllowed: 'yes_paid',
      petFee: 20.00,
      petFeePer: 'day',
      cancellationPolicy: 'flexible',
      status: 'published',
      isActive: true,
    });

    console.log('✅ Propiedad creada:',property.id);

    // Crear Rooms (habitaciones)
    const rooms = [
      {
        propertyId: property.id,
        roomType: 'single',
        name: 'Habitación Individual Standard',
        quantity: 5,
        guestCapacity: 1,
        beds: [{ type: 'single', count: 1 }],
        pricePerNight: 80.00,
        amenities: ['tv', 'wifi', 'private_bathroom', 'air_conditioning'],
        images: [],
        isAvailable: true,
      },
      {
        propertyId: property.id,
        roomType: 'double',
        name: 'Habitación Matrimonial Standard',
        quantity: 8,
        guestCapacity: 2,
        beds: [{ type: 'queen', count: 1 }],
        pricePerNight: 120.00,
        amenities: ['tv', 'wifi', 'private_bathroom', 'air_conditioning', 'minibar'],
        images: [],
        isAvailable: true,
      },
      {
        propertyId: property.id,
        roomType: 'suite',
        name: 'Suite Ejecutiva',
        quantity: 3,
        guestCapacity: 2,
        beds: [{ type: 'king', count: 1 }],
        pricePerNight: 200.00,
        amenities: ['tv', 'wifi', 'private_bathroom', 'air_conditioning', 'minibar', 'balcony', 'jacuzzi_tub'],
        images: [],
        isAvailable: true,
      },
      {
        propertyId: property.id,
        roomType: 'family',
        name: 'Habitación Familiar',
        quantity: 4,
        guestCapacity: 4,
        beds: [{ type: 'queen', count: 1 }, { type: 'single', count: 2 }],
        pricePerNight: 180.00,
        amenities: ['tv', 'wifi', 'private_bathroom', 'air_conditioning', 'safe_box'],
        images: [],
        isAvailable: true,
      },
    ];

    for (const roomData of rooms) {
      const room = await Room.create(roomData);
      console.log(`✅ Habitación creada: ${room.name} (${room.quantity} disponibles)`);
    }

    console.log('\n✅ ¡Hotel de prueba creado exitosamente!');
    console.log('\n📋 Información del hotel:');
    console.log(`   Negocio: ${business.name}`);
    console.log(`   URL amigable: http://localhost:5173/${business.slug}`);
    console.log(`   ID de propiedad: ${property.id}`);
    console.log(`   URL propiedad: http://localhost:5173/properties/${property.id}`);
    console.log(`   Total de habitaciones: ${rooms.length} tipos`);
    console.log(`\n🔑 Credenciales de prueba:`);
    console.log(`   Email: hotelero@test.com`);
    console.log(`   Password: password123`);

  } catch (error) {
    console.error('❌ Error al crear hotel de prueba:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createTestHotel().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
