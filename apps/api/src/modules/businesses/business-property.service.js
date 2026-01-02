import Business from './business.model.js';
import { Property, Room } from '../properties/hotel-property.model.js';
import sequelize from '../../config/database-mysql.js';

class BusinessPropertyService {
  /**
   * Crear propiedad con habitaciones para un negocio
   * @param {string} businessId - ID del negocio
   * @param {string} ownerId - ID del dueño del negocio
   * @param {object} propertyData - Datos de la propiedad y habitaciones
   * @returns {Promise<object>} - Propiedad creada con habitaciones
   */
  async createPropertyWithRooms(businessId, ownerId, propertyData) {
    const transaction = await sequelize.transaction();

    try {
      // 1. Verificar que el negocio existe y pertenece al usuario
      const business = await Business.findOne({
        where: {
          id: businessId,
          ownerId: ownerId
        }
      });

      if (!business) {
        throw new Error('Negocio no encontrado o no tienes permiso para modificarlo');
      }

      // 2. Verificar que el negocio es tipo hotel
      if (business.businessType !== 'hotel') {
        throw new Error('Solo los negocios tipo hotel pueden crear propiedades con habitaciones');
      }

      // 2.5. Buscar si ya existe una propiedad para este negocio
      let property = await Property.findOne({
        where: {
          hostId: ownerId,
          hotelName: business.name
        }
      });

      // 3. Preparar datos de la propiedad
      const {
        checkInTime,
        checkOutTime,
        hasWifi,
        hasParking,
        hasSwimmingPool,
        hasRestaurant,
        petsAllowed,
        breakfastIncluded,
        childrenAllowed,
        rooms = []
      } = propertyData;

      // Validar que haya al menos una habitación
      if (!rooms || rooms.length === 0) {
        throw new Error('Debes agregar al menos una habitación');
      }

      // Construir array de amenidades del establecimiento
      const propertyAmenities = [];
      if (hasWifi) propertyAmenities.push('wifi');
      if (hasParking) propertyAmenities.push('parking');
      if (hasSwimmingPool) propertyAmenities.push('swimming_pool');
      if (hasRestaurant) propertyAmenities.push('restaurant');

      // 4. Crear o usar la propiedad existente
      if (!property) {
        property = await Property.create({
        hostId: ownerId,
        accommodationType: 'hotel',
        multipleUnits: true,
        hotelName: business.name,
        propertyName: business.name,
        description: business.description || 'Hotel en ' + business.address?.city,

        // Dirección desde el negocio
        addressStreet: business.address?.street || '',
        addressCity: business.address?.city || '',
        addressState: business.address?.state || '',
        addressCountry: business.address?.country || 'Perú',
        addressZipCode: business.address?.zipCode || '',
        addressLatitude: business.address?.latitude || null,
        addressLongitude: business.address?.longitude || null,

        // Servicios del establecimiento
        propertyAmenities: propertyAmenities,

        // Horarios
        checkInTime: checkInTime || '14:00:00',
        checkOutTime: checkOutTime || '12:00:00',

        // Políticas
        breakfastIncluded: breakfastIncluded || false,
        parkingType: hasParking ? 'free' : 'no',
        childrenAllowed: childrenAllowed !== false, // default true
        petsAllowed: petsAllowed ? 'yes_free' : 'no',

        // Estado
        status: 'published',
        isActive: true
        }, { transaction });
      }
      // Si ya existe la propiedad, simplemente la usamos para agregar las habitaciones

      // 5. Crear las habitaciones
      const createdRooms = [];
      for (const roomData of rooms) {
        const {
          type,
          quantity,
          capacity,
          pricePerNight,
          amenities = [],
          description = '',
          images = []
        } = roomData;

        // Validaciones
        if (!type || !pricePerNight) {
          throw new Error('Cada habitación debe tener tipo y precio');
        }

        // Mapear tipo de habitación del frontend al backend
        const roomTypeMap = {
          'single': 'single',
          'double': 'double',
          'triple': 'triple',
          'quad': 'quadruple',
          'suite': 'suite',
          'family': 'family'
        };

        const mappedRoomType = roomTypeMap[type] || type;

        // Generar nombre basado en el tipo
        const roomTypeNames = {
          'single': 'Habitación Individual',
          'double': 'Habitación Doble',
          'triple': 'Habitación Triple',
          'quadruple': 'Habitación Cuádruple',
          'suite': 'Suite',
          'family': 'Habitación Familiar'
        };

        const roomName = roomTypeNames[mappedRoomType] || 'Habitación';

        // Crear configuración de camas básica según tipo
        const bedsConfig = this.generateBedsConfig(mappedRoomType);

        const room = await Room.create({
          propertyId: property.id,
          roomType: mappedRoomType,
          name: roomName,
          quantity: quantity || 1,
          guestCapacity: capacity || 2,
          beds: bedsConfig,
          pricePerNight: pricePerNight,
          amenities: amenities,
          description: description || '',
          images: images,
          isAvailable: true
        }, { transaction });

        createdRooms.push(room);
      }

      // 6. Commit de la transacción
      await transaction.commit();

      // 7. Cargar la propiedad completa con habitaciones
      const completeProperty = await Property.findByPk(property.id, {
        include: [{
          model: Room,
          as: 'rooms'
        }]
      });

      return completeProperty;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Generar configuración de camas según tipo de habitación
   * @param {string} roomType - Tipo de habitación
   * @returns {Array} - Array de configuración de camas
   */
  generateBedsConfig(roomType) {
    const bedsMapping = {
      'single': [{ type: 'single_bed', count: 1 }],
      'double': [{ type: 'queen_bed', count: 1 }],
      'triple': [{ type: 'single_bed', count: 3 }],
      'quadruple': [{ type: 'double_bed', count: 2 }],
      'suite': [{ type: 'king_bed', count: 1 }],
      'family': [{ type: 'queen_bed', count: 1 }, { type: 'single_bed', count: 2 }]
    };

    return bedsMapping[roomType] || [{ type: 'double_bed', count: 1 }];
  }

  /**
   * Obtener propiedad de un negocio con habitaciones
   * @param {string} businessId - ID del negocio
   * @param {string} ownerId - ID del dueño (opcional, para validar permisos)
   * @returns {Promise<object>} - Propiedad con habitaciones (o estructura con todas las habitaciones)
   */
  async getBusinessProperty(businessId, ownerId = null) {
    try {
      // Verificar que el negocio existe
      const whereClause = { id: businessId };
      if (ownerId) {
        whereClause.ownerId = ownerId;
      }

      const business = await Business.findOne({ where: whereClause });

      if (!business) {
        throw new Error('Negocio no encontrado');
      }

      // Buscar TODAS las propiedades del negocio
      const properties = await Property.findAll({
        where: {
          hostId: business.ownerId,
          hotelName: business.name
        },
        include: [{
          model: Room,
          as: 'rooms'
        }],
        order: [['createdAt', 'DESC']]
      });

      if (!properties || properties.length === 0) {
        return null;
      }

      // Si hay múltiples propiedades, combinar todas las habitaciones
      if (properties.length > 1) {
        // Usar la propiedad más reciente como base
        const mainProperty = properties[0].toJSON();

        // Combinar todas las habitaciones de todas las propiedades
        const allRooms = [];
        for (const property of properties) {
          if (property.rooms && property.rooms.length > 0) {
            allRooms.push(...property.rooms);
          }
        }

        // Retornar la propiedad principal con todas las habitaciones
        mainProperty.rooms = allRooms;
        return mainProperty;
      }

      // Si solo hay una propiedad, devolverla directamente
      return properties[0];
    } catch (error) {
      throw error;
    }
  }
}

export default new BusinessPropertyService();
