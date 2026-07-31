import { getOrsApiKey } from '../settings/settings.service.js';

const ORS_BASE = 'https://api.openrouteservice.org';

// activityType -> perfil de OpenRouteService. ORS no tiene perfil de
// caballo ni de running específico, así que se mapean al más cercano;
// 'kayaking' no tiene entrada a propósito (ningún proveedor gratuito
// enruta por agua, se quitó como opción al grabar una ruta nueva).
export const ACTIVITY_TO_PROFILE = {
  trekking: 'foot-hiking',
  mountaineering: 'foot-hiking',
  climbing: 'foot-hiking',
  horseback: 'foot-hiking',
  walking: 'foot-walking',
  running: 'foot-walking',
  cycling: 'cycling-regular',
};

export const geocode = async ({ text, focusLat, focusLng }) => {
  const apiKey = await getOrsApiKey();
  if (!apiKey) throw new Error('El buscador de destinos no está configurado. Contacta al administrador.');

  const url = new URL(`${ORS_BASE}/geocode/autocomplete`);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('text', text);
  if (focusLat && focusLng) {
    url.searchParams.set('focus.point.lat', focusLat);
    url.searchParams.set('focus.point.lon', focusLng);
  }

  const response = await fetch(url.toString());
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || 'Error al buscar destino');
  }

  return (data.features || []).map((f) => ({
    label: f.properties.label,
    lat: f.geometry.coordinates[1],
    lng: f.geometry.coordinates[0],
  }));
};

export const getDirections = async ({ originLat, originLng, destLat, destLng, profile, alternatives }) => {
  const apiKey = await getOrsApiKey();
  if (!apiKey) throw new Error('El ruteo no está configurado. Contacta al administrador.');

  const body = {
    // ORS espera [lng, lat], al revés de la convención del resto del proyecto.
    coordinates: [[originLng, originLat], [destLng, destLat]],
    ...(alternatives ? { alternative_routes: { target_count: 3, weight_factor: 1.6, share_factor: 0.6 } } : {}),
  };

  const response = await fetch(`${ORS_BASE}/v2/directions/${profile}/geojson`, {
    method: 'POST',
    headers: { Authorization: apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'No se pudo calcular la ruta');
  }

  return (data.features || []).map((f, i) => ({
    isPrimary: i === 0,
    distanceKm: f.properties.summary.distance / 1000,
    durationMinutes: f.properties.summary.duration / 60,
    geometry: f.geometry.coordinates.map(([lng, lat]) => ({ lat, lng })),
  }));
};
