import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import sequelize from './src/config/database-mysql.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración: add-business-id-to-properties...');

    const sqlPath = join(__dirname, 'src/modules/properties/migrations/add-business-id-to-properties.sql');
    const sql = readFileSync(sqlPath, 'utf8');

    // Split by semicolon to execute statements individually
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log('Ejecutando:', statement.substring(0, 50) + '...');
      await sequelize.query(statement);
    }

    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    process.exit(1);
  }
}

runMigration();
