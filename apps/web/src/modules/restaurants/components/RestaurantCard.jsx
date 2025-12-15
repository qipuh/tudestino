import { MapPin, Star, DollarSign, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

function RestaurantCard({ restaurant }) {
  const mainImage = restaurant.images?.find(img => img.isMain) || restaurant.images?.[0];

  const getPriceSymbols = (priceRange) => {
    return '$'.repeat(priceRange || 2);
  };

  return (
    <Link to={`/restaurants/${restaurant.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          {mainImage ? (
            <img
              src={mainImage.url}
              alt={restaurant.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">Sin imagen</span>
            </div>
          )}

          {/* Badge de precio */}
          <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md">
            <span className="text-primary font-semibold">
              {getPriceSymbols(restaurant.priceRange)}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Logo y nombre */}
          <div className="flex items-start gap-3 mb-2">
            {restaurant.logo && (
              <img
                src={restaurant.logo}
                alt={`${restaurant.name} logo`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              />
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-primary transition-colors">
                {restaurant.name}
              </h3>
              {restaurant.cuisineTypes?.length > 0 && (
                <p className="text-sm text-gray-600">
                  {restaurant.cuisineTypes.slice(0, 2).join(' • ')}
                </p>
              )}
            </div>
          </div>

          {/* Descripción */}
          {restaurant.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {restaurant.description}
            </p>
          )}

          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin size={16} className="text-gray-400" />
            <span>{restaurant.city}</span>
          </div>

          {/* Rating y reviews */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-current" />
                <span className="font-semibold text-gray-900">
                  {restaurant.averageRating?.toFixed(1) || '0.0'}
                </span>
              </div>
              {restaurant.totalReviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({restaurant.totalReviews} reseñas)
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2">
              {restaurant.acceptsReservations && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Reservas
                </span>
              )}
              {restaurant.hasDelivery && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Delivery
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RestaurantCard;
