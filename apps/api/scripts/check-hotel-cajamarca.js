import sequelize from '../src/config/database-mysql.js';
import Business from '../src/modules/businesses/business.model.js';
import { Property } from '../src/modules/properties/hotel-property.model.js';

async function checkHotelCajamarca() {
  try {
    console.log('🔍 Verificando hotel-cajamarca en producción...\n');

    // 1. Buscar el negocio
    const business = await Business.findOne({
      where: { slug: 'hotel-cajamarca' }
    });

    if (!business) {
      console.log('❌ No existe el negocio hotel-cajamarca');
      return;
    }

    console.log('✅ Negocio encontrado:');
    console.log('   ID:', business.id);
    console.log('   Nombre:', business.name);
    console.log('   Tipo:', business.businessType);

    // 2. Buscar la propiedad asociada
    const property = await Property.findOne({
      where: { businessId: business.id }
    });

    if (!property) {
      console.log('\n❌ EL NEGOCIO NO TIENE PROPIEDAD ASOCIADA');
      console.log('   Por eso /hotel-cajamarca muestra BusinessDetail');
      console.log('\n💡 Solución: Crear propiedad o vincular una existente');
      return;
    }

    console.log('\n✅ Propiedad encontrada:');
    console.log('   ID:', property.id);
    console.log('   Nombre:', property.hotelName);
    console.log('   businessId:', property.businessId);
    console.log('\n✅ TODO CORRECTO: /hotel-cajamarca debería mostrar PropertyDetail');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkHotelCajamarca();
