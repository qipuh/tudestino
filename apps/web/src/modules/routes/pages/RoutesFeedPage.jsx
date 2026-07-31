import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Mountain, MountainSnow, Bike, Footprints, Waves, Compass, Route as RouteIcon, Heart, MessageCircle, Plus } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { getRoutesFeed } from '@services/routesService';
import useAuthStore from '../../../store/authStore';

const ACTIVITY_LABELS = {
  trekking: 'Trekking',
  walking: 'Caminata',
  cycling: 'Ciclismo',
  running: 'Running',
  mountaineering: 'Montañismo',
  climbing: 'Escalada',
  kayaking: 'Kayak',
  horseback: 'Cabalgata',
};

const ACTIVITY_ICONS = {
  trekking: Mountain,
  walking: Footprints,
  cycling: Bike,
  running: Footprints,
  mountaineering: MountainSnow,
  climbing: Mountain,
  kayaking: Waves,
  horseback: Compass,
};

function RouteCoverPreview({ route }) {
  if (route.coverImage) {
    return (
      <img
        src={route.coverImage}
        alt={route.title}
        className="w-full h-full object-cover"
      />
    );
  }

  if (route.startPoint) {
    return (
      <div className="w-full h-full pointer-events-none">
        <MapContainer
          center={[route.startPoint.lat, route.startPoint.lng]}
          zoom={11}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          attributionControl={false}
          className="w-full h-full"
        >
          <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        </MapContainer>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-sand flex items-center justify-center">
      <RouteIcon className="text-primary/40" size={40} />
    </div>
  );
}

function RoutesFeedPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [activityFilter, setActivityFilter] = useState(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const loadFeed = useCallback(async (pageToLoad, filter, replace) => {
    setLoading(true);
    try {
      const response = await getRoutesFeed(pageToLoad, 10, filter);
      const data = response.data || {};
      const newRoutes = data.routes || [];
      setRoutes(prev => (replace ? newRoutes : [...prev, ...newRoutes]));
      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error cargando el feed de rutas:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    loadFeed(1, activityFilter, true);
  }, [activityFilter, loadFeed]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadFeed(nextPage, activityFilter, false);
  };

  const handleRecordClick = () => {
    // Grabar rutas es solo desde la app móvil (GPS en background); en
    // web solo se navega/comparte lo ya grabado.
    if (!user) {
      navigate('/login?redirect=/rutas');
      return;
    }
    alert('Para grabar una ruta usa la app móvil de TuDestino.');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink">Rutas de la comunidad</h1>
          <p className="text-mute text-sm mt-1">Trekking, ciclismo, running y montañismo compartidos por viajeros</p>
        </div>
        <button
          onClick={handleRecordClick}
          className="hidden sm:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full font-medium hover:bg-primary-dark transition"
        >
          <Plus size={18} />
          Grabar ruta
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActivityFilter(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition ${
            activityFilter === null ? 'bg-primary border-primary text-white' : 'bg-white border-line text-ink'
          }`}
        >
          Todas
        </button>
        {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActivityFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium border whitespace-nowrap transition ${
              activityFilter === key ? 'bg-primary border-primary text-white' : 'bg-white border-line text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {routes.length === 0 && !loading ? (
        <div className="text-center py-16">
          <RouteIcon className="mx-auto text-gray-300 mb-4" size={56} />
          <p className="text-mute">Todavía no hay rutas compartidas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {routes.map(route => {
            const ActivityIcon = ACTIVITY_ICONS[route.activityType] || RouteIcon;
            return (
              <Link
                key={route.id}
                to={`/rutas/${route.id}`}
                className="group bg-white border border-line rounded-xl overflow-hidden shadow-card hover:shadow-cardHover transition-all"
              >
                <div className="h-40 overflow-hidden">
                  <RouteCoverPreview route={route} />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-mute mb-2">
                    <ActivityIcon size={14} className="text-primary" />
                    {ACTIVITY_LABELS[route.activityType] || route.activityType}
                    {route.city && <span>· {route.city}</span>}
                  </div>
                  <h3 className="font-semibold text-ink group-hover:text-primary transition-colors line-clamp-1">
                    {route.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-mute">
                    {route.distanceKm && <span>{Number(route.distanceKm).toFixed(1)} km</span>}
                    {route.durationSeconds && (
                      <span>{Math.round(route.durationSeconds / 60)} min</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-line text-sm text-mute">
                    <span className="flex items-center gap-1">
                      <Heart size={14} className={route.isLiked ? 'fill-red-500 text-red-500' : ''} />
                      {route.likesCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle size={14} />
                      {route.commentsCount}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 border border-line rounded-full text-sm font-medium hover:bg-sand transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Ver más rutas'}
          </button>
        </div>
      )}
    </div>
  );
}

export default RoutesFeedPage;
