import { Op } from 'sequelize';
import { Property, Room } from './hotel-property.model.js';
import RoomUnit from './room-unit.model.js';
import sequelize from '../../config/database-mysql.js';

// Resuelve room + property y valida que el usuario sea dueño de la
// propiedad. Lanza un error con .status para que el caller responda.
const loadOwnedRoom = async (propertyId, roomId, user) => {
  const room = await Room.findOne({
    where: { id: roomId, propertyId },
    include: [{ model: Property, as: 'property' }],
  });

  if (!room) {
    const err = new Error('Habitación no encontrada');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'admin' && room.property.hostId !== user.id) {
    const err = new Error('No tienes permiso sobre esta habitación');
    err.status = 403;
    throw err;
  }

  return room;
};

/**
 * Crear una unidad física (ej. "204") para un tipo de habitación
 * POST /api/properties/:propertyId/rooms/:roomId/units
 */
export const createRoomUnit = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const { unitNumber, floor, notes } = req.body;

    if (!unitNumber) {
      return res.status(400).json({ success: false, message: 'unitNumber es requerido' });
    }

    await loadOwnedRoom(propertyId, roomId, req.user);

    const unit = await RoomUnit.create({ roomId, unitNumber, floor, notes });

    res.status(201).json({ success: true, data: unit });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/**
 * Crear varias unidades físicas de una vez, ya sea con una lista explícita
 * o con un rango numérico (útil para "204 al 210" o "10 habitaciones desde
 * la 301").
 * POST /api/properties/:propertyId/rooms/:roomId/units/bulk
 * Body: { units: [{unitNumber, floor, notes}, ...] }
 *   o:  { range: { startNumber, count, floor, prefix } }
 */
export const bulkCreateRoomUnits = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;
    const { units, range } = req.body;

    await loadOwnedRoom(propertyId, roomId, req.user);

    let unitsToCreate = [];

    if (Array.isArray(units) && units.length > 0) {
      unitsToCreate = units.map((u) => ({
        unitNumber: String(u.unitNumber),
        floor: u.floor ?? null,
        notes: u.notes ?? null,
      }));
    } else if (range && range.startNumber != null && range.count > 0) {
      const { startNumber, count, floor, prefix } = range;
      if (count > 200) {
        return res.status(400).json({ success: false, message: 'No puedes crear más de 200 unidades a la vez' });
      }
      unitsToCreate = Array.from({ length: count }, (_, i) => ({
        unitNumber: `${prefix || ''}${Number(startNumber) + i}`,
        floor: floor ?? null,
        notes: null,
      }));
    } else {
      return res.status(400).json({
        success: false,
        message: 'Debes enviar "units" (lista) o "range" ({ startNumber, count })',
      });
    }

    const numbers = unitsToCreate.map((u) => u.unitNumber);
    const uniqueNumbers = new Set(numbers);
    if (uniqueNumbers.size !== numbers.length) {
      return res.status(400).json({ success: false, message: 'Hay números de habitación repetidos en la solicitud' });
    }

    const existing = await RoomUnit.findAll({
      where: { roomId, unitNumber: { [Op.in]: numbers } },
      attributes: ['unitNumber'],
    });

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Algunos números de habitación ya existen para este tipo',
        conflicts: existing.map((u) => u.unitNumber),
      });
    }

    const transaction = await sequelize.transaction();
    try {
      const created = await RoomUnit.bulkCreate(
        unitsToCreate.map((u) => ({ ...u, roomId })),
        { transaction }
      );
      await transaction.commit();
      res.status(201).json({ success: true, data: created });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/**
 * Listar unidades físicas de un tipo de habitación
 * GET /api/properties/:propertyId/rooms/:roomId/units
 */
export const getRoomUnits = async (req, res) => {
  try {
    const { propertyId, roomId } = req.params;

    const room = await Room.findOne({ where: { id: roomId, propertyId } });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Habitación no encontrada' });
    }

    const units = await RoomUnit.findAll({
      where: { roomId },
      order: [['unitNumber', 'ASC']],
    });

    res.json({ success: true, data: units });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Actualizar una unidad física (número, piso, notas, bloqueo)
 * PUT /api/properties/:propertyId/rooms/:roomId/units/:unitId
 */
export const updateRoomUnit = async (req, res) => {
  try {
    const { propertyId, roomId, unitId } = req.params;
    const { unitNumber, floor, notes, operationalStatus } = req.body;

    await loadOwnedRoom(propertyId, roomId, req.user);

    const unit = await RoomUnit.findOne({ where: { id: unitId, roomId } });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unidad no encontrada' });
    }

    if (operationalStatus === 'occupied') {
      return res.status(400).json({
        success: false,
        message: 'operationalStatus "occupied" solo lo asigna front-desk vía check-in',
      });
    }

    await unit.update({
      unitNumber: unitNumber ?? unit.unitNumber,
      floor: floor ?? unit.floor,
      notes: notes ?? unit.notes,
      operationalStatus: operationalStatus ?? unit.operationalStatus,
    });

    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

/**
 * Eliminar una unidad física
 * DELETE /api/properties/:propertyId/rooms/:roomId/units/:unitId
 */
export const deleteRoomUnit = async (req, res) => {
  try {
    const { propertyId, roomId, unitId } = req.params;

    await loadOwnedRoom(propertyId, roomId, req.user);

    const unit = await RoomUnit.findOne({ where: { id: unitId, roomId } });
    if (!unit) {
      return res.status(404).json({ success: false, message: 'Unidad no encontrada' });
    }

    if (unit.operationalStatus === 'occupied') {
      return res.status(400).json({ success: false, message: 'No puedes eliminar una unidad ocupada' });
    }

    await unit.destroy();

    res.json({ success: true, message: 'Unidad eliminada' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
