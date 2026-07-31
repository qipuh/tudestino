import { Router } from 'express';
import sequelize from '../../config/database-mysql.js';
import { DataTypes } from 'sequelize';

const router = Router();

/**
 * POST /api/migrations/add-quantity-column
 * Adds quantity column to rooms table
 */
router.post('/add-quantity-column', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('rooms');

    if (tableDescription.quantity) {
      return res.status(200).json({
        success: true,
        message: 'Column quantity already exists in rooms table',
        alreadyExists: true,
      });
    }

    // Add the column
    await queryInterface.addColumn('rooms', 'quantity', {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Cantidad de habitaciones de este tipo',
    });

    res.status(200).json({
      success: true,
      message: 'Successfully added quantity column to rooms table',
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error adding quantity column:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding quantity column',
      error: error.message,
    });
  }
});

/**
 * GET /api/migrations/check-quantity-column
 * Checks if quantity column exists
 */
router.get('/check-quantity-column', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('rooms');

    res.status(200).json({
      success: true,
      exists: !!tableDescription.quantity,
      columnInfo: tableDescription.quantity || null,
    });
  } catch (error) {
    console.error('Error checking quantity column:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking quantity column',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/add-property-name-description
 * Adds propertyName and description columns to properties table
 */
router.post('/add-property-name-description', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('properties');

    let addedColumns = [];

    // Agregar propertyName si no existe
    if (!tableDescription.propertyName) {
      await queryInterface.addColumn('properties', 'propertyName', {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Nombre del alojamiento (para todos los tipos)',
      });
      addedColumns.push('propertyName');
    }

    // Agregar description si no existe
    if (!tableDescription.description) {
      await queryInterface.addColumn('properties', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada del alojamiento',
      });
      addedColumns.push('description');
    }

    if (addedColumns.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Columns propertyName and description already exist',
        alreadyExists: true,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully added columns: ${addedColumns.join(', ')}`,
      addedColumns,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error adding propertyName and description columns:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding columns',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/add-business-service-settings
 * Adds settings JSON column to business_services table
 */
router.post('/add-business-service-settings', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('business_services');

    if (tableDescription.settings) {
      return res.status(200).json({ success: true, message: 'Column settings already exists in business_services', alreadyExists: true });
    }

    await queryInterface.addColumn('business_services', 'settings', {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'JSON con configuración específica del servicio (precio, capacidad, amenities, etc)'
    });

    res.status(200).json({ success: true, message: 'Successfully added settings column to business_services', alreadyExists: false });
  } catch (error) {
    console.error('Error adding settings column to business_services:', error);
    res.status(500).json({ success: false, message: 'Error adding settings column', error: error.message });
  }
});

/**
 * POST /api/migrations/add-ticket-name
 * Adds name column to event_tickets table
 */
router.post('/add-ticket-name', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('event_tickets');

    if (tableDescription.name) {
      return res.status(200).json({
        success: true,
        message: 'Column name already exists in event_tickets',
        alreadyExists: true
      });
    }

    await queryInterface.addColumn('event_tickets', 'name', {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: 'General', // Default temporal para registros existentes
      comment: 'Ej: General, VIP, Estudiante, Early Bird, etc.'
    });

    // Remove default value after adding column if needed, or keep it.
    // Generally safe to keep default or remove constraint later.

    res.status(200).json({
      success: true,
      message: 'Successfully added name column to event_tickets',
      alreadyExists: false
    });
  } catch (error) {
    console.error('Error adding name column to event_tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding name column',
      error: error.message
    });
  }
});

// Migración para agregar isActive a events
router.post('/add-event-isactive', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('events');

    if (tableDescription.isActive) {
      return res.status(200).json({
        success: true,
        message: 'Column isActive already exists in events table',
        alreadyExists: true,
      });
    }

    await queryInterface.addColumn('events', 'isActive', {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si el evento está activo (campo legacy/compatibilidad)',
    });

    res.json({
      success: true,
      message: 'Column isActive added to events table'
    });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding column',
      error: error.message
    });
  }
});

// Migración para agregar description a event_tickets
router.post('/add-ticket-description', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('event_tickets');

    if (tableDescription.description) {
      return res.status(200).json({
        success: true,
        message: 'Column description already exists in event_tickets table',
        alreadyExists: true,
      });
    }

    await queryInterface.addColumn('event_tickets', 'description', {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción del tipo de entrada',
    });

    res.json({
      success: true,
      message: 'Column description added to event_tickets table'
    });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding column',
      error: error.message
    });
  }
});

// Migración para agregar status a event_tickets
router.post('/add-ticket-status', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('event_tickets');

    if (tableDescription.status) {
      return res.status(200).json({
        success: true,
        message: 'Column status already exists in event_tickets table',
        alreadyExists: true,
      });
    }

    await queryInterface.addColumn('event_tickets', 'status', {
      type: DataTypes.ENUM('active', 'sold_out', 'paused', 'inactive'),
      allowNull: false,
      defaultValue: 'active',
    });

    res.json({
      success: true,
      message: 'Column status added to event_tickets table'
    });
  } catch (error) {
    console.error('Error adding column:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding column',
      error: error.message
    });
  }
});

// Migración completa para asegurar esquema de tickets
router.post('/fix-ticket-schema', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('event_tickets');
    const addedColumns = [];

    // Lista de columnas críticas a verificar
    const columnsToCheck = [
      { name: 'isFree', type: DataTypes.BOOLEAN, options: { allowNull: false, defaultValue: false, field: 'is_free' } },
      { name: 'price', type: DataTypes.DECIMAL(10, 2), options: { allowNull: false, defaultValue: 0 } },
      { name: 'currency', type: DataTypes.STRING(3), options: { allowNull: false, defaultValue: 'PEN' } },
      { name: 'displayOrder', type: DataTypes.INTEGER, options: { allowNull: false, defaultValue: 0, field: 'display_order' } },
      { name: 'minQuantityPerOrder', type: DataTypes.INTEGER, options: { allowNull: false, defaultValue: 1, field: 'min_quantity_per_order' } },
      { name: 'maxQuantityPerOrder', type: DataTypes.INTEGER, options: { allowNull: true, field: 'max_quantity_per_order' } },
      { name: 'soldQuantity', type: DataTypes.INTEGER, options: { allowNull: false, defaultValue: 0, field: 'sold_quantity' } },
      { name: 'reservedQuantity', type: DataTypes.INTEGER, options: { allowNull: false, defaultValue: 0, field: 'reserved_quantity' } }
    ];

    for (const col of columnsToCheck) {
      if (!tableDescription[col.name]) {
        await queryInterface.addColumn('event_tickets', col.name, {
          type: col.type,
          ...col.options
        });
        addedColumns.push(col.name);
      }
    }

    res.json({
      success: true,
      message: addedColumns.length > 0
        ? `Added columns: ${addedColumns.join(', ')}`
        : 'All critical columns already exist',
      addedColumns
    });
  } catch (error) {
    console.error('Error fixing ticket schema:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing schema',
      error: error.message
    });
  }
});

// Migración para renombrar isFree a is_free si es necesario
router.post('/fix-ticket-isfree-column', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('event_tickets');

    if (tableDescription.isFree && !tableDescription.is_free) {
      await queryInterface.renameColumn('event_tickets', 'isFree', 'is_free');
      return res.json({
        success: true,
        message: 'Renamed isFree to is_free'
      });
    }

    res.json({
      success: true,
      message: 'Column is_free already exists or isFree not found',
      columns: Object.keys(tableDescription)
    });
  } catch (error) {
    console.error('Error fixing is_free column:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing column',
      error: error.message
    });
  }
});

/**
 * POST /api/migrations/add-hotel-subtype-category
 * Adds hotelSubtype and hotelCategory columns to businesses table
 */
router.post('/add-hotel-subtype-category', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('businesses');
    const addedColumns = [];

    // Agregar hotelSubtype si no existe
    if (!tableDescription.hotelSubtype) {
      await queryInterface.addColumn('businesses', 'hotelSubtype', {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Subtipo de alojamiento: hotel, hostel, apartment, bnb, resort, villa, etc.',
      });
      addedColumns.push('hotelSubtype');
    }

    // Agregar hotelCategory si no existe
    if (!tableDescription.hotelCategory) {
      await queryInterface.addColumn('businesses', 'hotelCategory', {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Categoría del alojamiento: estrellas, llaves, espigas, mochilas, etc.',
      });
      addedColumns.push('hotelCategory');
    }

    if (addedColumns.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Columns hotelSubtype and hotelCategory already exist',
        alreadyExists: true,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully added columns: ${addedColumns.join(', ')}`,
      addedColumns,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error adding hotelSubtype and hotelCategory columns:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding columns',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/add-rooms-new-fields
 * Adds view, mealPlan, and description columns to rooms table
 */
router.post('/add-rooms-new-fields', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('rooms');
    const addedColumns = [];

    // Agregar view si no existe
    if (!tableDescription.view) {
      await queryInterface.addColumn('rooms', 'view', {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Tipo de vista: interior, exterior, garden, pool, sea, mountain, city',
      });
      addedColumns.push('view');
    }

    // Agregar mealPlan si no existe
    if (!tableDescription.mealPlan) {
      await queryInterface.addColumn('rooms', 'mealPlan', {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'none',
        comment: 'Plan de comidas: none, breakfast, half_board, full_board, all_inclusive',
      });
      addedColumns.push('mealPlan');
    }

    // Agregar description si no existe
    if (!tableDescription.description) {
      await queryInterface.addColumn('rooms', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descripción detallada de la habitación',
      });
      addedColumns.push('description');
    }

    if (addedColumns.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Columns view, mealPlan, and description already exist in rooms table',
        alreadyExists: true,
      });
    }

    res.status(200).json({
      success: true,
      message: `Successfully added columns to rooms table: ${addedColumns.join(', ')}`,
      addedColumns,
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error adding columns to rooms table:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding columns to rooms table',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/create-configs-table
 * Crea la tabla de configuraciones del sistema
 */
router.post('/create-configs-table', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    // Verificar si la tabla ya existe
    const tables = await queryInterface.showAllTables();

    if (tables.includes('configs')) {
      return res.json({
        success: true,
        message: 'La tabla configs ya existe',
        alreadyExists: true
      });
    }

    // Crear la tabla
    await queryInterface.createTable('configs', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      key: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Clave única de configuración (ej: whatsapp_api_token)'
      },
      value: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Valor de la configuración'
      },
      description: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Descripción de para qué sirve esta configuración'
      },
      isEncrypted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si el valor está encriptado o no'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Insertar configuración inicial de WhatsApp API
    await sequelize.query(`
      INSERT INTO configs (id, \`key\`, value, description, isEncrypted) VALUES
      (UUID(), 'whatsapp_api_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIzMDciLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJjb25zdWx0b3IifQ.Fo5bYXz8TYd5l2FJi4HiqC_ifZDhPhukEb0Ln_CN9Oo', 'Token de autenticación para WhatsApp API (Factiliza)', FALSE)
      ON DUPLICATE KEY UPDATE value = VALUES(value)
    `);

    res.json({
      success: true,
      message: 'Tabla configs creada exitosamente con configuración inicial de WhatsApp',
      alreadyExists: false
    });
  } catch (error) {
    console.error('Error creando tabla configs:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando tabla configs',
      error: error.message
    });
  }
});

