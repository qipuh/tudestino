import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import MenuItemCard from '../components/MenuItemCard';
import ReservationForm from '../components/ReservationForm';

function RestaurantDetailPage() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchRestaurantDetails();
    fetchMenu();
  }, [id]);

  const fetchRestaurantDetails = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurants/${id}`
      );

      if (!response.ok) {
        throw new Error('Restaurante no encontrado');
      }

      const data = await response.json();
      setRestaurant(data);
      setSelectedImage(data.images?.find(img => img.isMain) || data.images?.[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurants/${id}/menu`
      );

      if (response.ok) {
        const data = await response.json();
        setMenu(data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const handleReservationSubmit = async (reservationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/restaurants/${id}/reservations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(reservationData)
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear la reserva');
      }

      const data = await response.json();
      alert(`¡Reserva confirmada! Código: ${data.confirmationCode}`);
      setShowReservationForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const getDaySchedule = (day) => {
    if (!restaurant?.schedule || !restaurant.schedule[day]) return null;
    const schedule = restaurant.schedule[day];
    if (schedule.closed) return 'Cerrado';
    return `${schedule.open} - ${schedule.close}`;
  };

  const getPriceSymbols = (priceRange) => {
    return '$'.repeat(priceRange || 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Restaurante no encontrado'}
          </h2>
          <Link
            to="/restaurants"
            className="text-primary hover:underline"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con botón de regreso */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ChevronLeft size={20} />
            Volver a restaurantes
          </Link>
        </div>
      </div>

      {/* Galería de imágenes */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Imagen principal */}
          <div className="md:col-span-2 h-96 rounded-lg overflow-hidden">
            {selectedImage ? (
              <img
                src={selectedImage.url}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Miniaturas */}
          {restaurant.images && restaurant.images.length > 1 && (
            <div className="md:col-span-2 grid grid-cols-4 gap-2">
              {restaurant.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`h-24 rounded-lg overflow-hidden ${
                    selectedImage?.url === image.url ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  {restaurant.logo && (
                    <img
                      src={restaurant.logo}
                      alt={`${restaurant.name} logo`}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {restaurant.name}
                    </h1>
                    {restaurant.cuisineTypes && restaurant.cuisineTypes.length > 0 && (
                      <p className="text-gray-600">
                        {restaurant.cuisineTypes.join(' • ')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {getPriceSymbols(restaurant.priceRange)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="text-yellow-400 fill-current" size={20} />
                    <span className="font-semibold">{restaurant.averageRating?.toFixed(1)}</span>
                    <span className="text-gray-500">({restaurant.totalReviews} reseñas)</span>
                  </div>
                </div>
              </div>

              {restaurant.description && (
                <p className="text-gray-700 leading-relaxed">{restaurant.description}</p>
              )}

              {/* Tags y características */}
              <div className="flex flex-wrap gap-2 mt-4">
                {restaurant.acceptsReservations && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Acepta Reservas
                  </span>
                )}
                {restaurant.hasDelivery && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    Delivery
                  </span>
                )}
                {restaurant.hasTakeout && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                    Para Llevar
                  </span>
                )}
                {restaurant.dietaryOptions?.map(option => (
                  <span key={option} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {option}
                  </span>
                ))}
              </div>
            </div>

            {/* Menú */}
            {menu.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Menú</h2>
                <div className="space-y-8">
                  {menu.map(category => (
                    <div key={category.id}>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 mb-4">{category.description}</p>
                      )}
                      <div className="space-y-4">
                        {category.items?.map(item => (
                          <MenuItemCard key={item.id} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Botón de reserva */}
            {restaurant.acceptsReservations && !showReservationForm && (
              <button
                onClick={() => setShowReservationForm(true)}
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                Hacer Reserva
              </button>
            )}

            {/* Formulario de reserva */}
            {showReservationForm && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <ReservationForm
                  restaurant={restaurant}
                  onSubmit={handleReservationSubmit}
                  onCancel={() => setShowReservationForm(false)}
                />
              </div>
            )}

            {/* Información de contacto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-lg mb-4">Información de Contacto</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <p className="text-gray-900">{restaurant.address}</p>
                    <p className="text-gray-600">{restaurant.city}, {restaurant.country}</p>
                  </div>
                </div>

                {restaurant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="text-gray-400" size={20} />
                    <a href={`tel:${restaurant.phone}`} className="text-primary hover:underline">
                      {restaurant.phone}
                    </a>
                  </div>
                )}

                {restaurant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={20} />
                    <a href={`mailto:${restaurant.email}`} className="text-primary hover:underline">
                      {restaurant.email}
                    </a>
                  </div>
                )}

                {restaurant.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="text-gray-400" size={20} />
                    <a
                      href={restaurant.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Visitar sitio web
                    </a>
                  </div>
                )}

                {restaurant.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="text-gray-400" size={20} />
                    <span className="text-gray-900">Capacidad: {restaurant.capacity} personas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Horarios */}
            {restaurant.schedule && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Clock size={20} />
                  Horarios
                </h3>
                <div className="space-y-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => {
                    const dayNames = {
                      monday: 'Lunes',
                      tuesday: 'Martes',
                      wednesday: 'Miércoles',
                      thursday: 'Jueves',
                      friday: 'Viernes',
                      saturday: 'Sábado',
                      sunday: 'Domingo'
                    };
                    const schedule = getDaySchedule(day);
                    return (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{dayNames[day]}</span>
                        <span className="text-gray-900 font-medium">{schedule || 'N/D'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mapa */}
            {restaurant.latitude && restaurant.longitude && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-semibold text-lg mb-4">Ubicación</h3>
                <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Mapa aquí</p>
                  {/* TODO: Integrar mapa con Leaflet o Google Maps */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RestaurantDetailPage;
