import * as placesService from './places.service.js';

export const search = async (req, res) => {
  try {
    const { type, city, lat, lon, ubigeoCode, radius, limit } = req.query;
    if (!type) {
      return res.status(400).json({ success: false, message: 'Falta el parámetro "type"' });
    }
    const data = await placesService.searchPlaces({
      type,
      city,
      lat: lat ? parseFloat(lat) : undefined,
      lon: lon ? parseFloat(lon) : undefined,
      ubigeoCode,
      radius: radius ? parseInt(radius) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const importPlaces = async (req, res) => {
  try {
    const { type, places } = req.body;
    const data = await placesService.importPlaces({ type, places });
    res.json({ success: true, message: `${data.createdCount} lugares importados`, data });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
