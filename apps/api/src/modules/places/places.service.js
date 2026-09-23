import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import * as settingsService from '../settings/settings.service.js';
import { searchGeoapify } from './geoapify.service.js';
import { searchFoursquare } from './foursquare.service.js';
import { searchMincetur } from './mincetur.service.js';
import User from '../users/user.model-mysql.js';
import { Property as HotelProperty } from '../properties/hotel-property.model.js';
import Business from '../businesses/business.model.js';

// Geoapify/Foursquare buscan por radio (lat/lon) y solo cubren hotel y
// restaurant. Agencias de viaje y guías solo existen en el directorio
// oficial MINCETUR, que busca por ubigeo exacto en vez de radio.
const RADIUS_SOURCE_TYPES = new Set(['hotel', 'restaurant']);

const SYSTEM_USER_EMAIL = 'imports@tudestino.pe';

// Distancia haversine en metros - usada para deduplicar el mismo lugar
// reportado por ambas fuentes (Geoapify y Foursquare).
const distanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const normalizeName = (name) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');

/**
 * Geocodifica una ciudad/dirección de texto a lat/lon usando Geoapify -
 * punto de partida para las búsquedas por radio de ambas APIs.
 */
export const geocodeQuery = async (query) => {
  const { geoapifyApiKey } = await settingsService.getPlacesConfig();
  if (!geoapifyApiKey) {
    throw new Error('Geoapify no está configurado. Agrega la API key en Configuración > Lugares.');
  }
  const url = new URL('https://api.geoapify.com/v1/geocode/search');
  url.searchParams.set('text', query);
  url.searchParams.set('limit', '1');
  url.searchParams.set('apiKey', geoapifyApiKey);

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`Geocoding falló: ${response.status}`);
  const json = await response.json();
  const feature = json.features?.[0];
  if (!feature) throw new Error(`No se encontró ubicación para "${query}"`);

  const [lon, lat] = feature.geometry.coordinates;
  return { lat, lon, label: feature.properties?.formatted || query };
};

/**
 * Busca lugares en Geoapify + Foursquare + MINCETUR (según tipo) en
 * paralelo y mergea/dedupe por cercanía (<80m) y nombre similar -
 * quedándose con el registro que tenga más campos completos.
 */
export const searchPlaces = async ({ type, city, lat, lon, ubigeoCode, radius = 5000, limit = 20 }) => {
  const usesRadius = RADIUS_SOURCE_TYPES.has(type);

  let center = { lat, lon };
  if (usesRadius && (!lat || !lon)) {
    if (!city) throw new Error('Debes indicar una ciudad o coordenadas');
    center = await geocodeQuery(city);
  }

  if (!usesRadius && !ubigeoCode) {
    throw new Error('Este tipo solo se busca por ubigeo (departamento/provincia/distrito) vía MINCETUR');
  }

  const searches = [];
  if (usesRadius) {
    searches.push(searchGeoapify({ type, lat: center.lat, lon: center.lon, radius, limit }));
    searches.push(searchFoursquare({ type, lat: center.lat, lon: center.lon, radius, limit }));
  }
  if (ubigeoCode) {
    searches.push(searchMincetur({ type, ubigeoCode, limit }));
  }

  const settled = await Promise.allSettled(searches);
  const all = settled.filter((r) => r.status === 'fulfilled').flatMap((r) => r.value);
  const errors = settled.filter((r) => r.status === 'rejected').map((r) => r.reason?.message);

  const completeness = (p) =>
    [p.street, p.city, p.phone, p.website, p.email, p.photoUrl].filter(Boolean).length;

  // Rellena los campos vacíos de "base" con los de "extra" - así un lugar
  // reportado por ambas fuentes se queda con el teléfono de una y la foto
  // de la otra, en vez de perder datos al descartar el registro "peor".
  const fillGaps = (base, extra) => ({
    ...base,
    street: base.street || extra.street,
    phone: base.phone || extra.phone,
    website: base.website || extra.website,
    email: base.email || extra.email,
    photoUrl: base.photoUrl || extra.photoUrl,
    social: {
      instagram: base.social?.instagram || extra.social?.instagram || null,
      facebook: base.social?.facebook || extra.social?.facebook || null,
      twitter: base.social?.twitter || extra.social?.twitter || null,
    },
  });

  const merged = [];
  for (const place of all) {
    // Sin coordenadas (común en MINCETUR) no se puede deduplicar por
    // cercanía - se agrega directo en vez de descartarlo.
    const dupIndex =
      place.lat == null || place.lon == null
        ? -1
        : merged.findIndex((m) => {
            if (m.lat == null || m.lon == null) return false;
            const closeBy = distanceMeters(m.lat, m.lon, place.lat, place.lon) < 80;
            const sameName = normalizeName(m.name) === normalizeName(place.name);
            return closeBy && sameName;
          });
    if (dupIndex === -1) {
      merged.push({ ...place, sources: [place.source] });
    } else {
      const existing = merged[dupIndex];
      const winner = completeness(place) > completeness(existing) ? place : existing;
      const loser = winner === place ? existing : place;
      merged[dupIndex] = { ...fillGaps(winner, loser), sources: [...existing.sources, place.source] };
    }
  }

  return { center, results: merged, errors };
};

