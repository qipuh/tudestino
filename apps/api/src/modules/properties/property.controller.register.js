import { Property, Room } from './property.model.sequelize.js';
import sequelize from '../../config/database-mysql.js';

/**
 * Registrar una nueva propiedad con sus habitaciones
 * POST /api/properties/register
 */
export const registerProperty = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      // Tipo de alojamiento
      accommodationType,
      multipleUnits,
      hotelName,
      hotelCategory,

      // Política de cancelación
      cancellationPolicy,

      // Ubicación
      address,

      // Servicios
      propertyAmenities,
      breakfastIncluded,
      parkingType,
      parkingDetails,

      // Normas
      checkInTime,
      checkOutTime,
      childrenAllowed,
      petsAllowed,
      petFee,
      petFeePer,
      additionalRules,

      // Habitaciones
      rooms,
    } = req.body;

    // Validar usuario autenticado
    if (!req.user || !req.user.id) {
      await transaction.rollback();
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado',
      });
    }

    // Validar datos requeridos
    if (!accommodationType) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'El tipo de alojamiento es requerido',
      });
    }

    if (!address || !address.street || !address.city || !address.country) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'La dirección completa es requerida',
      });
    }

    if (!rooms || rooms.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Debe configurar al menos una habitación',
      });
    }

    // Crear la propiedad
    const property = await Property.create(
      {
        hostId: req.user.id,
        accommodationType,
        multipleUnits: multipleUnits || false,
        hotelName: hotelName || null,
        hotelCategory: hotelCategory || null,
        cancellationPolicy: cancellationPolicy || 'standard',

        // Dirección
        addressStreet: address.street,
        addressCity: address.city,
        addressState: address.state || null,
        addressCountry: address.country,
        addressZipCode: address.zipCode || null,
        addressLatitude: address.latitude || null,
        addressLongitude: address.longitude || null,

        // Servicios
        propertyAmenities: propertyAmenities || [],
        breakfastIncluded: breakfastIncluded || false,
        parkingType: parkingType || 'no',
        parkingDetails: parkingType === 'paid' ? parkingDetails : null,

        // Normas
        checkInTime: checkInTime || '14:00:00',
        checkOutTime: checkOutTime || '12:00:00',
        childrenAllowed: childrenAllowed !== undefined ? childrenAllowed : true,
        petsAllowed: petsAllowed || 'no',
        petFee: petsAllowed === 'yes_paid' ? petFee : null,
        petFeePer: petsAllowed === 'yes_paid' ? petFeePer : null,
        additionalRules: additionalRules || null,

        status: 'published',
        isActive: true,
      },
      { transaction }
    );

    // Crear las habitaciones
    const roomsData = rooms.map((room) => ({
      propertyId: property.id,
      roomType: room.roomType,
      name: room.name,
      guestCapacity: room.guestCapacity,
      beds: room.beds,
      pricePerNight: room.pricePerNight,
      amenities: room.amenities || [],
      images: room.images || [],
      isAvailable: true,
    }));

    const createdRooms = await Room.bulkCreate(roomsData, { transaction });

    // Commit de la transacción
    await transaction.commit();

    // Obtener la propiedad completa con sus habitaciones
    const propertyWithRooms = await Property.findByPk(property.id, {
      include: [
        {
          model: Room,
          as: 'rooms',
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Propiedad registrada exitosamente',
      data: propertyWithRooms,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al registrar propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar la propiedad',
      error: error.message,
    });
  }
};

/**
 * Actualizar una propiedad existente
 * PUT /api/properties/:id/full
 */
