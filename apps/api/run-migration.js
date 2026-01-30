import sequelize from './src/config/database-mysql.js';

async function runMigration() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    const queryInterface = sequelize.getQueryInterface();

    console.log('📝 Agregando columna hotelSubtype...');
    await queryInterface.addColumn('businesses', 'hotelSubtype', {
      type: 'VARCHAR(50)',
      allowNull: true,
      comment: 'Subtipo de alojamiento: hotel, hostel, apartment, bnb, resort, villa, etc.'
    });

    console.log('📝 Agregando columna hotelCategory...');
    await queryInterface.addColumn('businesses', 'hotelCategory', {
      type: 'VARCHAR(50)',
      allowNull: true,
      comment: 'Categoría del alojamiento: estrellas, llaves, espigas, mochilas, etc.'
    });

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