/**
 * POST /api/migrations/create-location-hierarchy
 * Creates departments, provinces, and districts tables for location normalization
 */
router.post('/create-location-hierarchy', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    // Check if tables already exist
    if (tables.includes('departments') && tables.includes('provinces') && tables.includes('districts')) {
      return res.json({
        success: true,
        message: 'Location hierarchy tables already exist',
        alreadyExists: true,
      });
    }

    // Create departments table
    if (!tables.includes('departments')) {
      await queryInterface.createTable('departments', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        country_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: { model: 'countries', key: 'id' },
          onDelete: 'CASCADE',
        },
        code: {
          type: DataTypes.STRING(10),
          allowNull: false,
          comment: 'Region/department code',
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        native_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        latitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      }, {
        indexes: [
          { fields: ['country_id'] },
          { fields: ['code'] },
          { fields: ['name'] },
        ],
      });
    }

    // Create provinces table
    if (!tables.includes('provinces')) {
      await queryInterface.createTable('provinces', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        department_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: { model: 'departments', key: 'id' },
          onDelete: 'CASCADE',
        },
        code: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        native_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        latitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      }, {
        indexes: [
          { fields: ['department_id'] },
          { fields: ['code'] },
          { fields: ['name'] },
        ],
      });
    }

    // Create districts table
    if (!tables.includes('districts')) {
      await queryInterface.createTable('districts', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        province_id: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: { model: 'provinces', key: 'id' },
          onDelete: 'CASCADE',
        },
        code: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        native_name: {
          type: DataTypes.STRING(100),
          allowNull: true,
        },
        latitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        longitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: true,
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
      }, {
        indexes: [
          { fields: ['province_id'] },
          { fields: ['code'] },
          { fields: ['name'] },
        ],
      });
    }

    res.json({
      success: true,
      message: 'Location hierarchy tables created successfully',
      alreadyExists: false,
    });
  } catch (error) {
    console.error('Error creating location hierarchy tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating location hierarchy tables',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/add-district-fk-to-entities
 * Adds district_id foreign key columns to hotel_properties, attractions, businesses, events, entertainment, tours
 */
router.post('/add-district-fk-to-entities', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();

    const tablesToUpdate = [
      'hotel_properties',
      'attractions',
      'businesses',
      'events',
      'entertainment',
      'tours',
    ];

    const results = [];

    for (const table of tablesToUpdate) {
      const tableDescription = await queryInterface.describeTable(table);

      if (tableDescription.district_id) {
        results.push({ table, status: 'already_exists' });
        continue;
      }

      // Add district_id column
      await queryInterface.addColumn(table, 'district_id', {
        type: DataTypes.CHAR(36),
        allowNull: true,
        comment: 'FK to districts table',
      });

      // Add foreign key constraint
      try {
        await queryInterface.addConstraint(table, {
          fields: ['district_id'],
          type: 'foreign key',
          name: `fk_${table}_district`,
          references: {
            table: 'districts',
            field: 'id',
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE',
        });
      } catch (fkError) {
        console.warn(`FK constraint for ${table} may already exist:`, fkError.message);
      }

      // Add index
      try {
        await queryInterface.addIndex(table, ['district_id'], {
          name: `idx_${table}_district_id`,
        });
      } catch (indexError) {
        console.warn(`Index for ${table} may already exist:`, indexError.message);
      }

      results.push({ table, status: 'migrated' });
    }

    res.json({
      success: true,
      message: 'District FK columns added successfully',
      results,
    });
  } catch (error) {
    console.error('Error adding district FK:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding district FK columns',
      error: error.message,
    });
  }
});

