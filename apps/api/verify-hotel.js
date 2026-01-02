import sequelize from './src/config/database-mysql.js';
import Business from './src/modules/businesses/business.model.js';
import { Property, Room } from './src/modules/properties/property.model.sequelize.js';

async function verifyHotel() {
  try {
    console.log('🔍 Buscando hotel con slug "hotel-cajamarca"...\n');

    // Buscar el negocio
    const business = await Business.findOne({
      where: { slug: 'hotel-cajamarca' }
    });

    if (!business) {
      console.log('❌ No se encontró el negocio con slug "hotel-cajamarca"');
      return;
    }

    console.log('✅ Negocio encontrado:');
    console.log('   ID:', business.id);
    console.log('   Nombre:', business.name);
    console.log('   Tipo:', business.businessType);
    console.log('   Estado:', business.status);
    console.log('');

    // Buscar la propiedad asociada
    const property = await Property.findOne({
      where: { businessId: business.id },
      include: [
        {
          model: Room,
          as: 'rooms'
        }
      ]
    });

    if (!property) {
      console.log('❌ El negocio NO tiene una propiedad asociada');
      console.log('   Por eso muestra la vista BusinessDetail en vez de PropertyDetail');
      console.log('');
      console.log('💡 Solución: Crear una propiedad asociada a este negocio');
      return;
    }

    console.log('✅ Propiedad encontrada:');
    console.log('   ID:', property.id);
    console.log('   Nombre:', property.hotelName || property.propertyName);
    console.log('   Tipo:', property.accommodationType);
    console.log('   Habitaciones:', property.rooms?.length || 0);
    console.log('');

    if (property.rooms && property.rooms.length > 0) {
      console.log('📋 Habitaciones:');
      property.rooms.forEach((room, index) => {
        console.log(`   ${index + 1}. ${room.name} - S/ ${room.pricePerNight}/noche (${room.quantity} disponibles)`);
      });
    } else {
      console.log('⚠️  La propiedad no tiene habitaciones registradas');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

verifyHotel();
