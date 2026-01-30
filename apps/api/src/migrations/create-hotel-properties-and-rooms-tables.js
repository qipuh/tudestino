import sequelize from '../config/database-mysql.js';
import { DataTypes } from 'sequelize';

/**
 * Migration: Create hotel_properties and rooms tables
 */
export async function up() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🏨 Creating hotel properties and rooms tables...');

    // Check if hotel_properties table exists
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('hotel_properties')) {
      console.log('📝 Creating hotel_properties table...');
      await queryInterface.createTable('hotel_properties', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        hostId: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        businessId: {
          type: DataTypes.CHAR(36),
          allowNull: true,
          references: {
            model: 'businesses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'ID del negocio al que pertenece esta propiedad',
        },
        accommodationType: {
          type: DataTypes.ENUM(
            'apartment', 'hotel', 'motel', 'hostel', 'room',
            'house', 'villa', 'cabin', 'resort', 'bed_and_breakfast', 'guesthouse'
          ),
          allowNull: false,
        },
        multipleUnits: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        hotelName: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        hotelCategory: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        propertyName: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Nombre del alojamiento (para todos los tipos)',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Descripción detallada del alojamiento',
        },
        cancellationPolicy: {
          type: DataTypes.ENUM('standard', 'flexible', 'moderate', 'strict', 'non_refundable', 'long_stay'),
          defaultValue: 'standard',
        },
        addressStreet: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        addressCity: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        addressState: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        addressCountry: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        addressZipCode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        addressLatitude: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        addressLongitude: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: true,
        },
        propertyAmenities: {
          type: DataTypes.JSON,
          defaultValue: '[]',
        },
        breakfastIncluded: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        parkingType: {
          type: DataTypes.ENUM('no', 'free', 'paid'),
          defaultValue: 'no',
        },
        parkingDetails: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        checkInTime: {
          type: DataTypes.TIME,
          defaultValue: '14:00:00',
        },
        checkOutTime: {
          type: DataTypes.TIME,
          defaultValue: '12:00:00',
        },
        childrenAllowed: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        petsAllowed: {
          type: DataTypes.ENUM('no', 'yes_free', 'yes_paid'),
          defaultValue: 'no',
        },
        petFee: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: true,
        },
        petFeePer: {
          type: DataTypes.ENUM('day', 'stay'),
          allowNull: true,
        },
        additionalRules: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('draft', 'published', 'suspended'),
          defaultValue: 'published',
        },
        ratingAverage: {
          type: DataTypes.DECIMAL(2, 1),
          defaultValue: 0,
        },
        ratingCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });

      await queryInterface.addIndex('hotel_properties', ['hostId']);
      await queryInterface.addIndex('hotel_properties', ['businessId']);
      await queryInterface.addIndex('hotel_properties', ['accommodationType']);
      await queryInterface.addIndex('hotel_properties', ['status']);
      await queryInterface.addIndex('hotel_properties', ['addressCity']);
      await queryInterface.addIndex('hotel_properties', ['addressCountry']);

      console.log('✅ hotel_properties table created successfully');
    } else {
      console.log('⚠️ hotel_properties table already exists');
    }

    if (!tables.includes('rooms')) {
      console.log('📝 Creating rooms table...');
      await queryInterface.createTable('rooms', {
        id: {
          type: DataTypes.CHAR(36),
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        propertyId: {
          type: DataTypes.CHAR(36),
          allowNull: false,
          references: {
            model: 'hotel_properties',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        roomType: {
          type: DataTypes.ENUM(
            'single', 'double', 'matrimonial', 'twin', 'triple', 'quad',
            'suite', 'junior_suite', 'family', 'deluxe', 'penthouse',
            'dormitory', 'studio'
          ),
          allowNull: false,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          comment: 'Nombre personalizado de la habitación',
        },
        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 1,
          comment: 'Cantidad de habitaciones de este tipo',
        },
        guestCapacity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          comment: 'Capacidad máxima de huéspedes',
        },
        beds: {
          type: DataTypes.JSON,
          allowNull: false,
          comment: 'Array de objetos con tipos y cantidad de camas: [{ type: "double", quantity: 1 }]',
        },
        pricePerNight: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
          comment: 'Precio por noche',
        },
        amenities: {
          type: DataTypes.JSON,
          defaultValue: '[]',
          comment: 'Array de amenidades: básicas, baño y extras',
        },
        view: {
          type: DataTypes.STRING(50),
          allowNull: true,
          comment: 'Tipo de vista: interior, exterior, garden, pool, sea, mountain, city',
        },
        mealPlan: {
          type: DataTypes.STRING(50),
          allowNull: true,
          defaultValue: 'none',
          comment: 'Plan de comidas: none, breakfast, half_board, full_board, all_inclusive',
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
          comment: 'Descripción detallada de la habitación',
        },
        images: {
          type: DataTypes.JSON,
          defaultValue: '[]',
          comment: 'Array de URLs de imágenes',
        },
        isAvailable: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      });

      await queryInterface.addIndex('rooms', ['propertyId']);
      await queryInterface.addIndex('rooms', ['roomType']);
      await queryInterface.addIndex('rooms', ['pricePerNight']);

      console.log('✅ rooms table created successfully');
    } else {
      console.log('⚠️ rooms table already exists');
    }

    console.log('✅ Migration completed successfully');
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
    console.log('🗑️ Dropping rooms table...');
    await queryInterface.dropTable('rooms');

    console.log('🗑️ Dropping hotel_properties table...');
    await queryInterface.dropTable('hotel_properties');

    console.log('✅ Tables dropped successfully');
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
