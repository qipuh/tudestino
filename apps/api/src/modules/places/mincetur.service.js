// Directorio Nacional de Prestadores de Servicios Turísticos (MINCETUR) -
// fuente oficial del Estado peruano, sin necesidad de API key. No documenta
// un contrato público formal; el endpoint se identificó inspeccionando el
// JS del propio sitio (consPrincipalDirPrestadores.js / utilitarios.custom.js).
const BASE_URL = 'https://consultasenlinea.mincetur.gob.pe/directoriodeserviciosturisticos/api/Establecimiento/ListarEstablecimientoPublicoV2';

const GRUPO_BY_TYPE = {
  hotel: 1,
  travel_agency: 2,
  restaurant: 3,
  tour_guide: 4,
};

const cleanText = (v) => {
  if (v == null) return null;
  const s = String(v).trim();
  return s && s !== '-' ? s : null;
};

const toNumber = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) && n !== 0 ? n : null;
};

/**
 * Busca prestadores registrados oficialmente en MINCETUR para un ubigeo
 * (código de 2/4/6 dígitos = departamento/provincia/distrito). No requiere
 * lat/lon - es búsqueda exacta por jurisdicción, no por radio.
 */
export const searchMincetur = async ({ type, ubigeoCode, limit = 30 }) => {
  const idGrupo = GRUPO_BY_TYPE[type];
  if (!idGrupo) throw new Error(`Tipo de lugar no soportado en MINCETUR: ${type}`);
  if (!ubigeoCode) throw new Error('Falta el código de ubigeo para buscar en MINCETUR');

  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Mozilla/5.0',
    },
    body: JSON.stringify({
      ID_GRUPO: idGrupo,
      ID_UBIGEO: ubigeoCode,
      ID_ESTADO: 2,
      FLG_EST: 1,
      OPR: 1,
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`MINCETUR respondió ${response.status}: ${body.slice(0, 200)}`);
  }

  const json = await response.json();
  const rows = Array.isArray(json) ? json.slice(0, limit) : [];

  return rows.map((r) => {
    const ubigeoParts = (r.DES_UBIGEO || '').split('/');
    return {
      source: 'mincetur',
      sourceId: r.ID_ESTABLECIMIENTO || r.COD_ESTABLECIMIENTO || r.RUC || null,
      name: cleanText(r.NOMBRE_COMERCIAL_EST) || cleanText(r.NOMBRE_COMERCIAL) || cleanText(r.RAZON_SOCIAL) || 'Sin nombre',
      street: cleanText(r.DES_DIR_ESTA) || cleanText(r.DES_VIA),
      city: ubigeoParts[2]?.trim() || null,
      state: ubigeoParts[0]?.trim() || null,
      country: 'Perú',
      zipCode: null,
      lat: toNumber(r.LATITUD),
      lon: toNumber(r.LONGITUD),
      phone: cleanText(r.CELULAR) || cleanText(r.NUMERO_CELU) || (r.TELEFONO ? String(r.TELEFONO) : null),
      website: cleanText(r.WEB) || cleanText(r.DES_CORREO_WEB),
      email: cleanText(r.MAIL) || cleanText(r.DES_CORREO),
      photoUrl: null,
      social: { instagram: null, facebook: null, twitter: null },
      categories: [cleanText(r.DES_CLASE), cleanText(r.DES_CATEGORIA)].filter(Boolean),
      ruc: r.RUC || null,
      official: true,
    };
  });
};
