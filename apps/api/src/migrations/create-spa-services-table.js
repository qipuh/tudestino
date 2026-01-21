import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Create spa_services table
 * This allows spa and wellness businesses to define their services
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    // Check if table already exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('spa_services')) {
      console.log('Creating spa_services table...');

      await queryInterface.createTable('spa_services', {
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
          type: DataTypes.STRING(200),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        category: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        duration: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Duración en minutos',
        },
        price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING(500),
          allowNull: true,
        },
        isAvailable: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
          field: 'isAvailable',
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

      console.log('✅ Successfully created spa_services table');
    } else {
      console.log('⚠️ Table spa_services already exists');
    }
  } catch (error) {
    console.error('❌ Error creating spa_services table:', error);
    throw error;
  }
}

/**
 * Rollback migration
 */
export async function down() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Dropping spa_services table...');
    await queryInterface.dropTable('spa_services');
    console.log('✅ Successfully dropped spa_services table');
  } catch (error) {
    console.error('❌ Error dropping spa_services table:', error);
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
