import api from './api';

export const getKPIs = async (propertyId, startDate, endDate) => {
  const response = await api.get(`/revenue/${propertyId}/kpis`, { params: { startDate, endDate } });
  return response.data;
};
