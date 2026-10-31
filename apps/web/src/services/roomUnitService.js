import api from './api';

export const getRoomUnits = async (propertyId, roomId) => {
  const response = await api.get(`/properties/${propertyId}/rooms/${roomId}/units`);
  return response.data;
};

export const bulkCreateRoomUnits = async (propertyId, roomId, payload) => {
  const response = await api.post(`/properties/${propertyId}/rooms/${roomId}/units/bulk`, payload);
  return response.data;
};

export const createRoomUnit = async (propertyId, roomId, unitData) => {
  const response = await api.post(`/properties/${propertyId}/rooms/${roomId}/units`, unitData);
  return response.data;
};

export const updateRoomUnit = async (propertyId, roomId, unitId, unitData) => {
  const response = await api.put(`/properties/${propertyId}/rooms/${roomId}/units/${unitId}`, unitData);
  return response.data;
};

export const deleteRoomUnit = async (propertyId, roomId, unitId) => {
  await api.delete(`/properties/${propertyId}/rooms/${roomId}/units/${unitId}`);
};
