import sequelize from '../config/database-mysql.js';
import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migración: Agregar campos hotelSubtype y hotelCategory a tabla businesses
 *
 * Estos campos permiten especificar el subtipo de alojamiento (Hotel, Hostal, B&B, etc.)
 * y su categoría correspondiente (estrellas, llaves, espigas, etc.)
 */

const up = async (queryInterface = sequelize.getQueryInterface()) => {
  try {
    console.log('Agregando campos hotelSubtype y hotelCategory a tabla businesses...');

    // Agregar campo hotelSubtype
    await queryInterface.addColumn('businesses', 'hotelSubtype', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Subtipo de alojamiento: hotel, hostel, apartment, bnb, resort, villa, etc.',
      after: 'businessType'
    });

    // Agregar campo hotelCategory
    await queryInterface.addColumn('businesses', 'hotelCategory', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Categoría del alojamiento: estrellas, llaves, espigas, mochilas, etc.',
      after: 'hotelSubtype'
    });

    console.log('✅ Campos hotelSubtype y hotelCategory agregados exitosamente');
  } catch (error) {
    console.error('❌ Error agregando campos:', error.message);
    throw error;
  }
};

const down = async (queryInterface = sequelize.getQueryInterface()) => {
  try {
    console.log('Eliminando campos hotelSubtype y hotelCategory de tabla businesses...');

    await queryInterface.removeColumn('businesses', 'hotelSubtype');
    await queryInterface.removeColumn('businesses', 'hotelCategory');

    console.log('✅ Campos hotelSubtype y hotelCategory eliminados exitosamente');
  } catch (error) {
    console.error('❌ Error eliminando campos:', error.message);
    throw error;
  }
};

// Auto-ejecutar si se corre directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await sequelize.authenticate();
    console.log('📊 Conexión a la base de datos establecida');

    await up();

    await sequelize.close();
    console.log('🏁 Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}

export { up, down };
