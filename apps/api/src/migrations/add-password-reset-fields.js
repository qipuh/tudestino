import sequelize from '../config/database-mysql.js';

async function migrate() {
  try {
    console.log('🔧 Agregando campos de recuperación de contraseña...');

    // Verificar si la columna reset_password_token existe
    const [tokenColumn] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'reset_password_token'
    `);

    if (tokenColumn.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN reset_password_token VARCHAR(255) NULL
      `);
      console.log('✅ Campo reset_password_token agregado');
    } else {
      console.log('ℹ️  Campo reset_password_token ya existe');
    }

    // Verificar si la columna reset_password_expires existe
    const [expiresColumn] = await sequelize.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'users'
      AND COLUMN_NAME = 'reset_password_expires'
    `);

    if (expiresColumn.length === 0) {
      await sequelize.query(`
        ALTER TABLE users
        ADD COLUMN reset_password_expires DATETIME NULL
      `);
      console.log('✅ Campo reset_password_expires agregado');
    } else {
      console.log('ℹ️  Campo reset_password_expires ya existe');
    }

    console.log('✅ Migración completada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    process.exit(1);
  }
}

migrate();
