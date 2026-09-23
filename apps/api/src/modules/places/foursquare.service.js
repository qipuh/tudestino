import * as settingsService from '../settings/settings.service.js';

// V3 (api.foursquare.com/v3) fue descontinuado - endpoint nuevo es
// places-api.foursquare.com, autenticado con la Service API Key (Bearer)
// y un header de versión obligatorio.
// https://docs.foursquare.com/fsq-developers-places/reference/place-search
const BASE_URL = 'https://places-api.foursquare.com/places/search';
const API_VERSION = '2025-06-17';

const CATEGORY_BY_TYPE = {
  hotel: '19014', // Hotel
  restaurant: '13065', // Restaurant
};

/**
 * Busca lugares en Foursquare Places API (nueva) alrededor de un punto
 * lat/lon. Devuelve resultados normalizados al mismo shape que
 * geoapify.service.js.
 */
export const searchFoursquare = async ({ type, lat, lon, radius = 5000, limit = 20 }) => {
  const { foursquareServiceApiKey } = await settingsService.getPlacesConfig();
  if (!foursquareServiceApiKey) {
    throw new Error('Foursquare no está configurado. Agrega la Service API Key en Configuración > Lugares.');
  }

  const category = CATEGORY_BY_TYPE[type];
  if (!category) throw new Error(`Tipo de lugar no soportado: ${type}`);

  const url = new URL(BASE_URL);
  url.searchParams.set('fsq_category_ids', category);
  url.searchParams.set('ll', `${lat},${lon}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('limit', String(limit));
  url.searchParams.set(
    'fields',
    'fsq_place_id,name,location,latitude,longitude,tel,website,social_media,photos,email,categories'
  );

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${foursquareServiceApiKey}`,
      'X-Places-Api-Version': API_VERSION,
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Foursquare respondió ${response.status}: ${body.slice(0, 200)}`);
  }
  const json = await response.json();

  return (json.results || []).map((r) => {
    const firstPhoto = r.photos?.[0];
    return {
      source: 'foursquare',
      sourceId: r.fsq_place_id || r.fsq_id,
      name: r.name || 'Sin nombre',
      street: r.location?.address || null,
      city: r.location?.locality || null,
      state: r.location?.region || null,
      country: r.location?.country || null,
      zipCode: r.location?.postcode || null,
      lat: r.latitude ?? r.geocodes?.main?.latitude ?? null,
      lon: r.longitude ?? r.geocodes?.main?.longitude ?? null,
      phone: r.tel || null,
      website: r.website || null,
      email: r.email || null,
      photoUrl: firstPhoto ? `${firstPhoto.prefix}original${firstPhoto.suffix}` : null,
      social: {
        instagram: r.social_media?.instagram || null,
        facebook: r.social_media?.facebook_id || null,
        twitter: r.social_media?.twitter || null,
      },
      categories: (r.categories || []).map((c) => c.name),
    };
  });
};