/**
 * POST /api/migrations/add-business-service-price
 * Adds price column to business_services table (extiende el sistema existente en vez de crear tabla nueva)
 */
router.post('/add-business-service-price', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('business_services');

    if (tableDescription.price) {
      return res.json({ success: true, message: 'Column price already exists in business_services', alreadyExists: true });
    }

    await queryInterface.addColumn('business_services', 'price', {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Precio del servicio (amenity/food_item/activity/addon). Null si el precio vive en settings JSON.',
    });

    res.json({ success: true, message: 'Column price added to business_services', alreadyExists: false });
  } catch (error) {
    console.error('Error adding price column to business_services:', error);
    res.status(500).json({ success: false, message: 'Error adding price column', error: error.message });
  }
});

/**
 * POST /api/migrations/add-reservation-service-fields
 * Adds serviceId, totalPrice, metadata columns to business_reservations table
 */
router.post('/add-reservation-service-fields', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('business_reservations');
    const addedColumns = [];

    if (!tableDescription.serviceId) {
      await queryInterface.addColumn('business_reservations', 'serviceId', {
        type: DataTypes.CHAR(36),
        allowNull: true,
        comment: 'FK opcional a business_services — qué servicio específico se reservó',
      });
      try {
        await queryInterface.addConstraint('business_reservations', {
          fields: ['serviceId'],
          type: 'foreign key',
          name: 'fk_business_reservations_service',
          references: { table: 'business_services', field: 'id' },
          onDelete: 'RESTRICT',
          onUpdate: 'CASCADE',
        });
      } catch (fkError) {
        console.warn('FK constraint for business_reservations.serviceId may already exist:', fkError.message);
      }
      addedColumns.push('serviceId');
    }

    if (!tableDescription.totalPrice) {
      await queryInterface.addColumn('business_reservations', 'totalPrice', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Precio total de la reserva',
      });
      addedColumns.push('totalPrice');
    }

    if (!tableDescription.metadata) {
      await queryInterface.addColumn('business_reservations', 'metadata', {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Texto libre no facturable (ej: llegada tarde). Lo facturable va en serviceId/totalPrice, no aquí.',
      });
      addedColumns.push('metadata');
    }

    if (addedColumns.length === 0) {
      return res.json({ success: true, message: 'Columns serviceId, totalPrice, metadata already exist in business_reservations', alreadyExists: true });
    }

    res.json({ success: true, message: `Added columns to business_reservations: ${addedColumns.join(', ')}`, addedColumns });
  } catch (error) {
    console.error('Error adding fields to business_reservations:', error);
    res.status(500).json({ success: false, message: 'Error adding fields to business_reservations', error: error.message });
  }
});

