import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Home, MapPin, DollarSign, Eye, Edit, Trash2, MoreVertical } from 'lucide-react';
import useAuthStore from '../../../store/authStore';

function MyPropertiesPage() {
  const { token } = useAuthStore();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/my-properties`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar propiedades');
      }

      const result = await response.json();

      // Manejar diferentes formatos de respuesta
      let propertiesData = [];
      if (Array.isArray(result)) {
        propertiesData = result;
      } else if (result.data && Array.isArray(result.data)) {
        propertiesData = result.data;
      } else if (result.success && result.data && Array.isArray(result.data)) {
        propertiesData = result.data;
      }

      console.log('Properties loaded:', propertiesData);
      setProperties(propertiesData);
    } catch (err) {
      console.error('Error loading properties:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/properties/${propertyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar propiedad');
      }

      setProperties(properties.filter(p => p.id !== propertyId));
      setActiveMenu(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      published: { text: 'Publicada', class: 'bg-green-100 text-green-800' },
      draft: { text: 'Borrador', class: 'bg-gray-100 text-gray-800' },
      suspended: { text: 'Suspendida', class: 'bg-red-100 text-red-800' },
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando propiedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mis Propiedades</h1>
            <p className="text-gray-600 mt-1">Gestiona tus alojamientos</p>
          </div>
          <Link
            to="/host/properties/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus size={20} />
            Nueva Propiedad
          </Link>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Home size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No tienes propiedades aún</h3>
            <p className="text-gray-600 mb-6">
              Comienza publicando tu primera propiedad y empieza a recibir huéspedes
            </p>
            <Link
              to="/host/properties/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              <Plus size={20} />
              Publicar mi primera propiedad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div key={property.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
                {/* Image */}
                <div className="relative h-48 bg-gray-200">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Home size={48} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    {getStatusBadge(property.status)}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{property.city}, {property.country}</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-900 font-semibold mb-4">
                    <DollarSign size={18} />
                    <span>{property.basePrice} {property.currency}</span>
                    <span className="text-gray-500 font-normal text-sm">/ noche</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span>{property.guests} huéspedes</span>
                    <span>•</span>
                    <span>{property.bedrooms || 0} habitaciones</span>
                    <span>•</span>
                    <span>{property.bathrooms || 0} baños</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Link
                      to={`/properties/${property.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Eye size={16} />
                      Ver
                    </Link>
                    <Link
                      to={`/host/properties/${property.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <Edit size={16} />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyPropertiesPage;
