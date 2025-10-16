import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Add quantity column to rooms table
 * This allows hosts to specify how many identical rooms of a type they have
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('rooms');

    if (!tableDescription.quantity) {
      console.log('Adding quantity column to rooms table...');

      await queryInterface.addColumn('rooms', 'quantity', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        after: 'name',
        comment: 'Cantidad de habitaciones de este tipo',
      });

      console.log('✅ Successfully added quantity column to rooms table');
    } else {
      console.log('⚠️ Column quantity already exists in rooms table');
    }
  } catch (error) {
    console.error('❌ Error adding quantity column:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Removing quantity column from rooms table...');
    await queryInterface.removeColumn('rooms', 'quantity');
    console.log('✅ Successfully removed quantity column from rooms table');
  } catch (error) {
    console.error('❌ Error removing quantity column:', error);
    throw error;
  }
}

// Run migration if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    await up();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}