/**
 * POST /api/migrations/add-business-photo-type
 * Adds type column (cover/gallery/video) to business_photos table
 */
router.post('/add-business-photo-type', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('business_photos');

    if (tableDescription.type) {
      return res.json({ success: true, message: 'Column type already exists in business_photos', alreadyExists: true });
    }

    await queryInterface.addColumn('business_photos', 'type', {
      type: DataTypes.ENUM('cover', 'gallery', 'video'),
      allowNull: false,
      defaultValue: 'gallery',
      comment: 'Tipo de media: cover (portada), gallery (galería), video',
    });

    res.json({ success: true, message: 'Column type added to business_photos', alreadyExists: false });
  } catch (error) {
    console.error('Error adding type column to business_photos:', error);
    res.status(500).json({ success: false, message: 'Error adding type column', error: error.message });
  }
});

/**
 * POST /api/migrations/add-business-specs-fields
 * Adds cuisine, priceRange, capacity, eventDateStart, eventDateEnd to businesses table
 */
router.post('/add-business-specs-fields', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('businesses');
    const addedColumns = [];

    const columnsToAdd = [
      { name: 'cuisine', type: DataTypes.STRING(100), options: { allowNull: true } },
      { name: 'priceRange', type: DataTypes.ENUM('$', '$$', '$$$', '$$$$'), options: { allowNull: true } },
      { name: 'capacity', type: DataTypes.INTEGER, options: { allowNull: true } },
      { name: 'eventDateStart', type: DataTypes.DATE, options: { allowNull: true } },
      { name: 'eventDateEnd', type: DataTypes.DATE, options: { allowNull: true } },
    ];

    for (const col of columnsToAdd) {
      if (!tableDescription[col.name]) {
        await queryInterface.addColumn('businesses', col.name, { type: col.type, ...col.options });
        addedColumns.push(col.name);
      }
    }

    if (addedColumns.length === 0) {
      return res.json({ success: true, message: 'Spec columns already exist in businesses', alreadyExists: true });
    }

    res.json({ success: true, message: `Added spec columns to businesses: ${addedColumns.join(', ')}`, addedColumns });
  } catch (error) {
    console.error('Error adding spec columns to businesses:', error);
    res.status(500).json({ success: false, message: 'Error adding spec columns', error: error.message });
  }
});

