import sequelize from '../src/config/database-mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migración de properties → hotel_properties\n');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '../migrations/001-rename-properties-to-hotel-properties.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Dividir en statements individuales (separados por punto y coma)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📋 Se ejecutarán ${statements.length} statements SQL\n`);

    // Ejecutar cada statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Saltar comentarios
      if (statement.startsWith('--')) continue;

      console.log(`\n[${i + 1}/${statements.length}] Ejecutando:`);
      console.log(statement.substring(0, 100) + '...\n');

      try {
        const [results] = await sequelize.query(statement);

        // Si es un SELECT, mostrar resultados
        if (statement.trim().toUpperCase().startsWith('SELECT')) {
          console.log('📊 Resultados:', JSON.stringify(results, null, 2));
        } else {
          console.log('✅ Ejecutado exitosamente');
        }
      } catch (error) {
        // Algunos errores son esperados (como DROP IF EXISTS en tablas que no existen)
        if (error.message.includes('check that it exists') ||
            error.message.includes('Duplicate') ||
            error.message.includes('doesn\'t exist')) {
          console.log('⚠️  Statement ignorado (esperado):', error.message);
        } else {
          throw error;
        }
      }
    }

    console.log('\n✅ Migración completada exitosamente!');
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Verificar que la tabla hotel_properties existe');
    console.log('   2. Verificar que las relaciones FK están correctas');
    console.log('   3. Actualizar los modelos Sequelize');
    console.log('   4. Actualizar el código del backend y frontend\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar
runMigration().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
