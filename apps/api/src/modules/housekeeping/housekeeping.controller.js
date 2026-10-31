import * as housekeepingService from './housekeeping.service.js';

export const getTasks = async (req, res) => {
  try {
    const { status, assignedTo } = req.query;
    const data = await housekeepingService.getTasks(req.params.propertyId, { status, assignedTo }, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { roomUnitId, taskType, assignedTo } = req.body;
    if (!roomUnitId || !taskType) {
      return res.status(400).json({ success: false, message: 'roomUnitId y taskType son requeridos' });
    }
    const task = await housekeepingService.createTask({ roomUnitId, taskType, assignedTo }, req.user);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const assignTask = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) {
      return res.status(400).json({ success: false, message: 'assignedTo es requerido' });
    }
    const task = await housekeepingService.assignTask(req.params.id, assignedTo, req.user);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status, incidentNotes } = req.body;
    if (!['pending', 'in_progress', 'done', 'flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status inválido' });
    }
    const task = await housekeepingService.updateTaskStatus(req.params.id, status, incidentNotes, req.user);
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message });
  }
};