/**
 * POST /api/migrations/add-favorites-business-support
 * Adds businessId to favorites, relaxes propertyId to nullable (favorito puede ser property O business)
 */
router.post('/add-favorites-business-support', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('favorites');
    const changes = [];

    if (!tableDescription.businessId) {
      await queryInterface.addColumn('favorites', 'businessId', {
        type: DataTypes.CHAR(36),
        allowNull: true,
        comment: 'FK a businesses. Exactamente uno de propertyId/businessId debe estar seteado.',
      });
      try {
        await queryInterface.addIndex('favorites', ['userId', 'businessId'], {
          name: 'favorites_user_business_unique',
          unique: true,
        });
      } catch (idxError) {
        console.warn('Index favorites_user_business_unique may already exist:', idxError.message);
      }
      changes.push('businessId added');
    }

    if (tableDescription.propertyId && tableDescription.propertyId.allowNull === false) {
      await queryInterface.changeColumn('favorites', 'propertyId', {
        type: DataTypes.CHAR(36),
        allowNull: true,
      });
      changes.push('propertyId relaxed to nullable');
    }

    if (changes.length === 0) {
      return res.json({ success: true, message: 'favorites already supports businessId', alreadyExists: true });
    }

    res.json({ success: true, message: `favorites updated: ${changes.join(', ')}`, changes });
  } catch (error) {
    console.error('Error updating favorites for business support:', error);
    res.status(500).json({ success: false, message: 'Error updating favorites', error: error.message });
  }
});

