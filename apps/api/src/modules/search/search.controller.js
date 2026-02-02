import { Op } from 'sequelize';
import { Property, Room } from '../properties/hotel-property.model.js';
import User from '../users/user.model-mysql.js';
import Business from '../businesses/business.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Event from '../events/event.model.js';
import Entertainment from '../entertainment/entertainment.model.js';

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

export const searchBusinesses = async (req, res) => {
  try {
    const {
      location,
      category,
      minRating,
      limit = 20,
      page = 1
    } = req.query;

    const whereConditions = {
      status: 'active'
    };

    if (category && category !== 'all') {
      whereConditions.businessType = category;
    }

    if (minRating) {
      whereConditions.ratingAverage = { [Op.gte]: parseFloat(minRating) };
    }

    // Filtro por ubicación básica (búsqueda en campos JSON podría ser compleja dependiendo del dialecto)
    // Por simplicidad si se proporciona location intentaremos buscar coincidencias si el dialecto lo permite
    // o omitimos por ahora si no es crítico para la carga inicial

    // Configurar paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: businesses } = await Business.findAndCountAll({
      where: whereConditions,
      limit: limitNum,
      offset,
      order: [['ratingAverage', 'DESC'], ['reviewCount', 'DESC']]
    });

    const results = businesses.map(b => {
      const data = b.toJSON();
      // Mapear tipos de negocio a rutas
      let typeUrl = 'businesses';
      if (data.businessType === 'hotel') typeUrl = 'properties';
      else if (data.businessType === 'restaurant') typeUrl = 'restaurants';
      else if (data.businessType === 'event') typeUrl = 'events';
      else if (data.businessType === 'entertainment') typeUrl = 'entertainment';

      return {
        id: data.id,
        type: data.businessType,
        name: data.name,
        description: data.description,
        image: data.coverImage || data.logo,
        location: data.address, // Assumes address is { city, country, ... }
        rating: data.ratingAverage,
        reviewCount: data.reviewCount,
        price: null,
        url: `/${typeUrl}/${data.slug || data.id}`
      };
    });

    res.json({
      success: true,
      data: {
        results,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages: Math.ceil(count / limitNum)
        }
      }
    });

  } catch (error) {
    console.error('Error in searchBusinesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar negocios',
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

    // Construir condiciones WHERE
    const whereConditions = {
      status: 'published'
    };

    // Filtro por ubicación (ciudad o país)
    if (location) {
      // Dividir la ubicación por coma para manejar "Ciudad, País"
      const locationParts = location.split(',').map(part => part.trim());

      if (locationParts.length > 1) {
        // Si tiene formato "Ciudad, País", buscar coincidencia en ambos campos
        whereConditions[Op.and] = [
          {
            [Op.or]: [
              { addressCity: { [Op.like]: `%${locationParts[0]}%` } },
              { addressState: { [Op.like]: `%${locationParts[0]}%` } }
            ]
          },
          {
            [Op.or]: [
              { addressCountry: { [Op.like]: `%${locationParts[1]}%` } },
              { addressState: { [Op.like]: `%${locationParts[1]}%` } }
            ]
          }
        ];
      } else {
        // Búsqueda simple en cualquier campo
        whereConditions[Op.or] = [
          { addressCity: { [Op.like]: `%${location}%` } },
          { addressCountry: { [Op.like]: `%${location}%` } },
          { addressState: { [Op.like]: `%${location}%` } }
        ];
      }
    }

    // Filtro por número de huéspedes
    // NOTA: Ya no filtramos por guests aquí porque ahora la capacidad está en la tabla rooms
    // TODO: Implementar join con rooms para filtrar por capacidad total
    const totalGuests = (parseInt(adults) || 0) + (parseInt(children) || 0);
    // if (totalGuests > 0) {
    //   whereConditions.guests = { [Op.gte]: totalGuests };
    // }

    // Filtro por rango de precio
    // NOTA: Ya no filtramos por basePrice aquí porque ahora el precio está en la tabla rooms
    // TODO: Implementar join con rooms para filtrar por rango de precio
    // if (minPrice) {
    //   whereConditions.basePrice = { [Op.gte]: parseFloat(minPrice) };
    // }
    // if (maxPrice) {
    //   if (whereConditions.basePrice) {
    //     whereConditions.basePrice[Op.lte] = parseFloat(maxPrice);
    //   } else {
    //     whereConditions.basePrice = { [Op.lte]: parseFloat(maxPrice) };
    //   }
    // }

    // Filtro por tipo de propiedad (ahora es accommodationType)
    if (propertyType) {
      whereConditions.accommodationType = propertyType;
    }

    // Filtro por rating mínimo
    if (minRating) {
      whereConditions.ratingAverage = { [Op.gte]: parseFloat(minRating) };
    }

    // Filtro por amenidades (verificar que tenga TODAS las amenidades solicitadas)
    // TODO: Implementar cuando amenities sea un campo JSON en la BD
    // if (amenities) {
    //   const amenitiesList = Array.isArray(amenities) ? amenities : [amenities];
    //   whereConditions.amenities = { [Op.contains]: amenitiesList };
    // }

    // Configurar paginación
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Configurar ordenamiento
    let order = [];
    switch (sortBy) {
      case 'price_asc':
        // TODO: Implementar ordenamiento por precio de rooms
        order = [['createdAt', 'DESC']];
        break;
      case 'price_desc':
        // TODO: Implementar ordenamiento por precio de rooms
        order = [['createdAt', 'DESC']];
        break;
      case 'rating':
        order = [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']];
        break;
      case 'newest':
        order = [['createdAt', 'DESC']];
        break;
      default:
        // Relevancia: combinar rating y cantidad de reviews
        order = [['ratingAverage', 'DESC'], ['ratingCount', 'DESC']];
    }

    // Buscar propiedades
    const { count, rows: properties } = await Property.findAndCountAll({
      where: whereConditions,
      attributes: [
        'id', 'hostId', 'accommodationType', 'multipleUnits', 'hotelName', 'hotelCategory',
        'propertyName', 'description', 'cancellationPolicy',
        'addressStreet', 'addressCity', 'addressState', 'addressCountry', 'addressZipCode',
        'addressLatitude', 'addressLongitude',
        'propertyAmenities', 'breakfastIncluded', 'parkingType', 'parkingDetails',
        'checkInTime', 'checkOutTime', 'childrenAllowed', 'petsAllowed', 'petFee', 'petFeePer',
        'additionalRules', 'status', 'ratingAverage', 'ratingCount', 'isActive',
        'createdAt', 'updatedAt'
      ],
      include: [
        {
          model: User,
          as: 'host',
          attributes: ['id', 'name', 'email', 'avatar', 'bio', 'phone']
        },
        {
          model: Room,
          as: 'rooms',
          attributes: ['id', 'roomType', 'name', 'quantity', 'guestCapacity', 'beds', 'pricePerNight', 'amenities', 'view', 'mealPlan', 'description', 'images', 'isAvailable']
        }
      ],
      order,
      limit: limitNum,
      offset,
      distinct: true
    });

    // Si hay coordenadas, calcular distancia y reordenar si es necesario
    let propertiesWithDistance = properties;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      // Calcular distancia para cada propiedad usando fórmula Haversine
      propertiesWithDistance = properties.map(property => {
        const propData = property.toJSON();
        const distance = calculateDistance(
          lat,
          lng,
          property.latitude,
          property.longitude
        );
        return {
          ...propData,
          distance: Math.round(distance * 10) / 10 // Redondear a 1 decimal
        };
      });

      // Filtrar por radio SOLO si se especificó explícitamente
      if (radius) {
        const radiusKm = parseInt(radius);
        propertiesWithDistance = propertiesWithDistance.filter(
          p => p.distance <= radiusKm
        );
      }

      // Si sortBy es 'distance', ordenar por distancia
      if (sortBy === 'distance') {
        propertiesWithDistance.sort((a, b) => a.distance - b.distance);
      }
    }

    // Calcular paginación
    const totalPages = Math.ceil(count / limitNum);

    res.json({
      success: true,
      data: {
        properties: propertiesWithDistance,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          totalPages
        },
        filters: {
          location,
          coordinates: latitude && longitude ? { latitude, longitude, radius: radius || 50 } : null,
          guests: totalGuests || null,
          priceRange: { min: minPrice || null, max: maxPrice || null },
          propertyType: propertyType || null,
          minRating: minRating || null,
          sortBy: sortBy || 'relevance'
        }
      }
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

// Función para calcular distancia entre dos puntos (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

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

// GET /api/search/all - Búsqueda unificada de todos los tipos de negocios
export const searchAll = async (req, res) => {
  try {
    const {
      location,
      latitude,
      longitude,
      radius = 50,
      category,  // hotel, restaurant, event, entertainment, all
      minRating,
      sortBy = 'relevance',
      page = 1,
      limit = 20
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let results = [];
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    // Construir condiciones de ubicación reutilizables
    const buildLocationConditions = (cityField = 'addressCity', countryField = 'addressCountry', stateField = 'addressState') => {
      if (!location) return {};

      const locationParts = location.split(',').map(part => part.trim());

      if (locationParts.length > 1) {
        return {
          [Op.and]: [
            {
              [Op.or]: [
                { [cityField]: { [Op.like]: `%${locationParts[0]}%` } },
                stateField ? { [stateField]: { [Op.like]: `%${locationParts[0]}%` } } : null
              ].filter(Boolean)
            },
            {
              [Op.or]: [
                { [countryField]: { [Op.like]: `%${locationParts[1]}%` } },
                stateField ? { [stateField]: { [Op.like]: `%${locationParts[1]}%` } } : null
              ].filter(Boolean)
            }
          ]
        };
      }

      return {
        [Op.or]: [
          { [cityField]: { [Op.like]: `%${location}%` } },
          { [countryField]: { [Op.like]: `%${location}%` } },
          stateField ? { [stateField]: { [Op.like]: `%${location}%` } } : null
        ].filter(Boolean)
      };
    };

    // Buscar en Properties (Hoteles/Alojamientos) si category es 'hotel', 'property', 'all' o no está definido
    if (!category || category === 'all' || category === 'hotel' || category === 'property') {
      const propertyWhere = {
        status: 'published',
        ...buildLocationConditions()
      };

      if (minRating) {
        propertyWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
      }

      const properties = await Property.findAll({
        where: propertyWhere,
        include: [
          {
            model: User,
            as: 'host',
            attributes: ['id', 'name', 'email']
          },
          {
            model: Room,
            as: 'rooms',
            attributes: ['id', 'roomType', 'name', 'pricePerNight', 'images', 'guestCapacity'],
            limit: 1
          }
        ],
        limit: limitNum,
        offset
      });

      results = results.concat(properties.map(p => {
        const data = p.toJSON();
        let distance = null;

        if (lat && lng && data.addressLatitude && data.addressLongitude) {
          distance = calculateDistance(lat, lng, parseFloat(data.addressLatitude), parseFloat(data.addressLongitude));
        }

        return {
          id: data.id,
          type: 'property',
          name: data.propertyName || data.hotelName || `${data.accommodationType} en ${data.addressCity}`,
          description: data.description,
          image: data.rooms?.[0]?.images?.[0] || null,
          location: {
            city: data.addressCity,
            state: data.addressState,
            country: data.addressCountry,
            latitude: data.addressLatitude,
            longitude: data.addressLongitude
          },
          rating: data.ratingAverage || 0,
          reviewCount: data.ratingCount || 0,
          price: data.rooms?.[0]?.pricePerNight || null,
          priceLabel: 'noche',
          distance: distance ? Math.round(distance * 10) / 10 : null,
          url: `/properties/${data.id}`
        };
      }));
    }

    // Buscar en Restaurants desde businesses table
    if (!category || category === 'all' || category === 'restaurant') {
      try {
        const restaurantWhere = {
          status: 'active',
          isActive: true,
          businessType: 'restaurant'
        };

        if (minRating) {
          restaurantWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
        }

        const restaurants = await Business.findAll({
          where: restaurantWhere,
          limit: limitNum,
          offset
        });

        results = results.concat(restaurants.map(r => {
          const data = r.toJSON();
          const addressData = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
          let distance = null;

          if (lat && lng && addressData?.latitude && addressData?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(addressData.latitude), parseFloat(addressData.longitude));
          }

          return {
            id: data.id,
            type: 'restaurant',
            name: data.name,
            description: data.description,
            image: data.logo || data.coverImage,
            location: {
              city: addressData?.city,
              state: addressData?.state,
              country: addressData?.country,
              latitude: addressData?.latitude,
              longitude: addressData?.longitude
            },
            rating: data.ratingAverage || 0,
            reviewCount: data.reviewCount || 0,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/businesses/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching restaurants:', error.message);
      }
    }

    // Buscar en Events (solo si las tablas existen y están sincronizadas)
    if (!category || category === 'all' || category === 'event') {
      try {
        const eventWhere = {
          status: 'active',
          ...buildLocationConditions('city', 'country', 'state')
        };

        // Solo eventos futuros
        eventWhere.eventDate = { [Op.gte]: new Date() };

        const events = await Event.findAll({
          where: eventWhere,
          limit: limitNum,
          offset,
          order: [['eventDate', 'ASC']]
        });

        results = results.concat(events.map(e => {
          const data = e.toJSON();
          const addressData = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
          let distance = null;

          if (lat && lng && addressData?.latitude && addressData?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(addressData.latitude), parseFloat(addressData.longitude));
          }

          return {
            id: data.id,
            type: 'event',
            name: data.name,
            description: data.description,
            image: data.images && data.images.length > 0 ? data.images[0] : null,
            location: {
              city: addressData?.city || data.city,
              state: addressData?.state,
              country: addressData?.country,
              latitude: addressData?.latitude,
              longitude: addressData?.longitude
            },
            category: data.category,
            eventDate: data.eventDate,
            startTime: data.startTime,
            endTime: data.endTime,
            isFree: data.isFree,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/events/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching events:', error.message);
      }
    }

    // Buscar en Entertainment desde businesses table
    if (!category || category === 'all' || category === 'entertainment') {
      try {
        const entertainmentWhere = {
          status: 'active',
          isActive: true,
          businessType: 'entertainment'
        };

        if (minRating) {
          entertainmentWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
        }

        const entertainment = await Business.findAll({
          where: entertainmentWhere,
          limit: limitNum,
          offset
        });

        results = results.concat(entertainment.map(e => {
          const data = e.toJSON();
          const addressData = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
          let distance = null;

          if (lat && lng && addressData?.latitude && addressData?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(addressData.latitude), parseFloat(addressData.longitude));
          }

          return {
            id: data.id,
            type: 'entertainment',
            name: data.name,
            description: data.description,
            image: data.logo || data.coverImage,
            location: {
              city: addressData?.city,
              state: addressData?.state,
              country: addressData?.country,
              latitude: addressData?.latitude,
              longitude: addressData?.longitude
            },
            rating: data.ratingAverage || 0,
            reviewCount: data.reviewCount || 0,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/businesses/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching entertainment:', error.message);
      }
    }

    // Buscar en Spa desde businesses table
    if (!category || category === 'all' || category === 'spa') {
      try {
        const spaWhere = {
          status: 'active',
          isActive: true,
          businessType: 'spa'
        };

        if (minRating) {
          spaWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
        }

        const spas = await Business.findAll({
          where: spaWhere,
          limit: limitNum,
          offset
        });

        results = results.concat(spas.map(s => {
          const data = s.toJSON();
          const addressData = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
          let distance = null;

          if (lat && lng && addressData?.latitude && addressData?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(addressData.latitude), parseFloat(addressData.longitude));
          }

          return {
            id: data.id,
            type: 'spa',
            name: data.name,
            description: data.description,
            image: data.logo || data.coverImage,
            location: {
              city: addressData?.city,
              state: addressData?.state,
              country: addressData?.country,
              latitude: addressData?.latitude,
              longitude: addressData?.longitude
            },
            rating: data.ratingAverage || 0,
            reviewCount: data.reviewCount || 0,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/businesses/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching spa:', error.message);
      }
    }

    // Buscar en Tours desde businesses table
    if (!category || category === 'all' || category === 'tours') {
      try {
        const toursWhere = {
          status: 'active',
          isActive: true,
          businessType: 'tours'
        };

        if (minRating) {
          toursWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
        }

        const toursBusinesses = await Business.findAll({
          where: toursWhere,
          limit: limitNum,
          offset
        });

        results = results.concat(toursBusinesses.map(t => {
          const data = t.toJSON();
          const addressData = typeof data.address === 'string' ? JSON.parse(data.address) : data.address;
          let distance = null;

          if (lat && lng && addressData?.latitude && addressData?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(addressData.latitude), parseFloat(addressData.longitude));
          }

          return {
            id: data.id,
            type: 'tours',
            name: data.name,
            description: data.description,
            image: data.logo || data.coverImage,
            location: {
              city: addressData?.city,
              state: addressData?.state,
              country: addressData?.country,
              latitude: addressData?.latitude,
              longitude: addressData?.longitude
            },
            rating: data.ratingAverage || 0,
            reviewCount: data.reviewCount || 0,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/businesses/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching tours businesses:', error.message);
      }
    }

    // Also search legacy Entertainment table if it exists
    if (!category || category === 'all' || category === 'entertainment') {
      try {
        const legacyEntertainmentWhere = {
          status: 'active'
        };

        if (minRating) {
          legacyEntertainmentWhere.ratingAverage = { [Op.gte]: parseFloat(minRating) };
        }

        const legacyEntertainment = await Entertainment.findAll({
          where: legacyEntertainmentWhere,
          limit: limitNum,
          offset
        });

        results = results.concat(legacyEntertainment.map(e => {
          const data = e.toJSON();
          let distance = null;

          if (lat && lng && data.address?.latitude && data.address?.longitude) {
            distance = calculateDistance(lat, lng, parseFloat(data.address.latitude), parseFloat(data.address.longitude));
          }

          return {
            id: data.id,
            type: 'entertainment',
            subType: data.type,
            name: data.name,
            description: data.description,
            image: data.images && data.images.length > 0 ? data.images[0] : null,
            location: data.location,
            address: data.address,
            rating: data.ratingAverage || 0,
            reviewCount: data.reviewCount || 0,
            priceRange: data.priceRange,
            category: data.category,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            url: `/entertainment/${data.id}`
          };
        }));
      } catch (error) {
        console.error('Error fetching legacy entertainment:', error.message);
      }
    }

    // Filtrar por radio si se proporcionaron coordenadas
    if (lat && lng && radius) {
      const radiusKm = parseInt(radius);
      results = results.filter(item => !item.distance || item.distance <= radiusKm);
    }

    // Ordenar resultados
    switch (sortBy) {
      case 'distance':
        results.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
        break;
      case 'rating':
        results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'relevance':
        // Ordenar por rating y número de reviews
        results.sort((a, b) => {
          const scoreA = (a.rating || 0) * (a.reviewCount || 1);
          const scoreB = (b.rating || 0) * (b.reviewCount || 1);
          return scoreB - scoreA;
        });
        break;
      case 'random':
      default:
        // Ordenamiento aleatorio (shuffle)
        // Algoritmo Fisher-Yates para mezclar array aleatoriamente
        for (let i = results.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [results[i], results[j]] = [results[j], results[i]];
        }
    }

    // Aplicar paginación a resultados combinados
    const totalResults = results.length;
    const paginatedResults = results.slice(0, limitNum);

    res.json({
      success: true,
      data: {
        results: paginatedResults,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalResults,
          totalPages: Math.ceil(totalResults / limitNum)
        },
        filters: {
          location,
          coordinates: lat && lng ? { latitude: lat, longitude: lng, radius: parseInt(radius) } : null,
          category: category || 'all',
          minRating: minRating || null,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Error in searchAll:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar',
      error: error.message
    });
  }
};
