import sequelize from '../config/database-mysql.js';
import User from '../modules/users/user.model-mysql.js';

async function freeUsername() {
  const usernameToFree = process.argv[2];

  if (!usernameToFree) {
    console.log('❌ Debes proporcionar un username para liberar');
    console.log('   Uso: node src/scripts/free-username.js <username>');
    console.log('   Ejemplo: node src/scripts/free-username.js drerte');
    process.exit(1);
  }

  try {
    console.log(`🔍 Buscando username "${usernameToFree}"...\n`);

    // Buscar todos los usuarios con ese username (case-insensitive)
    const users = await User.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('username')),
        usernameToFree.toLowerCase()
      ),
      attributes: ['id', 'email', 'username', 'createdAt'],
      order: [['createdAt', 'ASC']]
    });

    if (users.length === 0) {
      console.log(`✅ El username "${usernameToFree}" está disponible (no está en uso)\n`);
      await sequelize.close();
      return;
    }

    console.log(`📋 Se encontraron ${users.length} usuario(s) con username "${usernameToFree}":\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Creado: ${user.createdAt}`);
      console.log('');
    });

    // Si hay más de uno, hay un problema de duplicados
    if (users.length > 1) {
      console.log('⚠️  ADVERTENCIA: Hay múltiples usuarios con el mismo username (esto no debería pasar)');
      console.log('   Se recomienda mantener solo el más antiguo y cambiar los demás.\n');

      // Establecer a null todos excepto el primero
      for (let i = 1; i < users.length; i++) {
        await users[i].update({ username: null });
        console.log(`✅ Username liberado de usuario: ${users[i].email}`);
      }

      console.log(`\n✅ Username "${usernameToFree}" ahora solo lo tiene: ${users[0].email}`);
    } else {
      console.log(`💡 Si deseas liberar este username del usuario ${users[0].email}, puedes:`);
      console.log(`   1. Cambiar el username manualmente en la base de datos`);
      console.log(`   2. Establecerlo a NULL para que el usuario pueda elegir otro\n`);

      // Preguntar si desea liberar
      console.log('⚠️  Este script solo reporta. Para liberar, descomenta el código de actualización.');

      // Descomentar esto para liberar:
      // await users[0].update({ username: null });
      // console.log(`✅ Username "${usernameToFree}" liberado del usuario ${users[0].email}`);
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

freeUsername();
