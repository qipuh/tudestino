import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Eye, ArrowLeft, Share2, Heart } from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';

const CATEGORIES = {
  naturaleza: { label: 'Naturaleza', emoji: '🌿', color: 'green' },
  cultura: { label: 'Cultura', emoji: '🏛️', color: 'purple' },
  aventura: { label: 'Aventura', emoji: '⛰️', color: 'orange' },
  gastronomia: { label: 'Gastronomía', emoji: '🍴', color: 'red' },
  urbano: { label: 'Urbano', emoji: '🏙️', color: 'blue' }
};

function AttractionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [attraction, setAttraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    fetchAttraction();
  }, [id]);

  const fetchAttraction = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/attractions/${id}`);
      const attractionData = response.data?.data || response.data;
      setAttraction(attractionData);
      setError(null);
    } catch (err) {
      console.error('Error fetching attraction:', err);
      setError('No se pudo cargar el atractivo turístico');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: attraction.title,
          text: attraction.description,
          url: url
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Enlace copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Atractivo no encontrado</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:text-primary-dark font-medium"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const category = CATEGORIES[attraction.category] || CATEGORIES.naturaleza;
  const allImages = [
    attraction.coverImage,
    ...(attraction.images || []).map(img => img.url)
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Compartir"
              >
                <Share2 size={20} />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="Guardar en favoritos"
              >
                <Heart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Main Image */}
            <div className="h-96 md:h-[500px]">
              <img
                src={getImageUrl(allImages[selectedImage], 'attractions')}
                alt={attraction.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Image Counter */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                {selectedImage + 1} / {allImages.length}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="bg-black/50 p-4">
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      idx === selectedImage ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(img, 'attractions')}
                      alt={`Vista ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Category */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
                  {category.emoji} {category.label}
                </span>
                {attraction.views > 0 && (
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Eye size={14} />
                    {attraction.views} vistas
                  </span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {attraction.title}
              </h1>
            </div>

            {/* Location */}
            {(attraction.city || attraction.address) && (
              <div className="flex items-start gap-2 text-gray-600">
                <MapPin size={20} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{attraction.city}{attraction.region ? `, ${attraction.region}` : ''}</p>
                  {attraction.address && (
                    <p className="text-sm">{attraction.address}</p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {attraction.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {attraction.description}
                </p>
              </div>
            )}

            {/* What To Do */}
            {attraction.whatToDo && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">¿Qué hacer?</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {attraction.whatToDo}
                </p>
              </div>
            )}

            {/* Recommendations */}
            {attraction.recommendations && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Recomendaciones</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {attraction.recommendations}
                </p>
              </div>
            )}

            {/* Video */}
            {attraction.videoUrl && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Video</h2>
                <div className="aspect-video">
                  <iframe
                    src={attraction.videoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                    title={attraction.title}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Map Card */}
            {attraction.latitude && attraction.longitude && (
              <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ubicación</h3>
                <div className="h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <MapPin size={48} className="text-gray-400" />
                  <div className="ml-2 text-sm text-gray-600">
                    <p>Lat: {attraction.latitude}</p>
                    <p>Lng: {attraction.longitude}</p>
                  </div>
                </div>
                {attraction.city && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{attraction.city}</p>
                    {attraction.region && <p>{attraction.region}</p>}
                    {attraction.country && <p>{attraction.country}</p>}
                  </div>
                )}
                <a
                  href={`https://www.google.com/maps?q=${attraction.latitude},${attraction.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 block w-full bg-primary text-white text-center py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Ver en Google Maps
                </a>
              </div>
            )}

            {/* Distance Info */}
            {attraction.hasDistanceMarkers && attraction.distance && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Distancia</h3>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {attraction.distance.toFixed(2)} km
                  </p>
                  {attraction.startPoint && attraction.endPoint && (
                    <div className="mt-4 text-sm text-gray-600">
                      <p>📍 Desde: {attraction.startPoint.label || 'Punto de inicio'}</p>
                      <p className="mt-1">🎯 Hasta: {attraction.endPoint.label || 'Destino'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionDetail;
