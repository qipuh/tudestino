import sequelize from './src/config/database-mysql.js';

async function checkDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar tablas existentes
    const [tables] = await sequelize.query("SHOW TABLES");
    console.log('📋 Tablas en la base de datos:', tables.length);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`  - ${tableName}`);
    });
    console.log('');

    // Contar usuarios
    const [userCount] = await sequelize.query("SELECT COUNT(*) as count FROM users");
    console.log('👥 Total usuarios:', userCount[0].count);

    // Mostrar todos los usuarios
    const [users] = await sequelize.query(`
      SELECT id, name, email, username, role, isVerified, isActive, createdAt 
      FROM users 
      ORDER BY createdAt DESC
    `);
    
    console.log('\n👤 Usuarios registrados:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Verificado: ${user.isVerified ? 'Sí' : 'No'}`);
      console.log(`   Activo: ${user.isActive ? 'Sí' : 'No'}`);
      console.log(`   Creado: ${user.createdAt}`);
    });

    // Verificar otras tablas importantes
    const [businessCount] = await sequelize.query("SELECT COUNT(*) as count FROM businesses");
    console.log(`\n🏢 Total negocios: ${businessCount[0].count}`);

    const [hotelPropertiesCount] = await sequelize.query("SELECT COUNT(*) as count FROM hotel_properties");
    console.log(`🏨 Total propiedades hotel: ${hotelPropertiesCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
