import sequelize from './src/config/database-mysql.js';

async function checkUsernameColumn() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos\n');

    // Verificar estructura de la tabla users
    const [results] = await sequelize.query(`
      DESCRIBE users
    `);

    console.log('📋 Estructura de la tabla users:');
    console.table(results);

    // Verificar si existe la columna username
    const hasUsername = results.some(col => col.Field === 'username');

    if (hasUsername) {
      console.log('\n✅ La columna "username" EXISTE en la tabla users');

      // Probar actualizar un usuario
      const [users] = await sequelize.query(`
        SELECT id, name, email, username FROM users LIMIT 1
      `);

      if (users.length > 0) {
        console.log('\n📝 Usuario de prueba:', users[0]);

        // Intentar actualizar el username
        const testUsername = 'test-' + Date.now();
        await sequelize.query(`
          UPDATE users SET username = ? WHERE id = ?
        `, {
          replacements: [testUsername, users[0].id]
        });

        console.log(`\n✅ Username actualizado a: ${testUsername}`);

        // Verificar
        const [updated] = await sequelize.query(`
          SELECT id, name, email, username FROM users WHERE id = ?
        `, {
          replacements: [users[0].id]
        });

        console.log('✅ Verificación:', updated[0]);
      }
    } else {
      console.log('\n❌ La columna "username" NO EXISTE en la tabla users');
      console.log('\n💡 Ejecuta este SQL para agregarla:');
      console.log(`
ALTER TABLE users
ADD COLUMN username VARCHAR(30) NULL UNIQUE
COMMENT 'URL personalizada del perfil (ej: mi-empresa)';
      `);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsernameColumn();
