import sequelize from '../config/database-mysql.js';

async function getGuestUsers() {
  try {
    const [results] = await sequelize.query(
      "SELECT id, name, email, role FROM users WHERE role = 'guest' LIMIT 5"
    );

    console.log('\n📋 Usuarios Guest disponibles:\n');
    results.forEach(user => {
      console.log(`  👤 ${user.name} (${user.email})`);
      console.log(`     ID: ${user.id}`);
      console.log(`     🔗 URL: http://localhost:5177/profile/${user.id}\n`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getGuestUsers();
