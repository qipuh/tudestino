import sequelize from './src/config/database-mysql.js';

async function migrate() {
  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Paso 1: Obtener todas las habitaciones con view
    console.log('📋 Obteniendo habitaciones existentes...');
    const [rooms] = await sequelize.query('SELECT id, view FROM rooms WHERE view IS NOT NULL');
    console.log(`📊 Encontradas ${rooms.length} habitaciones con vista`);

    // Paso 2: Agregar una columna temporal
    console.log('🔧 Creando columna temporal...');
    await sequelize.query('ALTER TABLE rooms ADD COLUMN view_temp JSON NULL');

    // Paso 3: Convertir los valores existentes de string a array JSON
    console.log('🔄 Convirtiendo valores existentes a JSON...');
    for (const room of rooms) {
      if (room.view && typeof room.view === 'string') {
        const viewArray = JSON.stringify([room.view]);
        await sequelize.query(
          'UPDATE rooms SET view_temp = :viewArray WHERE id = :id',
          {
            replacements: { viewArray, id: room.id }
          }
        );
      }
    }

    // Paso 4: Eliminar la columna original
    console.log('🗑️ Eliminando columna original...');
    await sequelize.query('ALTER TABLE rooms DROP COLUMN view');

    // Paso 5: Renombrar la columna temporal
    console.log('🔧 Renombrando columna temporal...');
    await sequelize.query(`
      ALTER TABLE rooms
      CHANGE COLUMN view_temp view JSON NULL
      COMMENT 'Array de tipos de vista: ["interior", "city", "sea", "mountain", etc.]'
    `);

    console.log('✅ Columna view modificada exitosamente a tipo JSON');
    console.log(`✅ ${rooms.length} habitaciones migradas correctamente`);

    await sequelize.close();
    console.log('✅ Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

migrate();
