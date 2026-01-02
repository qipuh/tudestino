import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';
import { Property, Room } from '../src/modules/properties/hotel-property.model.js';

async function checkHotelRelationship() {
  try {
    console.log('🔍 Verificando relación entre hotel-cajamarca y la propiedad...\n');

    // 1. Buscar el negocio
    const business = await Business.findOne({
      where: { slug: 'hotel-cajamarca' }
    });

    if (!business) {
      console.log('❌ No existe negocio con slug "hotel-cajamarca"');
      return;
    }

    console.log('✅ Negocio encontrado:');
    console.log('   ID:', business.id);
    console.log('   Nombre:', business.name);
    console.log('   Tipo:', business.businessType);
    console.log('');

    // 2. Buscar la propiedad por ID
    const propertyId = 'b8b5e40d-2238-4c1f-90aa-9d73fb9a257a';
    const property = await Property.findByPk(propertyId, {
      include: [
        {
          model: Room,
          as: 'rooms'
        },
        {
          model: Business,
          as: 'business'
        }
      ]
    });

    if (!property) {
      console.log(`❌ No existe propiedad con ID "${propertyId}"`);
      return;
    }

    console.log('✅ Propiedad encontrada:');
    console.log('   ID:', property.id);
    console.log('   Nombre:', property.hotelName || property.propertyName);
    console.log('   businessId:', property.businessId || 'NULL');
    console.log('   Habitaciones:', property.rooms?.length || 0);
    console.log('');

    // 3. Verificar si están relacionados
    if (property.businessId === business.id) {
      console.log('✅ La propiedad ESTÁ correctamente vinculada al negocio');
    } else {
      console.log('⚠️  PROBLEMA DETECTADO:');
      console.log('   La propiedad NO está vinculada al negocio hotel-cajamarca');
      console.log('');
      console.log('   businessId de la propiedad:', property.businessId || 'NULL');
      console.log('   ID del negocio esperado:', business.id);
      console.log('');
      console.log('💡 SOLUCIÓN:');
      console.log('   Ejecuta este comando SQL para vincularlos:');
      console.log(`   UPDATE hotel_properties SET businessId = '${business.id}' WHERE id = '${propertyId}';`);
    }

    // 4. Buscar propiedades asociadas al negocio
    console.log('\n📋 Propiedades asociadas al negocio hotel-cajamarca:');
    const businessProperties = await Property.findAll({
      where: { businessId: business.id },
      include: [{ model: Room, as: 'rooms' }]
    });

    if (businessProperties.length === 0) {
      console.log('   ❌ El negocio NO tiene propiedades asociadas');
    } else {
      businessProperties.forEach((prop, index) => {
        console.log(`   ${index + 1}. ${prop.hotelName || prop.propertyName} (${prop.rooms?.length || 0} habitaciones)`);
        console.log(`      ID: ${prop.id}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkHotelRelationship();
