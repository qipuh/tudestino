import sequelize from './src/config/database-mysql.js';
import { up } from './src/migrations/create-hotel-properties-and-rooms-tables.js';

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('🏨 Ejecutando migración de hotel_properties y rooms...');
    await up();

    console.log('✅ Migración completada exitosamente');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error('Detalles:', error);
    await sequelize.close();
    process.exit(1);
  }
}

runMigration();
