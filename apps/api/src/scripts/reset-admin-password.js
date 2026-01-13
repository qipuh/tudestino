import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database-mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config({ path: join(__dirname, '../../.env') });

async function resetAdminPassword() {
  try {
    const newPassword = process.argv[2] || 'Admin2026!';

    console.log('Reseteando contraseña del administrador...');
    console.log('Nueva contraseña:', newPassword);

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Actualizar la contraseña del admin
    const [result] = await sequelize.query(
      "UPDATE users SET password = :password WHERE email = 'admin@tudestino.pe'",
      {
        replacements: { password: hashedPassword }
      }
    );

    if (result.affectedRows > 0) {
      console.log('\n✓ Contraseña actualizada exitosamente');
      console.log('Email: admin@tudestino.pe');
      console.log('Nueva contraseña:', newPassword);
    } else {
      console.log('\n✗ No se encontró el usuario administrador');
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    process.exit(1);
  }
}

resetAdminPassword();
