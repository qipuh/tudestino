// Servicio para obtener ubicación por IP
const getLocationByIP = async (ip) => {
  try {
    // Usar ip-api.com (gratuito, 45 req/min)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone`);
    const data = await response.json();

    if (data.status === 'success') {
      return {
        country: data.country,
        countryCode: data.countryCode,
        region: data.regionName,
        city: data.city,
        latitude: data.lat,
        longitude: data.lon,
        timezone: data.timezone
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching location by IP:', error);
    return null;
  }
};

// GET /api/search/location - Obtener ubicación por IP
export const getLocation = async (req, res) => {
  try {
    // Obtener IP real del cliente
    const clientIP = req.headers['x-forwarded-for']?.split(',')[0] ||
                     req.headers['x-real-ip'] ||
                     req.connection.remoteAddress ||
                     req.socket.remoteAddress;

    // En desarrollo local, usar IP pública (ejemplo con Perú)
    const ip = clientIP === '::1' || clientIP === '127.0.0.1'
      ? '' // Dejar vacío para que ip-api use la IP pública del servidor
      : clientIP;

    const location = await getLocationByIP(ip);

    if (location) {
      res.json({
        success: true,
        data: location,
        ip: clientIP
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'No se pudo determinar la ubicación'
      });
    }
  } catch (error) {
    console.error('Error in getLocation:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener ubicación',
      error: error.message
    });
  }
};

// GET /api/search/properties - Búsqueda avanzada de propiedades
export const searchProperties = async (req, res) => {
  try {
    const {
      location,      // ciudad o país
      latitude,      // coordenadas para búsqueda cercana
      longitude,
      radius,        // radio en km (default: 50)
      checkIn,       // fecha de entrada
      checkOut,      // fecha de salida
      adults,        // número de adultos
      children,      // número de niños
      minPrice,
      maxPrice,
      propertyType,  // apartment, house, villa, etc.
      amenities,     // array de amenidades
      minRating,     // rating mínimo
      sortBy,        // price, rating, distance
      page,
      limit
    } = req.query;

    // TODO: Implementar con Sequelize/Mongoose según tu modelo
    // Por ahora retornamos estructura de ejemplo

    const filters = {};
    const searchParams = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'relevance'
    };

    // Construir query de búsqueda
    if (location) {
      // Buscar por ciudad o país
      filters.location = location;
    }

    if (latitude && longitude) {
      // Búsqueda por proximidad geográfica
      filters.coordinates = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius: parseInt(radius) || 50 // km
      };
    }

    if (adults || children) {
      filters.guests = {
        adults: parseInt(adults) || 0,
        children: parseInt(children) || 0,
        total: (parseInt(adults) || 0) + (parseInt(children) || 0)
      };
    }

    if (minPrice || maxPrice) {
      filters.price = {
        min: parseFloat(minPrice) || 0,
        max: parseFloat(maxPrice) || Infinity
      };
    }

    if (propertyType) {
      filters.type = propertyType;
    }

    if (amenities) {
      filters.amenities = Array.isArray(amenities) ? amenities : [amenities];
    }

    if (minRating) {
      filters.minRating = parseFloat(minRating);
    }

    if (checkIn && checkOut) {
      filters.availability = {
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut)
      };
    }

    // Placeholder response
    res.json({
      success: true,
      data: {
        properties: [],
        filters: filters,
        searchParams: searchParams,
        pagination: {
          page: searchParams.page,
          limit: searchParams.limit,
          total: 0,
          totalPages: 0
        }
      },
      message: 'Búsqueda implementada - conectar con base de datos'
    });

  } catch (error) {
    console.error('Error in searchProperties:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar propiedades',
      error: error.message
    });
  }
};

// GET /api/search/suggestions - Autocompletado de ubicaciones
export const getLocationSuggestions = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    // TODO: Implementar búsqueda de ubicaciones en tu BD
    // Buscar ciudades/países que coincidan con el query

    const suggestions = [];

    res.json({
      success: true,
      data: suggestions
    });

  } catch (error) {
    console.error('Error in getLocationSuggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener sugerencias',
      error: error.message
    });
  }
};
