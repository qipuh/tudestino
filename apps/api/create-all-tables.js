import createRestaurantsTables from './src/modules/restaurants/migrations/create-restaurants-tables.js';
import createEntertainmentTables from './src/modules/entertainment/migrations/create-entertainment-tables.js';
import createEventsTables from './src/modules/events/migrations/create-events-tables.js';

async function createAllTables() {
  console.log('🚀 Iniciando creación de todas las tablas...\n');

  try {
    await createRestaurantsTables();
    console.log('');

    await createEntertainmentTables();
    console.log('');

    await createEventsTables();
    console.log('');

    console.log('🎉 ¡Todas las tablas fueron creadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creando las tablas:', error);
    process.exit(1);
  }
}

createAllTables();
