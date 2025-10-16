import { Property, Room } from './property.model.sequelize.js';
import sequelize from '../../config/database-mysql.js';

/**
 * Agregar una habitación a una propiedad
 * POST /api/properties/:propertyId/rooms
 */
export const addRoom = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { propertyId } = req.params;
    const roomData = req.body;

    // Verificar que la propiedad existe y pertenece al usuario
    const property = await Property.findByPk(propertyId);

    if (!property) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada',
      });
    }

    if (property.hostId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para agregar habitaciones a esta propiedad',
      });
    }

    // Validar datos de la habitación
    if (!roomData.roomType || !roomData.name || !roomData.guestCapacity || !roomData.beds || !roomData.pricePerNight) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos de la habitación',
      });
    }

    if (!roomData.images || roomData.images.length < 3) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Se requieren al menos 3 fotos de la habitación',
      });
    }

    // Crear la habitación
    const room = await Room.create(
      {
        propertyId,
        roomType: roomData.roomType,
        name: roomData.name,
        guestCapacity: roomData.guestCapacity,
        beds: roomData.beds,
        pricePerNight: roomData.pricePerNight,
        amenities: roomData.amenities || [],
        images: roomData.images || [],
        isAvailable: true,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Habitación agregada exitosamente',
      data: room,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al agregar habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al agregar la habitación',
      error: error.message,
    });
  }
};

/**
 * Actualizar una habitación
 * PUT /api/properties/:propertyId/rooms/:roomId
 */
export const updateRoom = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { propertyId, roomId } = req.params;
    const roomData = req.body;

    // Buscar la habitación
    const room = await Room.findByPk(roomId, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!room) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada',
      });
    }

    // Verificar que la habitación pertenece a la propiedad
    if (room.propertyId !== propertyId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'La habitación no pertenece a esta propiedad',
      });
    }

    // Verificar que el usuario es el propietario
    if (room.property.hostId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para editar esta habitación',
      });
    }

    // Actualizar la habitación
    await room.update(
      {
        roomType: roomData.roomType,
        name: roomData.name,
        guestCapacity: roomData.guestCapacity,
        beds: roomData.beds,
        pricePerNight: roomData.pricePerNight,
        amenities: roomData.amenities,
        images: roomData.images,
        isAvailable: roomData.isAvailable !== undefined ? roomData.isAvailable : room.isAvailable,
      },
      { transaction }
    );

    await transaction.commit();

    res.json({
      success: true,
      message: 'Habitación actualizada exitosamente',
      data: room,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al actualizar habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la habitación',
      error: error.message,
    });
  }
};

/**
 * Eliminar una habitación
 * DELETE /api/properties/:propertyId/rooms/:roomId
 */
export const deleteRoom = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { propertyId, roomId } = req.params;

    // Buscar la habitación
    const room = await Room.findByPk(roomId, {
      include: [{ model: Property, as: 'property' }],
    });

    if (!room) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada',
      });
    }

    // Verificar que la habitación pertenece a la propiedad
    if (room.propertyId !== propertyId) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'La habitación no pertenece a esta propiedad',
      });
    }

    // Verificar que el usuario es el propietario
    if (room.property.hostId !== req.user.id) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta habitación',
      });
    }

    // Verificar que la propiedad tenga al menos otra habitación
    const roomCount = await Room.count({
      where: { propertyId },
      transaction,
    });

    if (roomCount <= 1) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'No puedes eliminar la única habitación de la propiedad. Una propiedad debe tener al menos una habitación.',
      });
    }

    // Eliminar la habitación
    await room.destroy({ transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Habitación eliminada exitosamente',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al eliminar habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la habitación',
      error: error.message,
    });
  }
};

/**
 * Obtener todas las habitaciones de una propiedad
 * GET /api/properties/:propertyId/rooms
 */
export const getRooms = async (req, res) => {
  try {
    const { propertyId } = req.params;

    const rooms = await Room.findAll({
      where: { propertyId },
      order: [['createdAt', 'ASC']],
    });

    res.json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error('Error al obtener habitaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las habitaciones',
      error: error.message,
    });
  }
};

/**
 * Obtener una habitación específica
 * GET /api/properties/:propertyId/rooms/:roomId
 */
export const getRoomById = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;

    const room = await Room.findOne({
      where: {
        id: roomId,
        propertyId,
      },
    });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Habitación no encontrada',
      });
    }

    res.json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error('Error al obtener habitación:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la habitación',
      error: error.message,
    });
  }
};
