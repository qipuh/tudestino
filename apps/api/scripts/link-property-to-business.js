import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';
import { Property } from '../src/modules/properties/hotel-property.model.js';

async function linkPropertyToBusiness() {
  try {
    const propertyId = 'b8b5e40d-2238-4c1f-90aa-9d73fb9a257a';
    const businessSlug = 'hotel-cajamarca';

    console.log('🔗 Vinculando propiedad al negocio...\n');

    // 1. Buscar el negocio
    const business = await Business.findOne({
      where: { slug: businessSlug }
    });

    if (!business) {
      console.log(`❌ No existe negocio con slug "${businessSlug}"`);
      console.log('   Primero debes crear el negocio con /business/create');
      return;
    }

    console.log('✅ Negocio encontrado:');
    console.log('   ID:', business.id);
    console.log('   Nombre:', business.name);
    console.log('');

    // 2. Buscar la propiedad
    const property = await Property.findByPk(propertyId);

    if (!property) {
      console.log(`❌ No existe propiedad con ID "${propertyId}"`);
      return;
    }

    console.log('✅ Propiedad encontrada:');
    console.log('   ID:', property.id);
    console.log('   Nombre:', property.hotelName || property.propertyName);
    console.log('   businessId actual:', property.businessId || 'NULL');
    console.log('');

    // 3. Verificar si ya están vinculados
    if (property.businessId === business.id) {
      console.log('✅ Ya están vinculados correctamente');
      return;
    }

    // 4. Vincular
    await property.update({
      businessId: business.id,
      hotelName: business.name, // Sincronizar nombre
    });

    console.log('✅ ¡Vinculación exitosa!');
    console.log('');
    console.log('📋 Resultado:');
    console.log(`   Propiedad "${property.hotelName}" ahora está vinculada a "${business.name}"`);
    console.log('');
    console.log('🌐 URLs funcionales:');
    console.log(`   ${businessSlug}: https://tudestino.pe/${businessSlug}`);
    console.log(`   Propiedad directa: https://tudestino.pe/properties/${propertyId}`);
    console.log('');
    console.log('✨ Ahora ambas URLs mostrarán la misma vista PropertyDetail con:');
    console.log('   ✓ Perfil del negocio (logo, seguidores)');
    console.log('   ✓ Botones: Contactar, Reservar, Seguir');
    console.log('   ✓ Habitaciones con precios');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

linkPropertyToBusiness();
