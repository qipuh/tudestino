import Country from './country.model.js';

class CountriesController {
  async getAll(req, res) {
    try {
      const countries = await Country.findAll({
        where: { active: true },
        order: [['name', 'ASC']],
        attributes: ['id', 'code', 'name', 'native_name', 'phone_code', 'flag_emoji', 'currency_code', 'document_types'],
      });

      console.log('📍 Countries found:', countries.length);

      res.json({
        success: true,
        data: countries,
      });
    } catch (error) {
      console.error('❌ Error fetching countries:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener países',
        details: error.message,
      });
    }
  }

  async getByCode(req, res) {
    try {
      const { code } = req.params;
      const country = await Country.findOne({
        where: { code: code.toUpperCase(), active: true },
      });

      if (!country) {
        return res.status(404).json({
          success: false,
          error: 'País no encontrado',
        });
      }

      res.json({
        success: true,
        data: country,
      });
    } catch (error) {
      console.error('Error fetching country:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener país',
      });
    }
  }

  async detectCountryByIP(req, res) {
    try {
      // Obtener IP del request
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      // Por defecto, devolver Perú (código PE)
      // TODO: Integrar con servicio de geolocalización (ipapi.co, ipgeolocation.io, etc.)
      const defaultCountry = await Country.findOne({
        where: { code: 'PE', active: true },
      });

      res.json({
        success: true,
        data: defaultCountry,
        detected_ip: ip,
        message: 'Detección de IP simulada. País por defecto: Perú',
      });
    } catch (error) {
      console.error('Error detecting country:', error);
      res.status(500).json({
        success: false,
        error: 'Error al detectar país',
      });
    }
  }
}

export default new CountriesController();
