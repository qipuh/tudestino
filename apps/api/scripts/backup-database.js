import sequelize from '../src/config/database-mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function backupDatabase() {
  try {
    console.log('💾 Creando backup de la base de datos...\n');

    const backupDir = path.join(__dirname, '../backups');

    // Crear directorio de backups si no existe
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

    // Hacer backup de las tablas principales
    const [businesses] = await sequelize.query('SELECT * FROM businesses');
    const [properties] = await sequelize.query('SELECT * FROM properties');
    const [rooms] = await sequelize.query('SELECT * FROM rooms');

    const backup = {
      timestamp: new Date().toISOString(),
      tables: {
        businesses: {
          count: businesses.length,
          data: businesses
        },
        properties: {
          count: properties.length,
          data: properties
        },
        rooms: {
          count: rooms.length,
          data: rooms
        }
      }
    };

    // Guardar backup
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));

    console.log('✅ Backup creado exitosamente!');
    console.log(`📁 Ubicación: ${backupFile}`);
    console.log('\n📊 Datos respaldados:');
    console.log(`   - Businesses: ${businesses.length}`);
    console.log(`   - Properties: ${properties.length}`);
    console.log(`   - Rooms: ${rooms.length}`);
    console.log('');

    return backupFile;

  } catch (error) {
    console.error('❌ Error al crear backup:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

backupDatabase().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
