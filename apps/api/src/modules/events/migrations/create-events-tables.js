import sequelize from '../../../config/database-mysql.js';
import Event from '../event.model.js';
import EventTicket from '../event-ticket.model.js';
import EventRegistration from '../event-registration.model.js';
import EventImage from '../event-image.model.js';

async function createEventsTables() {
  try {
    console.log('🔧 Iniciando creación de tablas de eventos...');

    // Crear tablas en orden (respetando foreign keys)
    await Event.sync({ force: false });
    console.log('✅ Tabla events creada');

    await EventTicket.sync({ force: false });
    console.log('✅ Tabla event_tickets creada');

    await EventRegistration.sync({ force: false });
    console.log('✅ Tabla event_registrations creada');

    await EventImage.sync({ force: false });
    console.log('✅ Tabla event_images creada');

    console.log('🎉 Todas las tablas de eventos fueron creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando tablas de eventos:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  createEventsTables()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

export default createEventsTables;
