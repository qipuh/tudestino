import api from './api.js';

const locationsService = {
  async getCountries() {
    const response = await api.get('/locations/countries');
    return response;
  },

  async getDepartments(countryId) {
    const response = await api.get(`/locations/countries/${countryId}/departments`);
    return response;
  },

  async getProvinces(departmentId) {
    const response = await api.get(`/locations/departments/${departmentId}/provinces`);
    return response;
  },

  async getDistricts(provinceId) {
    const response = await api.get(`/locations/provinces/${provinceId}/districts`);
    return response;
  },

  async searchDistricts(query, countryId = null) {
    const params = new URLSearchParams({ q: query });
    if (countryId) params.append('countryId', countryId);
    const response = await api.get(`/locations/search?${params.toString()}`);
    return response;
  },

  async getDistrictById(districtId) {
    const response = await api.get(`/locations/districts/${districtId}`);
    return response;
  },
};

export default locationsService;
