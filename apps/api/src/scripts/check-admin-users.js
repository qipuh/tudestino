import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import sequelize from '../config/database-mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

async function checkAdminUsers() {
  try {
    console.log('Verificando usuarios administradores...');

    const [results] = await sequelize.query(
      "SELECT id, email, role, firstName, lastName FROM users WHERE role = 'admin' LIMIT 10"
    );

    console.log('\nUsuarios administradores encontrados:');
    if (results.length === 0) {
      console.log('No se encontraron usuarios administradores.');
    } else {
      results.forEach(user => {
        console.log(`\nID: ${user.id}`);
        console.log(`Email: ${user.email}`);
        console.log(`Nombre: ${user.firstName} ${user.lastName}`);
        console.log(`Role: ${user.role}`);
      });
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al verificar usuarios admin:', error);
    process.exit(1);
  }
}

checkAdminUsers();
