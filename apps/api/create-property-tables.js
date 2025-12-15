import sequelize from './src/config/database-mysql.js';
import { Property, Room } from './src/modules/properties/property.model.sequelize.js';

async function createPropertyTables() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida correctamente.');

    console.log('\n🔄 Creando tablas de Property y Room...');

    // Crear las tablas (force: false para no sobrescribir si ya existen)
    await Property.sync({ alter: true });
    console.log('✅ Tabla "properties" creada/actualizada');

    await Room.sync({ alter: true });
    console.log('✅ Tabla "rooms" creada/actualizada');

    console.log('\n✅ ¡Tablas creadas exitosamente!');

    // Cerrar conexión
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createPropertyTables();
