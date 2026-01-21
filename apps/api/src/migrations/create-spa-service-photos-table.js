import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Create spa_service_photos table
 * This allows spa services to have multiple photos (up to 5)
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('spa_service_photos')) {
      console.log('Creating spa_service_photos table...');

      await queryInterface.createTable('spa_service_photos', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        serviceId: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          field: 'serviceId',
          references: {
            model: 'spa_services',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        url: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        caption: {
          type: DataTypes.STRING(255),
          allowNull: true,
        },
        displayOrder: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
          field: 'displayOrder',
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

      console.log('✅ Successfully created spa_service_photos table');
    } else {
      console.log('⚠️ Table spa_service_photos already exists');
    }
  } catch (error) {
    console.error('❌ Error creating spa_service_photos table:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Dropping spa_service_photos table...');
    await queryInterface.dropTable('spa_service_photos');
    console.log('✅ Successfully dropped spa_service_photos table');
  } catch (error) {
    console.error('❌ Error dropping spa_service_photos table:', error);
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
