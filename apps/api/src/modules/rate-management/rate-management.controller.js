import * as rateManagementService from './rate-management.service.js';

export const createRateRule = async (req, res) => {
  try {
    const rule = await rateManagementService.createRateRule(req.params.roomId, req.body, req.user);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const listRateRules = async (req, res) => {
  try {
    const rules = await rateManagementService.listRateRules(req.params.roomId, req.user);
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const updateRateRule = async (req, res) => {
  try {
    const rule = await rateManagementService.updateRateRule(req.params.id, req.body, req.user);
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const deleteRateRule = async (req, res) => {
  try {
    await rateManagementService.deleteRateRule(req.params.id, req.user);
    res.json({ success: true, message: 'Regla eliminada' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const quotePrice = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.query;
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'roomId, checkIn y checkOut son requeridos' });
    }
    const quote = await rateManagementService.quotePrice({ roomId, checkIn, checkOut });
    res.json({ success: true, data: quote });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
