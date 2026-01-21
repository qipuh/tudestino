import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Create business_seasons table
 * This allows businesses to define different seasons for pricing (Alta, Baja, etc.)
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('business_seasons')) {
      console.log('Creating business_seasons table...');

      await queryInterface.createTable('business_seasons', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        businessId: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          field: 'businessId',
          references: {
            model: 'businesses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('high', 'low', 'custom'),
          allowNull: false,
          defaultValue: 'high',
        },
        startDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'startDate',
        },
        endDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'endDate',
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'createdAt',
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          field: 'updatedAt',
        },
      });

      console.log('✅ Successfully created business_seasons table');
    } else {
      console.log('⚠️ Table business_seasons already exists');
    }
  } catch (error) {
    console.error('❌ Error creating business_seasons table:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Dropping business_seasons table...');
    await queryInterface.dropTable('business_seasons');
    console.log('✅ Successfully dropped business_seasons table');
  } catch (error) {
    console.error('❌ Error dropping business_seasons table:', error);
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