/**
 * POST /api/migrations/add-promotions-business-id
 * Adds businessId to promotions (null = promoción global de plataforma)
 */
router.post('/add-promotions-business-id', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('promotions');

    if (tableDescription.businessId) {
      return res.json({ success: true, message: 'Column businessId already exists in promotions', alreadyExists: true });
    }

    await queryInterface.addColumn('promotions', 'businessId', {
      type: DataTypes.CHAR(36),
      allowNull: true,
      comment: 'FK a businesses. Null = promoción global de la plataforma.',
    });

    try {
      await queryInterface.addIndex('promotions', ['businessId'], { name: 'idx_promotions_business_id' });
    } catch (idxError) {
      console.warn('Index idx_promotions_business_id may already exist:', idxError.message);
    }

    res.json({ success: true, message: 'Column businessId added to promotions', alreadyExists: false });
  } catch (error) {
    console.error('Error adding businessId to promotions:', error);
    res.status(500).json({ success: false, message: 'Error adding businessId column', error: error.message });
  }
});

/**
 * POST /api/migrations/add-reservation-payment-fields
 * Adds currency, paymentStatus/Intent/Method, fee split, refund fields to business_reservations
 */
router.post('/add-reservation-payment-fields', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('business_reservations');
    const addedColumns = [];

    const columnsToAdd = [
      { name: 'currency', type: DataTypes.STRING(3), options: { allowNull: false, defaultValue: 'PEN' } },
      { name: 'paymentStatus', type: DataTypes.ENUM('pending', 'paid', 'refunded', 'failed'), options: { allowNull: false, defaultValue: 'pending' } },
      { name: 'paymentIntentId', type: DataTypes.STRING, options: { allowNull: true } },
      { name: 'paymentMethod', type: DataTypes.STRING, options: { allowNull: true } },
      { name: 'platformFeePercent', type: DataTypes.DECIMAL(5, 2), options: { allowNull: true } },
      { name: 'platformFeeAmount', type: DataTypes.DECIMAL(10, 2), options: { allowNull: true } },
      { name: 'gatewayFeeAmount', type: DataTypes.DECIMAL(10, 2), options: { allowNull: true } },
      { name: 'businessNetAmount', type: DataTypes.DECIMAL(10, 2), options: { allowNull: true } },
      { name: 'refundedAmount', type: DataTypes.DECIMAL(10, 2), options: { allowNull: true } },
      { name: 'refundReason', type: DataTypes.TEXT, options: { allowNull: true } },
      { name: 'refundedAt', type: DataTypes.DATE, options: { allowNull: true } },
    ];

    for (const col of columnsToAdd) {
      if (!tableDescription[col.name]) {
        await queryInterface.addColumn('business_reservations', col.name, { type: col.type, ...col.options });
        addedColumns.push(col.name);
      }
    }

    if (addedColumns.length === 0) {
      return res.json({ success: true, message: 'Payment columns already exist in business_reservations', alreadyExists: true });
    }

    res.json({ success: true, message: `Added to business_reservations: ${addedColumns.join(', ')}`, addedColumns });
  } catch (error) {
    console.error('Error adding payment fields to business_reservations:', error);
    res.status(500).json({ success: false, message: 'Error adding payment fields', error: error.message });
  }
});

/**
 * POST /api/migrations/add-business-commission-fields
 * Adds platformFeePercent and bankAccount to businesses table
 */
router.post('/add-business-commission-fields', async (req, res) => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const tableDescription = await queryInterface.describeTable('businesses');
    const addedColumns = [];

    if (!tableDescription.platformFeePercent) {
      await queryInterface.addColumn('businesses', 'platformFeePercent', {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Comisión tudestino %. Null = default global.',
      });
      addedColumns.push('platformFeePercent');
    }

    if (!tableDescription.bankAccount) {
      await queryInterface.addColumn('businesses', 'bankAccount', {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Datos bancarios para desembolsos: {bank, accountType, accountNumber, cci}',
      });
      addedColumns.push('bankAccount');
    }

    if (addedColumns.length === 0) {
      return res.json({ success: true, message: 'Commission columns already exist in businesses', alreadyExists: true });
    }

    res.json({ success: true, message: `Added to businesses: ${addedColumns.join(', ')}`, addedColumns });
  } catch (error) {
    console.error('Error adding commission fields to businesses:', error);
    res.status(500).json({ success: false, message: 'Error adding commission fields', error: error.message });
  }
});

