import sequelize from '../../../config/database-mysql.js';
import Restaurant from '../restaurant.model.js';
import MenuCategory from '../menu-category.model.js';
import MenuItem from '../menu-item.model.js';
import Reservation from '../reservation.model.js';
import RestaurantImage from '../restaurant-image.model.js';

async function createRestaurantsTables() {
  try {
    console.log('🔧 Iniciando creación de tablas de restaurantes...');

    // Crear tablas en orden (respetando foreign keys)
    await Restaurant.sync({ force: false });
    console.log('✅ Tabla restaurants creada');

    await MenuCategory.sync({ force: false });
    console.log('✅ Tabla menu_categories creada');

    await MenuItem.sync({ force: false });
    console.log('✅ Tabla menu_items creada');

    await Reservation.sync({ force: false });
    console.log('✅ Tabla restaurant_reservations creada');

    await RestaurantImage.sync({ force: false });
    console.log('✅ Tabla restaurant_images creada');

    console.log('🎉 Todas las tablas de restaurantes fueron creadas exitosamente');
  } catch (error) {
    console.error('❌ Error creando tablas de restaurantes:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  createRestaurantsTables()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

export default createRestaurantsTables;
