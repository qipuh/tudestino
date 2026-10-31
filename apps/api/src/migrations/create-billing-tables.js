import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

// Ver nota en create-pms-phase1-tables.js: la DB usa utf8mb4_0900_ai_ci por
// defecto pero las tablas existentes (bookings, businesses, users) fijan
// utf8mb4_general_ci en sus columnas CHAR(36) - toda FK nueva debe calzar.
const UUID_COLUMN = 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci';

/**
 * Migration: Create invoices, invoice_payments and cash_registers tables
 * (PMS Fase 2 - Facturación y Caja).
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('cash_registers')) {
      console.log('📝 Creating cash_registers table...');
      await queryInterface.createTable('cash_registers', {
        id: { type: UUID_COLUMN, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        businessId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: { model: 'businesses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        openedBy: { type: UUID_COLUMN, allowNull: false },
        openedAt: { type: DataTypes.DATE, allowNull: false },
        closedBy: { type: UUID_COLUMN, allowNull: true },
        closedAt: { type: DataTypes.DATE, allowNull: true },
        openingFloat: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
        expectedCash: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        countedCash: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        difference: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
        status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
        notes: { type: DataTypes.TEXT, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex('cash_registers', ['businessId']);
      await queryInterface.addIndex('cash_registers', ['status']);
    } else {
      console.log('⏭️  cash_registers ya existe, se omite');
    }

    if (!tables.includes('invoices')) {
      console.log('📝 Creating invoices table...');
      await queryInterface.createTable('invoices', {
        id: { type: UUID_COLUMN, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        bookingId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: { model: 'bookings', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        businessId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: { model: 'businesses', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        guestId: { type: UUID_COLUMN, allowNull: false },
        lineItems: { type: DataTypes.JSON, allowNull: false },
        subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        taxTotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        amountPaid: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
        status: { type: DataTypes.ENUM('issued', 'paid', 'void', 'credited'), defaultValue: 'issued' },
        issuedAt: { type: DataTypes.DATE, allowNull: false },
        notes: { type: DataTypes.TEXT, allowNull: true },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex('invoices', ['bookingId']);
      await queryInterface.addIndex('invoices', ['businessId']);
      await queryInterface.addIndex('invoices', ['status']);
    } else {
      console.log('⏭️  invoices ya existe, se omite');
    }

    if (!tables.includes('invoice_payments')) {
      console.log('📝 Creating invoice_payments table...');
      await queryInterface.createTable('invoice_payments', {
        id: { type: UUID_COLUMN, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        invoiceId: {
          type: UUID_COLUMN,
          allowNull: false,
          references: { model: 'invoices', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        method: { type: DataTypes.ENUM('cash', 'card', 'transfer', 'other'), allowNull: false },
        amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
        isRefund: { type: DataTypes.BOOLEAN, defaultValue: false },
        reason: { type: DataTypes.TEXT, allowNull: true },
        reference: { type: DataTypes.STRING(100), allowNull: true },
        cashRegisterId: {
          type: UUID_COLUMN,
          allowNull: true,
          references: { model: 'cash_registers', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        registeredBy: { type: UUID_COLUMN, allowNull: false },
        createdAt: { type: DataTypes.DATE, allowNull: false },
        updatedAt: { type: DataTypes.DATE, allowNull: false },
      });
      await queryInterface.addIndex('invoice_payments', ['invoiceId']);
      await queryInterface.addIndex('invoice_payments', ['cashRegisterId']);
      await queryInterface.addIndex('invoice_payments', ['method']);
    } else {
      console.log('⏭️  invoice_payments ya existe, se omite');
    }

    console.log('✅ Billing tables ready');
  } catch (error) {
    console.error('❌ Error in migration:', error);
    throw error;
  }
}

export async function down() {
  const queryInterface = sequelize.getQueryInterface();
  try {
    await queryInterface.dropTable('invoice_payments');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('cash_registers');
    console.log('✅ Billing tables dropped');
  } catch (error) {
    console.error('❌ Error dropping tables:', error);
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
