import * as frontDeskService from './front-desk.service.js';

export const getRoomMap = async (req, res) => {
  try {
    const data = await frontDeskService.getRoomMap(req.params.propertyId, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getArrivals = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const data = await frontDeskService.getArrivals(req.params.propertyId, date, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const getDepartures = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);
    const data = await frontDeskService.getDepartures(req.params.propertyId, date, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const checkIn = async (req, res) => {
  try {
    const { bookingId, roomUnitId, keysIssued } = req.body;
    if (!bookingId || !roomUnitId) {
      return res.status(400).json({ success: false, message: 'bookingId y roomUnitId son requeridos' });
    }
    const stay = await frontDeskService.checkIn({ bookingId, roomUnitId, keysIssued }, req.user);
    res.status(201).json({ success: true, data: stay, message: 'Check-in realizado' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const { stayId } = req.body;
    if (!stayId) {
      return res.status(400).json({ success: false, message: 'stayId es requerido' });
    }
    const stay = await frontDeskService.checkOut({ stayId }, req.user);
    res.json({ success: true, data: stay, message: 'Check-out realizado' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const changeRoom = async (req, res) => {
  try {
    const { stayId, newRoomUnitId } = req.body;
    if (!stayId || !newRoomUnitId) {
      return res.status(400).json({ success: false, message: 'stayId y newRoomUnitId son requeridos' });
    }
    const stay = await frontDeskService.changeRoom({ stayId, newRoomUnitId }, req.user);
    res.json({ success: true, data: stay, message: 'Habitación cambiada' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const setUnitStatus = async (req, res) => {
  try {
    const { operationalStatus, notes } = req.body;
    if (!['available', 'maintenance', 'blocked'].includes(operationalStatus)) {
      return res.status(400).json({ success: false, message: 'operationalStatus inválido' });
    }
    const unit = await frontDeskService.setUnitOperationalStatus(
      req.params.roomUnitId,
      operationalStatus,
      notes,
      req.user
    );
    res.json({ success: true, data: unit });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
