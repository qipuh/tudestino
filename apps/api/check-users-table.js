import sequelize from './src/config/database-mysql.js';

async function checkUsersTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla users...\n');
    await sequelize.authenticate();

    const [results] = await sequelize.query('DESCRIBE users');

    console.log('Campos actuales en la tabla users:');
    console.log('═'.repeat(80));
    results.forEach(field => {
      console.log(`  ${field.Field.padEnd(30)} ${field.Type.padEnd(30)} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    console.log('═'.repeat(80));
    console.log(`Total: ${results.length} campos\n`);

    // Campos que el servicio social está intentando usar
    const requiredFields = [
      'id', 'name', 'avatar', 'username', 'bio', 'travelInterests',
      'visitedDestinations', 'travelStyle', 'followersCount',
      'followingCount', 'reelsCount', 'totalLikes', 'isPublicProfile',
      'location', 'createdAt', 'role'
    ];

    const existingFields = results.map(r => r.Field);
    const missingFields = requiredFields.filter(f => !existingFields.includes(f));

    if (missingFields.length > 0) {
      console.log('❌ Campos FALTANTES que causan el error 500:');
      missingFields.forEach(field => console.log(`  - ${field}`));
      console.log('\n💡 Necesitas agregar estos campos a la tabla users\n');
    } else {
      console.log('✅ Todos los campos requeridos existen\n');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkUsersTable();
