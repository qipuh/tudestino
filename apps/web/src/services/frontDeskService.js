import api from './api';

export const getRoomMap = async (propertyId) => {
  const response = await api.get(`/front-desk/${propertyId}/room-map`);
  return response.data;
};

export const getArrivals = async (propertyId, date) => {
  const response = await api.get(`/front-desk/${propertyId}/arrivals`, { params: { date } });
  return response.data;
};

export const getDepartures = async (propertyId, date) => {
  const response = await api.get(`/front-desk/${propertyId}/departures`, { params: { date } });
  return response.data;
};

export const checkIn = async ({ bookingId, roomUnitId, keysIssued }) => {
  const response = await api.post('/front-desk/check-in', { bookingId, roomUnitId, keysIssued });
  return response.data;
};

export const checkOut = async ({ stayId }) => {
  const response = await api.post('/front-desk/check-out', { stayId });
  return response.data;
};

export const changeRoom = async ({ stayId, newRoomUnitId }) => {
  const response = await api.post('/front-desk/change-room', { stayId, newRoomUnitId });
  return response.data;
};

export const setUnitStatus = async (roomUnitId, { operationalStatus, notes }) => {
  const response = await api.patch(`/front-desk/room-units/${roomUnitId}/status`, { operationalStatus, notes });
  return response.data;
};
