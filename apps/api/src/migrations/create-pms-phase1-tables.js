import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

// Las tablas existentes (rooms, bookings, users) fijan explícitamente
// utf8mb4_general_ci en sus columnas CHAR(36), pero la base de datos por
// defecto usa utf8mb4_0900_ai_ci (MySQL 8). Un FK entre collations
// distintas falla con ER_FK_INCOMPATIBLE_COLUMNS, así que toda columna
// CHAR(36) nueva debe declarar el mismo charset/collate explícito.
const UUID_COLUMN = 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci';

/**
 * Migration: Create room_units, front_desk_stays and housekeeping_tasks
 * tables (PMS Fase 1 - Front Desk + Housekeeping).
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('room_units')) {
      console.log('📝 Creating room_units table...');
      await queryInterface.createTable('room_units', {
        id: {
          type: UUID_COLUMN,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        roomId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: {
            model: 'rooms',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        unitNumber: {
          type: DataTypes.STRING(20),
          allowNull: false,
        },
        floor: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },
        housekeepingStatus: {
          type: DataTypes.ENUM('clean', 'dirty', 'inspected', 'out_of_service'),
          defaultValue: 'clean',
        },
        operationalStatus: {
          type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'blocked'),
          defaultValue: 'available',
        },
        currentBookingId: {
          type: UUID_COLUMN,
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });

      await queryInterface.addIndex('room_units', ['roomId']);
      await queryInterface.addIndex('room_units', ['operationalStatus']);
      await queryInterface.addIndex('room_units', ['housekeepingStatus']);
      await queryInterface.addIndex('room_units', ['roomId', 'unitNumber'], { unique: true });
    } else {
      console.log('⏭️  room_units ya existe, se omite');
    }

    if (!tables.includes('front_desk_stays')) {
      console.log('📝 Creating front_desk_stays table...');
      await queryInterface.createTable('front_desk_stays', {
        id: {
          type: UUID_COLUMN,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        bookingId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: {
            model: 'bookings',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        roomUnitId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: {
            model: 'room_units',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        checkedInAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        checkedOutAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        keysIssued: {
          type: DataTypes.INTEGER,
          defaultValue: 1,
        },
        checkedInBy: {
          type: UUID_COLUMN,
          allowNull: false,
        },
        checkedOutBy: {
          type: UUID_COLUMN,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('in_house', 'checked_out', 'no_show'),
          defaultValue: 'in_house',
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });

      await queryInterface.addIndex('front_desk_stays', ['bookingId']);
      await queryInterface.addIndex('front_desk_stays', ['roomUnitId']);
      await queryInterface.addIndex('front_desk_stays', ['status']);
    } else {
      console.log('⏭️  front_desk_stays ya existe, se omite');
    }

    if (!tables.includes('housekeeping_tasks')) {
      console.log('📝 Creating housekeeping_tasks table...');
      await queryInterface.createTable('housekeeping_tasks', {
        id: {
          type: UUID_COLUMN,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        roomUnitId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: {
            model: 'room_units',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        assignedTo: {
          type: UUID_COLUMN,
          allowNull: true,
        },
        createdBy: {
          type: UUID_COLUMN,
          allowNull: true,
        },
        taskType: {
          type: DataTypes.ENUM('checkout_clean', 'stayover', 'deep_clean', 'inspection'),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'in_progress', 'done', 'flagged'),
          defaultValue: 'pending',
        },
        incidentNotes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        startedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        finishedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });

      await queryInterface.addIndex('housekeeping_tasks', ['roomUnitId']);
      await queryInterface.addIndex('housekeeping_tasks', ['assignedTo']);
      await queryInterface.addIndex('housekeeping_tasks', ['status']);
    } else {
      console.log('⏭️  housekeeping_tasks ya existe, se omite');
    }

    console.log('✅ PMS Fase 1 tables ready');
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
    await queryInterface.dropTable('housekeeping_tasks');
    await queryInterface.dropTable('front_desk_stays');
    await queryInterface.dropTable('room_units');
    console.log('✅ PMS Fase 1 tables dropped');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
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
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await sequelize.close();
    process.exit(1);
  }
}