export const updatePropertyFull = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const propertyData = req.body;

    // Buscar propiedad
    const property = await Property.findByPk(id);

    if (!property) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
      });
    }

    // Verificar que sea el propietario
    if (property.hostId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta propiedad',
      });
    }

    // Actualizar propiedad
    await property.update(
      {
        accommodationType: propertyData.accommodationType,
        multipleUnits: propertyData.multipleUnits,
        hotelName: propertyData.hotelName,
        hotelCategory: propertyData.hotelCategory,
        cancellationPolicy: propertyData.cancellationPolicy,
        addressStreet: propertyData.address.street,
        addressCity: propertyData.address.city,
        addressState: propertyData.address.state,
        addressCountry: propertyData.address.country,
        addressZipCode: propertyData.address.zipCode,
        addressLatitude: propertyData.address.latitude,
        addressLongitude: propertyData.address.longitude,
        propertyAmenities: propertyData.propertyAmenities,
        breakfastIncluded: propertyData.breakfastIncluded,
        parkingType: propertyData.parkingType,
        parkingDetails: propertyData.parkingDetails,
        checkInTime: propertyData.checkInTime,
        checkOutTime: propertyData.checkOutTime,
        childrenAllowed: propertyData.childrenAllowed,
        petsAllowed: propertyData.petsAllowed,
        petFee: propertyData.petFee,
        petFeePer: propertyData.petFeePer,
        additionalRules: propertyData.additionalRules,
      },
      { transaction }
    );

    // Eliminar habitaciones anteriores
    await Room.destroy({
      where: { propertyId: id },
      transaction,
    });

    // Crear nuevas habitaciones
    if (propertyData.rooms && propertyData.rooms.length > 0) {
      const roomsData = propertyData.rooms.map((room) => ({
        propertyId: id,
        roomType: room.roomType,
        name: room.name,
        guestCapacity: room.guestCapacity,
        beds: room.beds,
        pricePerNight: room.pricePerNight,
        amenities: room.amenities || [],
        images: room.images || [],
        isAvailable: true,
      }));

      await Room.bulkCreate(roomsData, { transaction });
    }

    await transaction.commit();

    // Obtener propiedad actualizada
    const updatedProperty = await Property.findByPk(id, {
      include: [{ model: Room, as: 'rooms' }],
    });

    res.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      data: updatedProperty,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la propiedad',
      error: error.message,
    });
  }
};

/**
 * Actualizar solo la configuración de la propiedad (sin tocar las habitaciones)
 * PUT /api/properties/:id
 */
export const updatePropertyConfig = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const propertyData = req.body;

    // Buscar propiedad
    const property = await Property.findByPk(id);

    if (!property) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
      });
    }

    // Verificar que sea el propietario
    if (property.hostId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta propiedad',
      });
    }

    // Actualizar solo la configuración de la propiedad (no las habitaciones)
    await property.update(
      {
        accommodationType: propertyData.accommodationType,
        multipleUnits: propertyData.multipleUnits,
        hotelName: propertyData.hotelName,
        hotelCategory: propertyData.hotelCategory,
        cancellationPolicy: propertyData.cancellationPolicy,
        addressStreet: propertyData.address.street,
        addressCity: propertyData.address.city,
        addressState: propertyData.address.state,
        addressCountry: propertyData.address.country,
        addressZipCode: propertyData.address.zipCode,
        addressLatitude: propertyData.address.latitude,
        addressLongitude: propertyData.address.longitude,
        propertyAmenities: propertyData.propertyAmenities,
        breakfastIncluded: propertyData.breakfastIncluded,
        parkingType: propertyData.parkingType,
        parkingDetails: propertyData.parkingDetails,
        checkInTime: propertyData.checkInTime,
        checkOutTime: propertyData.checkOutTime,
        childrenAllowed: propertyData.childrenAllowed,
        petsAllowed: propertyData.petsAllowed,
        petFee: propertyData.petFee,
        petFeePer: propertyData.petFeePer,
        additionalRules: propertyData.additionalRules,
      },
      { transaction }
    );

    await transaction.commit();

    // Obtener propiedad actualizada con habitaciones
    const updatedProperty = await Property.findByPk(id, {
      include: [{ model: Room, as: 'rooms' }],
    });

    res.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      data: updatedProperty,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la propiedad',
      error: error.message,
    });
  }
};

/**
 * Obtener propiedad completa con habitaciones
 * GET /api/properties/:id/full
 */
export const getPropertyFull = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findByPk(id, {
      include: [
        {
          model: Room,
          as: 'rooms',
        },
      ],
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
      });
    }

    res.json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error('Error al obtener propiedad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la propiedad',
      error: error.message,
    });
  }
};
