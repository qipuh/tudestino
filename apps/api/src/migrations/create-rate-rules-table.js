import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

const UUID_COLUMN = 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci';

/**
 * Migration: Create rate_rules table (PMS Fase 3 - Rate Management).
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('rate_rules')) {
      console.log('📝 Creating rate_rules table...');
      await queryInterface.createTable('rate_rules', {
        id: { type: UUID_COLUMN, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        roomId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: { model: 'rooms', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        name: { type: DataTypes.STRING(100), allowNull: false },
        ruleType: { type: DataTypes.ENUM('season', 'day_of_week', 'early_bird', 'last_minute'), allowNull: false },
        startDate: { type: DataTypes.DATEONLY, allowNull: true },
        endDate: { type: DataTypes.DATEONLY, allowNull: true },
        daysOfWeek: { type: DataTypes.JSON, allowNull: true },
        minAdvanceDays: { type: DataTypes.INTEGER, allowNull: true },
        maxAdvanceDays: { type: DataTypes.INTEGER, allowNull: true },
        adjustmentType: { type: DataTypes.ENUM('percentage', 'fixed'), allowNull: false },
        adjustmentValue: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        minStay: { type: DataTypes.INTEGER, allowNull: true },
        maxStay: { type: DataTypes.INTEGER, allowNull: true },
        priority: { type: DataTypes.INTEGER, defaultValue: 0 },
        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex('rate_rules', ['roomId']);
      await queryInterface.addIndex('rate_rules', ['ruleType']);
      await queryInterface.addIndex('rate_rules', ['isActive']);
    } else {
      console.log('⏭️  rate_rules ya existe, se omite');
    }

    console.log('✅ Rate management table ready');
  } catch (error) {
    console.error('❌ Error in migration:', error);
    throw error;
  }
}

export async function down() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.dropTable('rate_rules');
    console.log('✅ rate_rules dropped');
  } catch (error) {
    console.error('❌ Error dropping table:', error);
    throw error;
  }
}

const isMainModule = process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    await up();
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}
