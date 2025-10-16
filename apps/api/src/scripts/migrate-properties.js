import sequelize from '../config/database-mysql.js';
import { Property, Room } from '../modules/properties/property.model.sequelize.js';

async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migración de tablas de propiedades y habitaciones...');

    // Sincronizar modelos con la base de datos
    // alter: true actualiza las tablas existentes sin eliminar datos
    // force: true elimina y recrea las tablas (CUIDADO: borra todos los datos)
    await Property.sync({ alter: true });
    console.log('✅ Tabla Properties sincronizada');

    await Room.sync({ alter: true });
    console.log('✅ Tabla Rooms sincronizada');

    console.log('🎉 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

migrateDatabase();
