import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, DollarSign, Clock, Star, Trash2, Edit } from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import BusinessLayout from '../components/BusinessLayout';

function BusinessTours() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar datos del negocio
      const businessResponse = await api.get(`/businesses/${id}`);
      setBusiness(businessResponse.data);

      // Cargar tours del negocio
      const toursResponse = await api.get(`/businesses/${id}/tours`);
      setTours(toursResponse.data);
    } catch (error) {
      console.error('Error loading tours:', error);
      setError('Error al cargar los tours');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('¿Estás seguro de eliminar este tour?')) {
      return;
    }

    try {
      await api.delete(`/tours/${tourId}`);
      await loadData(); // Recargar lista
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Error al eliminar el tour');
    }
  };

  const handleEditTour = (tourId) => {
    navigate(`/business/${id}/tours/${tourId}/edit`);
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">No se encontró el negocio</p>
      </div>
    );
  }

  return (
    <BusinessLayout activeMenu="tours">
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tours y Excursiones</h1>
              <p className="text-gray-600 mt-1">
                Gestiona los paquetes turísticos que ofrece tu negocio
              </p>
            </div>
            <button
              onClick={() => navigate(`/business/${id}/tours/create`)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>Crear Tour</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && tours.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tours...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tours.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              No hay tours registrados
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea tu primer tour para que los clientes puedan reservar experiencias increíbles
            </p>
            <button
              onClick={() => navigate(`/business/${id}/tours/create`)}
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark font-medium"
            >
              Crear Primer Tour
            </button>
          </div>
        )}

        {/* Tours Grid */}
        {!loading && tours.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Tours ({tours.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tours.map((tour) => (
                <div
                  key={tour.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
                >
                  {/* Tour Image */}
                  <div className="relative h-48 bg-gradient-to-br from-primary to-primary-dark">
                    {tour.coverImage ? (
                      <img
                        src={getImageUrl(tour.coverImage, 'tours')}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-6xl">
                        🗺️
                      </div>
                    )}
                    {/* Category Badge */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
                      {tour.category}
                    </div>
                    {/* Price Badge */}
                    <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                      ${tour.basePricePerPerson}
                    </div>
                  </div>

                  {/* Tour Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {tour.name}
                    </h3>

                    {tour.shortDescription && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {tour.shortDescription}
                      </p>
                    )}

                    {/* Tour Details */}
                    <div className="space-y-2 mb-4">
                      {/* Duration */}
                      {tour.durationDays && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={16} className="text-primary" />
                          <span>
                            {tour.durationDays}D/{tour.durationNights || tour.durationDays - 1}N
                          </span>
                        </div>
                      )}

                      {/* Main Destination */}
                      {tour.mainDestination && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin size={16} className="text-primary" />
                          <span className="line-clamp-1">{tour.mainDestination}</span>
                        </div>
                      )}

                      {/* Service Type */}
                      {tour.serviceType && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users size={16} className="text-primary" />
                          <span>{tour.serviceType}</span>
                        </div>
                      )}

                      {/* Difficulty */}
                      {tour.difficulty && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Star size={16} className="text-primary" />
                          <span>Dificultad: {tour.difficulty}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          tour.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : tour.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {tour.status === 'active'
                          ? '✓ Activo'
                          : tour.status === 'draft'
                          ? '📝 Borrador'
                          : '✗ Inactivo'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditTour(tour.id)}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTour(tour.id)}
                        className="flex-1 border border-red-500 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition text-sm font-medium flex items-center justify-center gap-2"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Consejos para tus Tours</h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li>• Incluye fotos atractivas de los destinos y actividades</li>
            <li>• Describe detalladamente el itinerario día por día</li>
            <li>• Especifica claramente qué está incluido y qué no</li>
            <li>• Define políticas de cancelación justas y claras</li>
            <li>• Actualiza la disponibilidad según tus temporadas</li>
          </ul>
        </div>
      </div>
    </BusinessLayout>
  );
}

export default BusinessTours;
