import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tudestino',
    multipleStatements: true
  });

  console.log('📊 Conectado a la base de datos');

  try {
    // Migración 1: Crear tabla de países
    console.log('\n1️⃣ Creando tabla de países...');
    try {
      const countriesSql = fs.readFileSync(
        path.join(__dirname, 'src/modules/migrations/create-countries-table.sql'),
        'utf8'
      );
      await connection.query(countriesSql);
      console.log('✅ Tabla de países creada exitosamente');
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        console.log('ℹ️  Tabla de países ya existe, continuando...');
      } else {
        throw error;
      }
    }

    // Migración 2: Actualizar tabla de usuarios
    console.log('\n2️⃣ Actualizando tabla de usuarios...');
    const usersSql = fs.readFileSync(
      path.join(__dirname, 'src/modules/migrations/update-users-verification-safe.sql'),
      'utf8'
    );
    await connection.query(usersSql);
    console.log('✅ Tabla de usuarios actualizada exitosamente');

    console.log('\n🎉 Todas las migraciones ejecutadas correctamente');

  } catch (error) {
    console.error('❌ Error ejecutando migraciones:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigrations().catch(console.error);
