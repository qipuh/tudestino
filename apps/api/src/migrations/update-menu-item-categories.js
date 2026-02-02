import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function updateMenuItemCategories() {
  let connection;

  try {
    // Conectar a la base de datos
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'tudestino'
    });

    console.log('📊 Conectado a la base de datos');

    // Verificar columna actual
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM menu_items WHERE Field = 'category'"
    );

    if (columns.length > 0) {
      console.log('📋 Columna category actual:', columns[0].Type);
    }

    console.log('🔄 Actualizando ENUM de category...');

    // Actualizar ENUM para incluir todas las categorías
    await connection.query(`
      ALTER TABLE menu_items
      MODIFY COLUMN category ENUM(
        'appetizers',
        'main_courses',
        'desserts',
        'beverages',
        'alcoholic',
        'breakfast',
        'specials',
        'drinks',
        'cocktails',
        'beer',
        'wine',
        'spirits',
        'snacks',
        'packages'
      ) NOT NULL DEFAULT 'main_courses'
    `);

    console.log('✅ ENUM de category actualizado exitosamente');

    // Verificar cambios
    const [updatedColumns] = await connection.query(
      "SHOW COLUMNS FROM menu_items WHERE Field = 'category'"
    );

    if (updatedColumns.length > 0) {
      console.log('📋 Nueva estructura:', updatedColumns[0].Type);
    }

    console.log('');
    console.log('✨ Migración completada');
    console.log('');
    console.log('Categorías agregadas:');
    console.log('  ✓ drinks (Bebidas)');
    console.log('  ✓ cocktails (Cócteles)');
    console.log('  ✓ beer (Cervezas)');
    console.log('  ✓ wine (Vinos)');
    console.log('  ✓ spirits (Licores)');
    console.log('  ✓ snacks (Bocadillos)');
    console.log('  ✓ packages (Paquetes/Combos)');

  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Ejecutar migración
updateMenuItemCategories()
  .then(() => {
    console.log('👍 Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
