import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Change room view field from STRING to JSON to support multiple views
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔧 Changing rooms.view column from STRING to JSON...');

    // Verificar si la tabla rooms existe
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('rooms')) {
      console.log('⚠️ rooms table does not exist, skipping migration');
      return;
    }

    // Cambiar el tipo de columna view de STRING a JSON
    await queryInterface.changeColumn('rooms', 'view', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Array de tipos de vista: ["interior", "city", "sea", "mountain", etc.]'
    });

    console.log('✅ Successfully changed rooms.view to JSON type');
    console.log('ℹ️  Note: Existing string values will need to be converted to arrays manually if needed');

  } catch (error) {
    console.error('❌ Error in migration:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔧 Reverting rooms.view column from JSON to STRING...');

    await queryInterface.changeColumn('rooms', 'view', {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de vista: interior, exterior, garden, pool, sea, mountain, city'
    });

    console.log('✅ Successfully reverted rooms.view to STRING type');

  } catch (error) {
    console.error('❌ Error reverting migration:', error);
    throw error;
  }
}

// Run migration if executed directly
const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    await up();
    await sequelize.close();
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}
