import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Heart, MessageCircle, MapPin, Send } from 'lucide-react';
import {
  getRouteDetail,
  toggleLikeRoute,
  getRouteComments,
  addRouteComment,
} from '@services/routesService';
import useAuthStore from '../../../store/authStore';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

function FitToTrack({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points.length > 0) {
      map.fitBounds(points, { padding: [32, 32] });
    }
  }, [points, map]);

  return null;
}

function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [route, setRoute] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [routeRes, commentsRes] = await Promise.all([
        getRouteDetail(id),
        getRouteComments(id),
      ]);
      setRoute(routeRes.data);
      setComments(commentsRes.data?.comments || []);
    } catch (error) {
      console.error('Error cargando la ruta:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleToggleLike = async () => {
    if (!user) {
      navigate(`/login?redirect=/rutas/${id}`);
      return;
    }
    try {
      await toggleLikeRoute(id);
      setRoute(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likesCount: prev.isLiked ? prev.likesCount - 1 : prev.likesCount + 1,
      }));
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate(`/login?redirect=/rutas/${id}`);
      return;
    }
    if (!commentText.trim()) return;

    try {
      await addRouteComment(id, commentText.trim());
      setCommentText('');
      const commentsRes = await getRouteComments(id);
      setComments(commentsRes.data?.comments || []);
      setRoute(prev => ({ ...prev, commentsCount: prev.commentsCount + 1 }));
    } catch (error) {
      console.error('Error al comentar:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!route) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-mute">
        Ruta no encontrada.
      </div>
    );
  }

  const points = (route.trackPoints || []).map(p => [p.lat, p.lng]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="h-80 rounded-xl overflow-hidden border border-line mb-6">
        {points.length > 0 ? (
          <MapContainer center={points[0]} zoom={13} className="w-full h-full">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Polyline positions={points} color="#034EA2" weight={4} />
            {route.startPoint && (
              <Marker position={[route.startPoint.lat, route.startPoint.lng]} />
            )}
            {route.endPoint && <Marker position={[route.endPoint.lat, route.endPoint.lng]} />}
            <FitToTrack points={points} />
          </MapContainer>
        ) : (
          <div className="w-full h-full bg-sand flex items-center justify-center text-mute">
            Sin datos de recorrido
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-mute mb-2">
        <MapPin size={14} className="text-primary" />
        {ACTIVITY_LABELS[route.activityType] || route.activityType}
        {route.city && <span>· {route.city}</span>}
      </div>

      <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mb-2">{route.title}</h1>

      <div className="flex items-center gap-2 mb-4">
        {route.user?.avatar && (
          <img src={route.user.avatar} alt={route.user.name} className="w-8 h-8 rounded-full object-cover" />
        )}
        <span className="text-sm font-medium text-ink">{route.user?.name || 'Usuario'}</span>
      </div>

      {route.description && <p className="text-ink mb-6">{route.description}</p>}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-sand rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-ink">
            {route.distanceKm ? `${Number(route.distanceKm).toFixed(1)} km` : '-'}
          </div>
          <div className="text-xs text-mute">Distancia</div>
        </div>
        <div className="bg-sand rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-ink">
            {route.durationSeconds ? `${Math.round(route.durationSeconds / 60)} min` : '-'}
          </div>
          <div className="text-xs text-mute">Duración</div>
        </div>
        <div className="bg-sand rounded-xl p-4 text-center">
          <div className="text-lg font-bold text-ink">
            {route.elevationGainM ? `${Number(route.elevationGainM).toFixed(0)} m` : '-'}
          </div>
          <div className="text-xs text-mute">Elevación</div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-8 pb-6 border-b border-line">
        <button onClick={handleToggleLike} className="flex items-center gap-2 text-ink">
          <Heart size={20} className={route.isLiked ? 'fill-red-500 text-red-500' : ''} />
          {route.likesCount} me gusta
        </button>
        <span className="flex items-center gap-2 text-mute">
          <MessageCircle size={20} />
          {route.commentsCount} comentarios
        </span>
      </div>

      <div>
        <h2 className="font-semibold text-ink mb-4">Comentarios</h2>
        <div className="space-y-4 mb-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              {comment.user?.avatar && (
                <img src={comment.user.avatar} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
              )}
              <div>
                <span className="text-sm font-semibold text-ink">{comment.user?.name || 'Usuario'}</span>
                <p className="text-sm text-ink">{comment.text}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-sm text-mute">Sé el primero en comentar.</p>
          )}
        </div>
        <form onSubmit={handleAddComment} className="flex gap-2">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Escribe un comentario..."
            className="flex-1 border border-line rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white rounded-full p-2 hover:bg-primary-dark transition"
            aria-label="Comentar"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default RouteDetailPage;
