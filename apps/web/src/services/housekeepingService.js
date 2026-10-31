import api from './api';

export const getTasks = async (propertyId, filters = {}) => {
  const response = await api.get(`/housekeeping/${propertyId}/tasks`, { params: filters });
  return response.data;
};

export const createTask = async (propertyId, { roomUnitId, taskType, assignedTo }) => {
  const response = await api.post(`/housekeeping/${propertyId}/tasks`, { roomUnitId, taskType, assignedTo });
  return response.data;
};

export const assignTask = async (taskId, assignedTo) => {
  const response = await api.patch(`/housekeeping/tasks/${taskId}/assign`, { assignedTo });
  return response.data;
};

export const updateTaskStatus = async (taskId, status, incidentNotes) => {
  const response = await api.patch(`/housekeeping/tasks/${taskId}/status`, { status, incidentNotes });
  return response.data;
};
