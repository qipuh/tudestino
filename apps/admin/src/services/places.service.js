import api from './api';

export const placesService = {
  search: async ({ type, city, lat, lon, ubigeoCode, radius, limit }) => {
    const response = await api.get('/places/search', {
      params: { type, city, lat, lon, ubigeoCode, radius, limit },
    });
    return response.data;
  },

  importPlaces: async ({ type, places }) => {
    const response = await api.post('/places/import', { type, places });
    return response.data;
  },
};
