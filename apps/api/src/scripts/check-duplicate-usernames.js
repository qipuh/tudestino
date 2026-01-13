import sequelize from '../config/database-mysql.js';
import User from '../modules/users/user.model-mysql.js';

async function checkDuplicateUsernames() {
  try {
    console.log('🔍 Verificando usernames duplicados...\n');

    // Obtener todos los users con username
    const users = await User.findAll({
      where: {
        username: {
          [sequelize.Sequelize.Op.ne]: null
        }
      },
      attributes: ['id', 'email', 'username'],
      raw: true
    });

    console.log(`📊 Total de usuarios con username: ${users.length}\n`);

    // Agrupar por username (case-insensitive)
    const usernameMap = {};

    users.forEach(user => {
      const lowerUsername = user.username.toLowerCase();
      if (!usernameMap[lowerUsername]) {
        usernameMap[lowerUsername] = [];
      }
      usernameMap[lowerUsername].push(user);
    });

    // Encontrar duplicados
    const duplicates = Object.entries(usernameMap).filter(([_, users]) => users.length > 1);

    if (duplicates.length === 0) {
      console.log('✅ No se encontraron usernames duplicados\n');
    } else {
      console.log(`⚠️  Se encontraron ${duplicates.length} usernames duplicados:\n`);

      duplicates.forEach(([username, users]) => {
        console.log(`\n❌ Username: "${username}"`);
        users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Username: ${user.username}`);
        });
      });

      console.log('\n💡 Puedes resolver esto manualmente actualizando los usernames duplicados en la base de datos');
    }

    // Buscar específicamente el username "drerte"
    console.log('\n🔎 Buscando específicamente "drerte"...');
    const drerteUsers = await User.findAll({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('username')),
        'drerte'
      ),
      attributes: ['id', 'email', 'username'],
      raw: true
    });

    if (drerteUsers.length > 0) {
      console.log(`\n📋 Se encontraron ${drerteUsers.length} usuario(s) con username "drerte":`);
      drerteUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ID: ${user.id}, Email: ${user.email}, Username: ${user.username}`);
      });
    } else {
      console.log('\n✅ No se encontró ningún usuario con username "drerte"');
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkDuplicateUsernames();
