import sequelize from './src/config/database-mysql.js';

async function checkAdmin() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    const [results] = await sequelize.query(`
      SELECT id, name, email, username, role, isVerified, isActive, createdAt 
      FROM users 
      WHERE email = 'admin@tudestino.pe'
    `);

    if (results.length === 0) {
      console.log('❌ No se encontró el usuario admin@tudestino.pe');
    } else {
      console.log('✅ Usuario encontrado:');
      console.log(JSON.stringify(results[0], null, 2));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkAdmin();
