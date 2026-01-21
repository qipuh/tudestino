import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Add shortDescription and fullDescription fields to tours table
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if columns already exist
    const tableDescription = await queryInterface.describeTable('tours');

    if (!tableDescription.shortDescription) {
      console.log('Adding shortDescription column to tours table...');
      await queryInterface.addColumn('tours', 'shortDescription', {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Descripción corta para vista previa',
        after: 'description'
      });
      console.log('✅ Added shortDescription column');
    } else {
      console.log('⚠️ Column shortDescription already exists');
    }

    if (!tableDescription.fullDescription) {
      console.log('Adding fullDescription column to tours table...');
      await queryInterface.addColumn('tours', 'fullDescription', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción completa del tour',
        after: 'shortDescription'
      });
      console.log('✅ Added fullDescription column');
    } else {
      console.log('⚠️ Column fullDescription already exists');
    }

    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Error running migration:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Removing shortDescription and fullDescription columns...');
    await queryInterface.removeColumn('tours', 'shortDescription');
    await queryInterface.removeColumn('tours', 'fullDescription');
    console.log('✅ Successfully removed columns');
  } catch (error) {
    console.error('❌ Error rolling back migration:', error);
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
