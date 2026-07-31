import sequelize from '../src/config/database-mysql.js';

async function columnExists(table, column) {
  const [rows] = await sequelize.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table AND COLUMN_NAME = :column`,
    { replacements: { table, column } }
  );
  return rows.length > 0;
}

async function addColumnIfMissing(table, column, definition) {
  if (await columnExists(table, column)) {
    console.log(`SKIP ${table}.${column} (ya existe)`);
    return;
  }
  await sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  console.log(`OK ${table}.${column} agregada`);
}

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('DB conectada');

    await addColumnIfMissing('attractions', 'slug', "VARCHAR(255) NULL");
    await addColumnIfMissing('attractions', 'metaTitle', "VARCHAR(160) NULL");
    await addColumnIfMissing('attractions', 'metaDescription', "VARCHAR(160) NULL");
    await addColumnIfMissing('attractions', 'howToGetThere', "TEXT NULL");

    if (await columnExists('attractions', 'slug')) {
      const [idx] = await sequelize.query(
        `SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'attractions' AND INDEX_NAME = 'attractions_slug_unique'`
      );
      if (idx.length === 0) {
        await sequelize.query('ALTER TABLE attractions ADD UNIQUE INDEX attractions_slug_unique (slug)');
        console.log('OK indice unico attractions.slug');
      } else {
        console.log('SKIP indice attractions.slug (ya existe)');
      }
    }

    await addColumnIfMissing('attraction_images', 'credit', "VARCHAR(255) NULL");
    await addColumnIfMissing('attraction_images', 'sourceUrl', "VARCHAR(500) NULL");

    console.log('Migracion completada');
    process.exit(0);
  } catch (error) {
    console.error('Error en migracion:', error);
    process.exit(1);
  }
}

migrate();
