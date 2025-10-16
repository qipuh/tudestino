import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import sequelize from './database-mysql.js';
import User from '../modules/users/user.model-mysql.js';
import Property from '../modules/properties/property.model-mysql.js';
import Booking from '../modules/bookings/booking.model.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Conectar a MySQL
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');

    // Desactivar verificaciones de claves foráneas temporalmente
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ force: true }); // force: true borra y recrea tablas
    console.log('✅ Tablas creadas/actualizadas');

    // Reactivar verificaciones de claves foráneas
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    // Crear usuarios de prueba
    const users = [
      {
        name: 'Admin User',
        email: 'admin@tudestino.com',
        password: await bcrypt.hash('admin123', 12),
        role: 'admin',
        isVerified: true,
        isActive: true,
        emailVerified: true,
      },
      {
        name: 'Host Demo',
        email: 'host@tudestino.com',
        password: await bcrypt.hash('host123', 12),
        role: 'host',
        isVerified: true,
        isActive: true,
        emailVerified: true,
        hostRating: 4.8,
        hostReviewCount: 25,
      },
      {
        name: 'Guest Demo',
        email: 'guest@tudestino.com',
        password: await bcrypt.hash('guest123', 12),
        role: 'guest',
        isVerified: true,
        isActive: true,
        emailVerified: true,
      },
    ];

    const createdUsers = await User.bulkCreate(users);
    console.log('✅ Usuarios de prueba creados:');
    console.log('   - admin@tudestino.com / admin123 (Admin)');
    console.log('   - host@tudestino.com / host123 (Host)');
    console.log('   - guest@tudestino.com / guest123 (Guest)');

    // Crear propiedades de prueba
    const hostUser = createdUsers.find(u => u.role === 'host');

    const properties = [
      {
        hostId: hostUser.id,
        title: 'Hermoso apartamento con vista al mar',
        description: 'Disfruta de impresionantes vistas al océano desde este moderno apartamento. Perfecto para parejas o familias pequeñas.',
        type: 'apartment',
        address: 'Av. Costera 123',
        city: 'Cancún',
        state: 'Quintana Roo',
        country: 'México',
        zipCode: '77500',
        latitude: 21.1619,
        longitude: -86.8515,
        basePrice: 120.00,
        currency: 'USD',
        cleaningFee: 25.00,
        serviceFee: 15.00,
        guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 2,
        amenities: ['wifi', 'kitchen', 'ac', 'pool', 'parking', 'tv'],
        checkIn: '15:00',
        checkOut: '11:00',
        minimumStay: 2,
        maximumStay: 30,
        smokingAllowed: false,
        petsAllowed: false,
        eventsAllowed: false,
        status: 'published',
        isActive: true,
        averageRating: 4.8,
        ratingCount: 15,
      },
      {
        hostId: hostUser.id,
        title: 'Casa de playa con acceso privado',
        description: 'Relájate en esta espaciosa casa de playa con acceso directo a la arena blanca. Ideal para vacaciones familiares.',
        type: 'house',
        address: 'Calle Playa 456',
        city: 'Playa del Carmen',
        state: 'Quintana Roo',
        country: 'México',
        zipCode: '77710',
        latitude: 20.6296,
        longitude: -87.0739,
        basePrice: 250.00,
        currency: 'USD',
        cleaningFee: 50.00,
        serviceFee: 30.00,
        guests: 8,
        bedrooms: 4,
        beds: 5,
        bathrooms: 3,
        amenities: ['wifi', 'kitchen', 'ac', 'pool', 'parking', 'tv', 'washer', 'balcony'],
        checkIn: '16:00',
        checkOut: '10:00',
        minimumStay: 3,
        maximumStay: 60,
        smokingAllowed: false,
        petsAllowed: true,
        eventsAllowed: false,
        status: 'published',
        isActive: true,
        averageRating: 4.9,
        ratingCount: 28,
      },
      {
        hostId: hostUser.id,
        title: 'Acogedora cabaña en la montaña',
        description: 'Escapa del ruido de la ciudad en esta encantadora cabaña rodeada de naturaleza.',
        type: 'cabin',
        address: 'Carretera Nacional km 45',
        city: 'Valle de Bravo',
        state: 'Estado de México',
        country: 'México',
        zipCode: '51200',
        latitude: 19.1952,
        longitude: -100.1326,
        basePrice: 90.00,
        currency: 'USD',
        cleaningFee: 20.00,
        serviceFee: 10.00,
        guests: 6,
        bedrooms: 3,
        beds: 3,
        bathrooms: 2,
        amenities: ['wifi', 'kitchen', 'heating', 'parking', 'workspace'],
        checkIn: '14:00',
        checkOut: '12:00',
        minimumStay: 1,
        maximumStay: 14,
        smokingAllowed: false,
        petsAllowed: true,
        eventsAllowed: false,
        status: 'published',
        isActive: true,
        averageRating: 4.7,
        ratingCount: 12,
      },
    ];

    const createdProperties = await Property.bulkCreate(properties);
    console.log('✅ Propiedades de prueba creadas (3)');

    // Crear reservas de prueba
    const guestUser = createdUsers.find(u => u.role === 'guest');
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 30);
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 10);

    const bookings = [
      {
        propertyId: createdProperties[0].id,
        guestId: guestUser.id,
        hostId: hostUser.id,
        checkIn: today.toISOString().split('T')[0],
        checkOut: futureDate.toISOString().split('T')[0],
        guests: 2,
        basePrice: 120.00,
        cleaningFee: 25.00,
        serviceFee: 15.00,
        totalPrice: 3900.00,
        currency: 'USD',
        status: 'confirmed',
        paymentStatus: 'paid',
        guestNotes: 'Looking forward to the stay!',
      },
      {
        propertyId: createdProperties[1].id,
        guestId: guestUser.id,
        hostId: hostUser.id,
        checkIn: pastDate.toISOString().split('T')[0],
        checkOut: today.toISOString().split('T')[0],
        guests: 4,
        basePrice: 250.00,
        cleaningFee: 50.00,
        serviceFee: 30.00,
        totalPrice: 2800.00,
        currency: 'USD',
        status: 'completed',
        paymentStatus: 'paid',
      },
      {
        propertyId: createdProperties[2].id,
        guestId: guestUser.id,
        hostId: hostUser.id,
        checkIn: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        checkOut: new Date(today.getTime() + 65 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        guests: 3,
        basePrice: 90.00,
        cleaningFee: 20.00,
        serviceFee: 10.00,
        totalPrice: 470.00,
        currency: 'USD',
        status: 'pending',
        paymentStatus: 'pending',
      },
    ];

    await Booking.bulkCreate(bookings);
    console.log('✅ Reservas de prueba creadas (3)');

    await sequelize.close();
    console.log('✅ Seed completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
};

seedDatabase();
