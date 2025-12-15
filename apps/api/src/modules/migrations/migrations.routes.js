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

export default router;