/**
 * POST /api/migrations/run-polymorph
 * Ejecuta todas las migraciones polymorph en serie (DDL + data migrations)
 */
router.post('/run-polymorph', async (req, res) => {
  try {
    const logs = [];

    logs.push('Starting polymorph data migrations...');

    // Migrate businesses
    logs.push('Migrating businesses...');
    await sequelize.query(`
      INSERT INTO businesses (id, ownerId, name, slug, description, businessType, address, contactPhone, contactEmail, status, districtId, ratingAverage, reviewCount)
      SELECT
        id,
        hostId,
        COALESCE(propertyName, hotelName, 'Unnamed'),
        LOWER(REPLACE(REPLACE(COALESCE(propertyName, hotelName, 'unnamed'), ' ', '-'), '/', '-')),
        description,
        'accommodation',
        JSON_OBJECT('street', addressStreet, 'city', addressCity, 'state', addressState, 'country', addressCountry, 'latitude', addressLatitude, 'longitude', addressLongitude, 'zipCode', addressZipCode),
        contactPhone,
        contactEmail,
        'active',
        district_id,
        COALESCE(ratingAverage, 0),
        COALESCE(ratingCount, 0)
      FROM hotel_properties
      WHERE businessId IS NULL
      ON DUPLICATE KEY UPDATE id=id;
    `);

    // Migrate media (business_photos -> media)
    logs.push('Migrating media...');
    await sequelize.query(`
      INSERT INTO media (id, url, type, mediable_type, mediable_id, \`order\`)
      SELECT
        id,
        photo_url,
        'gallery',
        'Business',
        business_id,
        0
      FROM business_photos
      WHERE business_id IS NOT NULL
      ON DUPLICATE KEY UPDATE id=id;
    `);

    // Migrate services (business_services unchanged, just ensure they exist)
    logs.push('Ensuring services exist...');
    // business_services already exists, no migration needed

    // Migrate reservations (business_reservations with service info)
    logs.push('Migrating reservations...');
    await sequelize.query(`
      INSERT INTO reservations (id, businessId, userId, serviceId, reservationDate, reservationTime, numberOfPeople, status, totalPrice, currency, paymentStatus, metadata)
      SELECT
        id,
        business_id,
        guest_id,
        NULL,
        booking_date,
        booking_time,
        COALESCE(guests, 1),
        status,
        total_price,
        'PEN',
        'pending',
        JSON_OBJECT('notes', notes)
      FROM business_reservations
      ON DUPLICATE KEY UPDATE id=id;
    `);

    // Migrate offers (promotions -> offers)
    logs.push('Migrating offers...');
    await sequelize.query(`
      INSERT INTO offers (id, businessId, code, title, description, discountType, discountValue, maxUses, usedCount, validFrom, validUntil, isActive)
      SELECT
        id,
        business_id,
        code,
        title,
        description,
        discount_type,
        discount_value,
        max_uses,
        COALESCE(used_count, 0),
        valid_from,
        valid_until,
        is_active
      FROM promotions
      WHERE business_id IS NOT NULL
      ON DUPLICATE KEY UPDATE id=id;
    `);

    // Migrate user favorites
    logs.push('Migrating user favorites...');
    await sequelize.query(`
      INSERT INTO user_favorites (id, userId, businessId)
      SELECT
        id,
        user_id,
        business_id
      FROM favorites
      WHERE business_id IS NOT NULL
      ON DUPLICATE KEY UPDATE id=id;
    `);

    logs.push('✓ All polymorph data migrations completed');

    res.json({
      success: true,
      message: 'Polymorph data migrations completed successfully',
      logs,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running polymorph migrations:', error);
    res.status(500).json({
      success: false,
      message: 'Error running polymorph migrations',
      error: error.message,
      logs: []
    });
  }
});

export default router;