const getOrCreateSystemUser = async () => {
  const existing = await User.findOne({ where: { email: SYSTEM_USER_EMAIL } });
  if (existing) return existing;

  const password = await bcrypt.hash(randomUUID(), 12);
  return User.create({
    name: 'TuDestino Import',
    email: SYSTEM_USER_EMAIL,
    password,
    role: 'admin',
    isActive: true,
    emailVerified: true,
  });
};

/**
 * Importa lugares seleccionados como registros 'published' - visibles de
 * inmediato en listados públicos. Sin rooms/precios/menú cargados todavía,
 * así que aparecen en el directorio pero no son reservables hasta que un
 * admin complete esos datos.
 */
export const importPlaces = async ({ type, places }) => {
  if (!Array.isArray(places) || places.length === 0) {
    throw new Error('No hay lugares para importar');
  }

  const systemUser = await getOrCreateSystemUser();
  const created = [];
  const skipped = [];

  for (const place of places) {
    try {
      if (type === 'hotel') {
        const row = await HotelProperty.create({
          hostId: systemUser.id,
          accommodationType: 'hotel',
          hotelName: place.name,
          propertyName: place.name,
          description: place.name,
          addressStreet: place.street || place.city || 'Sin dirección',
          addressCity: place.city || 'Sin ciudad',
          addressState: place.state || null,
          addressCountry: place.country || 'Perú',
          addressZipCode: place.zipCode || null,
          addressLatitude: place.lat,
          addressLongitude: place.lon,
          status: 'published',
        });
        created.push(row.id);
      } else if (type === 'restaurant' || type === 'travel_agency' || type === 'tour_guide') {
        const slug =
          place.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/[\s_-]+/g, '-') + '-' + randomUUID().slice(0, 6);

        const row = await Business.create({
          ownerId: systemUser.id,
          name: place.name,
          slug,
          description: place.name,
          businessType: type,
          address: {
            street: place.street || place.city || 'Sin dirección',
            city: place.city || 'Sin ciudad',
            state: place.state || null,
            country: place.country || 'Perú',
            zipCode: place.zipCode || null,
            latitude: place.lat,
            longitude: place.lon,
          },
          contactPhone: place.phone || null,
          contactEmail: place.email || null,
          website: place.website || null,
          status: 'active',
        });
        created.push(row.id);
      } else {
        throw new Error(`Tipo no soportado: ${type}`);
      }
    } catch (err) {
      skipped.push({ name: place.name, reason: err.message });
    }
  }

  return { createdCount: created.length, createdIds: created, skipped };
};
