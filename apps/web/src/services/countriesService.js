import api from './api';

const countriesService = {
  /**
   * Obtiene la lista de todos los países
   */
  async getAll() {
    try {
      console.log('🌍 Calling API: GET /countries');
      const response = await api.get('/countries');
      console.log('✅ API Response:', response);
      return response; // Returns { success: true, data: [...] }
    } catch (error) {
      console.error('❌ Error fetching countries:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Obtiene un país por su código
   */
  async getByCode(code) {
    try {
      const response = await api.get(`/countries/${code}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching country ${code}:`, error);
      return null;
    }
  },

  /**
   * Detecta el país del usuario por IP
   */
  async detectByIP() {
    try {
      const response = await api.get('/countries/detect-by-ip');
      return response.data; // Returns { success: true, data: {...} }
    } catch (error) {
      console.error('Error detecting country:', error);
      // Default a Perú si falla
      return {
        success: true,
        data: { code: 'PE', phone_code: '+51' }
      };
    }
  },

  /**
   * Formatea el número de teléfono con el código de país
   */
  formatPhone(countryCode, phone) {
    return `${countryCode}${phone}`;
  },

  /**
   * Obtiene los tipos de documento válidos para un país
   */
  getDocumentTypes(country) {
    return country?.document_types || ['Pasaporte', 'DNI'];
  }
};

export default countriesService;
