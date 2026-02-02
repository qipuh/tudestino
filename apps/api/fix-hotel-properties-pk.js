import sequelize from './src/config/database-mysql.js';

async function fixPrimaryKey() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    console.log('🔧 Agregando PRIMARY KEY a hotel_properties...');
    await sequelize.query('ALTER TABLE hotel_properties ADD PRIMARY KEY (id)');
    console.log('✅ PRIMARY KEY agregado exitosamente');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    await sequelize.close();
    process.exit(1);
  }
}

fixPrimaryKey();
