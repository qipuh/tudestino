import '../src/dotenv-config.js';
import { connectDB } from '../src/config/database-mysql.js';
import { setupAssociations } from '../src/config/associations.js';
import Business from '../src/modules/businesses/business.model.js';
import User from '../src/modules/users/user.model.js';

async function createTourBusiness() {
  try {
    setupAssociations();
    await connectDB();

    console.log('🔍 Buscando un negocio tipo tour...');

    // Buscar un negocio existente tipo tour
    let business = await Business.findOne({
      where: { businessType: 'tour' }
    });

    if (business) {
      console.log(`✅ Ya existe un negocio tipo tour: ${business.name} (${business.id})`);
      console.log(`   Puedes acceder en: http://localhost:5174/business/${business.id}/tours`);
      process.exit(0);
    }

    console.log('No hay negocio tipo tour, creando uno...');

    // Buscar cualquier negocio existente para obtener un ownerId válido
    const anyBusiness = await Business.findOne();
    if (!anyBusiness) {
      console.log('❌ No hay negocios en la base de datos. No se puede obtener un ownerId válido.');
      process.exit(1);
    }

    console.log(`✅ Usando ownerId del negocio existente: ${anyBusiness.ownerId}`);

    // Crear negocio de tours
    business = await Business.create({
      ownerId: anyBusiness.ownerId,
      name: 'Aventuras Perú Tours',
      slug: 'aventuras-peru-tours',
      businessType: 'tour',
      description: 'Empresa especializada en tours y excursiones por todo el Perú. Ofrecemos experiencias únicas y memorables.',
      address: 'Av. El Sol 123, Cusco',
      contactPhone: '+51 984 123 456',
      contactEmail: 'info@aventurasperu.com',
      website: 'https://aventurasperu.com',
      status: 'active',
      isActive: true,
      verificationStatus: 'verified'
    });

    console.log(`✅ Negocio creado exitosamente: ${business.name} (${business.id})`);
    console.log(`   Accede al panel de gestión: http://localhost:5174/business/${business.id}/manage`);
    console.log(`   Accede a Tours: http://localhost:5174/business/${business.id}/tours`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTourBusiness();
