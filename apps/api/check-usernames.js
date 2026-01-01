import User from './src/modules/users/user.model-mysql.js';
import sequelize from './src/config/database-mysql.js';
import { Op } from 'sequelize';

async function checkUsernames() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Buscar todos los usuarios
    const allUsers = await User.findAll({
      attributes: ['id', 'email', 'username', 'name'],
      order: [['createdAt', 'DESC']],
    });

    console.log(`\n📊 Total usuarios: ${allUsers.length}\n`);

    // Contar usuarios sin username
    const usersWithoutUsername = allUsers.filter(u => !u.username);
    const usersWithUsername = allUsers.filter(u => u.username);

    console.log(`✅ Con username: ${usersWithUsername.length}`);
    console.log(`❌ Sin username: ${usersWithoutUsername.length}\n`);

    if (usersWithUsername.length > 0) {
      console.log('Usuarios con username:');
      usersWithUsername.forEach(u => {
        console.log(`  - ${u.email}: "${u.username}"`);
      });
    }

    // Buscar usuarios con username vacío o NULL
    const emptyUsernames = await User.findAll({
      where: {
        [Op.or]: [
          { username: null },
          { username: '' }
        ]
      }
    });

    console.log(`\n🔍 Usuarios con username NULL o vacío: ${emptyUsernames.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkUsernames();
