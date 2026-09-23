import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, Maximize2, Loader2 } from 'lucide-react';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: 'hue-rotate-180', // distingue visualmente el marcador del usuario del destino
});

function FitBounds({ points }) {
  const map = useMap();
  if (points.length > 1) {
    map.fitBounds(points, { padding: [40, 40] });
  } else if (points.length === 1) {
    map.setView(points[0], 15);
  }
  return null;
}

function AttractionMap({ lat, lon, title, userPosition, routeCoords, height }) {
  const points = [[lat, lon], ...(userPosition ? [userPosition] : [])];
  return (
    <MapContainer center={[lat, lon]} zoom={14} style={{ height, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lon]} title={title} />
      {userPosition && <Marker position={userPosition} icon={userIcon} title="Tu ubicación" />}
      {routeCoords && <Polyline positions={routeCoords} pathOptions={{ color: '#034EA2', weight: 4 }} />}
      <FitBounds points={points} />
    </MapContainer>
  );
}

function AttractionLocationMap({ latitude, longitude, title, city, region, country }) {
  const [expanded, setExpanded] = useState(false);
  const [userPosition, setUserPosition] = useState(null);
  const [routeCoords, setRouteCoords] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  const handleLocateMe = useCallback(async () => {
    setError(null);
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLatLng = [pos.coords.latitude, pos.coords.longitude];
        setUserPosition(userLatLng);

        // OSRM demo público - gratuito, sin API key, sin necesidad de
        // autenticación (el backend /api/routing requiere login y está
        // pensado para otro flujo). Suficiente para trazar la ruta ocasional
        // de un visitante viendo un atractivo turístico.
        try {
          const url = `https://router.project-osrm.org/route/v1/driving/${userLatLng[1]},${userLatLng[0]};${lon},${lat}?overview=full&geometries=geojson`;
          const res = await fetch(url);
          const data = await res.json();
          const route = data.routes?.[0];
          if (route) {
            setRouteCoords(route.geometry.coordinates.map(([rlon, rlat]) => [rlat, rlon]));
            setRouteInfo({
              distanceKm: (route.distance / 1000).toFixed(1),
              durationMin: Math.round(route.duration / 60),
            });
          } else {
            setError('No se pudo calcular la ruta hacia este atractivo');
          }
        } catch (err) {
          console.error('Error fetching route:', err);
          setError('No se pudo calcular la ruta. Intenta de nuevo.');
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('No pudimos acceder a tu ubicación. Revisa los permisos del navegador.');
        setLocating(false);
      }
    );
  }, [lat, lon]);

  if (!lat || !lon) return null;

  return (
    <>
      <div className="relative">
        <div className="rounded-lg overflow-hidden">
          <AttractionMap lat={lat} lon={lon} title={title} height="256px" />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 bg-white shadow px-2 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <Maximize2 size={14} /> Expandir
        </button>
      </div>

      {(city || region || country) && (
        <div className="text-sm text-gray-600 mt-4">
          {city && <p className="font-medium">{city}</p>}
          {region && <p>{region}</p>}
          {country && <p>{country}</p>}
        </div>
      )}

      <a
        href={`https://www.google.com/maps?q=${lat},${lon}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 block w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-primary-dark transition"
      >
        Ver en Google Maps
      </a>

      {expanded && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
              <h3 className="font-bold text-gray-900">{title}</h3>
              <button onClick={() => setExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <button
                type="button"
                onClick={handleLocateMe}
                disabled={locating}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
              >
                {locating ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
                {locating ? 'Calculando ruta...' : 'Trazar ruta desde mi ubicación'}
              </button>

              {error && <p className="text-sm text-red-600">{error}</p>}

              {routeInfo && (
                <p className="text-sm text-gray-700">
                  Distancia: <strong>{routeInfo.distanceKm} km</strong> · Tiempo estimado:{' '}
                  <strong>{routeInfo.durationMin} min</strong> en auto
                </p>
              )}

              <div className="rounded-lg overflow-hidden">
                <AttractionMap
                  lat={lat}
                  lon={lon}
                  title={title}
                  userPosition={userPosition}
                  routeCoords={routeCoords}
                  height="60vh"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AttractionLocationMap;
