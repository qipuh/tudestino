import * as settingsService from '../settings/settings.service.js';

const BASE_URL = 'https://api.geoapify.com/v2/places';

// categories: https://apidocs.geoapify.com/docs/places/#categories
const CATEGORY_BY_TYPE = {
  hotel: 'accommodation.hotel',
  restaurant: 'catering.restaurant',
};

/**
 * Busca lugares por categoría dentro de un radio (metros) alrededor de un
 * punto lat/lon. Devuelve resultados normalizados al shape común usado por
 * places.service.js para mergear con Foursquare.
 */
export const searchGeoapify = async ({ type, lat, lon, radius = 5000, limit = 20 }) => {
  const { geoapifyApiKey } = await settingsService.getPlacesConfig();
  if (!geoapifyApiKey) {
    throw new Error('Geoapify no está configurado. Agrega la API key en Configuración > Lugares.');
  }

  const category = CATEGORY_BY_TYPE[type];
  if (!category) throw new Error(`Tipo de lugar no soportado: ${type}`);

  const url = new URL(BASE_URL);
  url.searchParams.set('categories', category);
  url.searchParams.set('filter', `circle:${lon},${lat},${radius}`);
  url.searchParams.set('bias', `proximity:${lon},${lat}`);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('apiKey', geoapifyApiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Geoapify respondió ${response.status}: ${body.slice(0, 200)}`);
  }
  const json = await response.json();

  return (json.features || []).map((f) => {
    const p = f.properties || {};
    const [lon2, lat2] = f.geometry?.coordinates || [];
    return {
      source: 'geoapify',
      sourceId: p.place_id,
      name: p.name || p.address_line1 || 'Sin nombre',
      street: p.address_line1 || p.street || null,
      city: p.city || p.county || null,
      state: p.state || null,
      country: p.country || null,
      zipCode: p.postcode || null,
      lat: lat2 ?? p.lat ?? null,
      lon: lon2 ?? p.lon ?? null,
      phone: p.contact?.phone || null,
      website: p.website || p.contact?.website || null,
      email: p.contact?.email || null,
      photoUrl: null,
      social: { instagram: null, facebook: null, twitter: null },
      categories: p.categories || [],
    };
  });
};
