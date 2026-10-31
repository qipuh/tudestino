import sequelize from './src/config/database-mysql.js';
import { up } from './src/migrations/create-rate-rules-table.js';

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('💲 Ejecutando migración de rate_rules...');
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
