import * as routingService from './routing.service.js';

// GET /api/routing/geocode?text=&focusLat=&focusLng=
export const geocode = async (req, res) => {
  try {
    const { text, focusLat, focusLng } = req.query;
    if (!text || text.trim().length < 3) {
      return res.status(400).json({ success: false, message: 'Escribe al menos 3 caracteres' });
    }

    const results = await routingService.geocode({ text, focusLat, focusLng });
    res.json({ success: true, data: { results } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/routing/directions?originLat=&originLng=&destLat=&destLng=&activityType=&alternatives=
export const getDirections = async (req, res) => {
  try {
    const { originLat, originLng, destLat, destLng, activityType, alternatives } = req.query;

    if (!originLat || !originLng || !destLat || !destLng || !activityType) {
      return res.status(400).json({ success: false, message: 'Faltan parámetros de ubicación o tipo de actividad' });
    }

    const profile = routingService.ACTIVITY_TO_PROFILE[activityType];
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Ruteo no disponible para este tipo de actividad' });
    }

    const routes = await routingService.getDirections({
      originLat: parseFloat(originLat),
      originLng: parseFloat(originLng),
      destLat: parseFloat(destLat),
      destLng: parseFloat(destLng),
      profile,
      alternatives: alternatives === 'true',
    });

    res.json({ success: true, data: { routes } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
