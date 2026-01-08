import sequelize from '../config/database-mysql.js';
import Attraction from '../modules/attractions/attraction.model.js';
import AttractionImage from '../modules/attractions/attraction-image.model.js';
import AttractionTag from '../modules/attractions/attraction-tag.model.js';
import '../config/associations.js'; // Cargar asociaciones

async function syncAttractionTables() {
  try {
    console.log('🔄 Sincronizando tablas de Attractions...');

    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL establecida');

    // Sincronizar tablas (crear si no existen, sin borrar datos existentes)
    await Attraction.sync({ alter: true });
    console.log('✅ Tabla Attractions sincronizada');

    await AttractionImage.sync({ alter: true });
    console.log('✅ Tabla AttractionImages sincronizada');

    await AttractionTag.sync({ alter: true });
    console.log('✅ Tabla AttractionTags sincronizada');

    console.log('\n🎉 Sincronización completada exitosamente!');

    // Verificar que existen datos
    const count = await Attraction.count();
    console.log(`📊 Total de atractivos en BD: ${count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
    process.exit(1);
  }
}

syncAttractionTables();
