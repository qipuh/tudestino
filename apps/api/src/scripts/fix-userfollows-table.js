import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import sequelize from '../config/database-mysql.js';

async function fixUserFollowsTable() {
  try {
    console.log('🔍 Verificando tabla userfollows...\n');

    // Verificar si la tabla existe
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'userfollows'");

    if (tables.length === 0) {
      console.log('❌ La tabla userfollows no existe');
      console.log('📝 Creando tabla userfollows...\n');

      await sequelize.query(`
        CREATE TABLE userfollows (
          id INT AUTO_INCREMENT PRIMARY KEY,
          followerId CHAR(36) NOT NULL,
          followingId CHAR(36) NOT NULL,
          status ENUM('active', 'blocked') DEFAULT 'active',
          notificationsEnabled BOOLEAN DEFAULT true,
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_follow (followerId, followingId),
          KEY idx_follower (followerId),
          KEY idx_following (followingId),
          KEY idx_status (status),
          FOREIGN KEY (followerId) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (followingId) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log('✅ Tabla userfollows creada exitosamente\n');
    } else {
      console.log('✅ La tabla userfollows existe\n');

      // Verificar estructura
      const [columns] = await sequelize.query("DESCRIBE userfollows");
      console.log('📋 Estructura actual de la tabla:');
      console.table(columns);

      // Verificar si id tiene AUTO_INCREMENT
      const idColumn = columns.find(col => col.Field === 'id');

      if (!idColumn.Extra.includes('auto_increment')) {
        console.log('\n⚠️  El campo id NO tiene AUTO_INCREMENT configurado');
        console.log('🔧 Aplicando ALTER TABLE para agregar AUTO_INCREMENT...\n');

        await sequelize.query(`
          ALTER TABLE userfollows
          MODIFY COLUMN id INT AUTO_INCREMENT;
        `);

        console.log('✅ AUTO_INCREMENT agregado exitosamente\n');

        // Verificar nuevamente
        const [newColumns] = await sequelize.query("DESCRIBE userfollows");
        const newIdColumn = newColumns.find(col => col.Field === 'id');
        console.log('📋 Estructura actualizada:');
        console.log('   id:', newIdColumn.Extra);
      } else {
        console.log('\n✅ El campo id ya tiene AUTO_INCREMENT configurado');
      }
    }

    await sequelize.close();
    console.log('\n✅ Proceso completado');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

fixUserFollowsTable();
