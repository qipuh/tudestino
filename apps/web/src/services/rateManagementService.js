import api from './api';

export const listRateRules = async (roomId) => {
  const response = await api.get(`/rate-management/rooms/${roomId}/rules`);
  return response.data;
};

export const createRateRule = async (roomId, data) => {
  const response = await api.post(`/rate-management/rooms/${roomId}/rules`, data);
  return response.data;
};

export const updateRateRule = async (id, data) => {
  const response = await api.put(`/rate-management/rules/${id}`, data);
  return response.data;
};

export const deleteRateRule = async (id) => {
  await api.delete(`/rate-management/rules/${id}`);
};

export const quotePrice = async ({ roomId, checkIn, checkOut }) => {
  const response = await api.get('/rate-management/quote', { params: { roomId, checkIn, checkOut } });
  return response.data;
};
