import sequelize from '../../../config/database-mysql.js';
import Entertainment from '../entertainment.model.js';
import EntertainmentReservation from '../entertainment-reservation.model.js';
import EntertainmentImage from '../entertainment-image.model.js';

async function createEntertainmentTables() {
  try {
    console.log('🔧 Iniciando creación de tablas de entretenimiento...');

    // Crear tablas en orden (respetando foreign keys)
    await Entertainment.sync({ force: false });
    console.log('✅ Tabla entertainment creada');

    await EntertainmentReservation.sync({ force: false });
    console.log('✅ Tabla entertainment_reservations creada');

    await EntertainmentImage.sync({ force: false });
    console.log('✅ Tabla entertainment_images creada');

    console.log('🎉 Todas las tablas de entretenimiento fueron creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando tablas de entretenimiento:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  createEntertainmentTables()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

export default createEntertainmentTables;
