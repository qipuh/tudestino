import { Calendar, MapPin, Users, Clock, Tag, Video } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const CATEGORY_LABELS = {
  concert: 'Concierto',
  festival: 'Festival',
  conference: 'Conferencia',
  congress: 'Congreso',
  fair: 'Feria',
  exhibition: 'Exposición',
  workshop: 'Taller',
  seminar: 'Seminario',
  religious: 'Religioso',
  patronal_feast: 'Fiesta Patronal',
  carnival: 'Carnaval',
  sports: 'Deportivo',
  cultural: 'Cultural',
  gastronomic: 'Gastronómico',
  theater: 'Teatro',
  dance: 'Danza',
  art: 'Arte',
  business: 'Empresarial',
  networking: 'Networking',
  charity: 'Benéfico',
  educational: 'Educativo',
  family: 'Familiar',
  nightlife: 'Vida Nocturna',
  other: 'Otro'
};

const CATEGORY_COLORS = {
  concert: 'bg-purple-100 text-purple-700',
  festival: 'bg-pink-100 text-pink-700',
  conference: 'bg-blue-100 text-blue-700',
  congress: 'bg-indigo-100 text-indigo-700',
  fair: 'bg-yellow-100 text-yellow-700',
  exhibition: 'bg-orange-100 text-orange-700',
  workshop: 'bg-green-100 text-green-700',
  seminar: 'bg-teal-100 text-teal-700',
  religious: 'bg-amber-100 text-amber-700',
  patronal_feast: 'bg-red-100 text-red-700',
  carnival: 'bg-fuchsia-100 text-fuchsia-700',
  sports: 'bg-cyan-100 text-cyan-700',
  cultural: 'bg-violet-100 text-violet-700',
  gastronomic: 'bg-lime-100 text-lime-700',
  theater: 'bg-rose-100 text-rose-700',
  default: 'bg-gray-100 text-gray-700'
};

function EventCard({ event }) {
  const coverImage = event.images?.find(img => img.isCover) || event.images?.[0];
  const categoryColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.default;

  const formatEventDate = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (!end || start.toDateString() === end.toDateString()) {
      return format(start, "d 'de' MMMM, yyyy", { locale: es });
    }

    return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM, yyyy", { locale: es })}`;
  };

  const getMinPrice = () => {
    if (event.isFree) return 'Gratis';
    if (!event.tickets || event.tickets.length === 0) return null;

    const prices = event.tickets
      .filter(t => !t.isFree)
      .map(t => parseFloat(t.price));

    if (prices.length === 0) return 'Gratis';

    const minPrice = Math.min(...prices);
    return `Desde S/ ${minPrice.toFixed(2)}`;
  };

  const getLocationIcon = () => {
    if (event.locationType === 'virtual') return <Video size={16} className="text-gray-400" />;
    if (event.locationType === 'hybrid') return <MapPin size={16} className="text-gray-400" />;
    return <MapPin size={16} className="text-gray-400" />;
  };

  return (
    <Link to={`/events/${event.slug || event.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
        {/* Imagen */}
        <div className="relative h-48 overflow-hidden">
          {coverImage || event.coverImage ? (
            <img
              src={coverImage?.url || event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Calendar size={64} className="text-primary/30" />
            </div>
          )}

          {/* Badge de categoría */}
          <div className="absolute top-3 left-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
              {CATEGORY_LABELS[event.category] || event.category}
            </span>
          </div>

          {/* Badge de tipo de ubicación */}
          {event.locationType === 'virtual' && (
            <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
              <Video size={12} />
              Virtual
            </div>
          )}
          {event.locationType === 'hybrid' && (
            <div className="absolute top-3 right-3 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Híbrido
            </div>
          )}

          {/* Badge de destacado */}
          {event.isFeatured && (
            <div className="absolute bottom-3 right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
              ⭐ Destacado
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Fecha */}
          <div className="flex items-center gap-2 text-sm text-primary font-semibold mb-2">
            <Calendar size={16} />
            <span>{formatEventDate(event.startDate, event.endDate)}</span>
          </div>

          {/* Título */}
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Descripción corta */}
          {event.shortDescription && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {event.shortDescription}
            </p>
          )}

          {/* Ubicación */}
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            {getLocationIcon()}
            <span className="line-clamp-1">
              {event.locationType === 'virtual'
                ? `Virtual - ${event.virtualPlatform || 'Online'}`
                : event.venueName || event.city
              }
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              {event.capacity && (
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{event.currentAttendees || 0}/{event.capacity}</span>
                </div>
              )}
            </div>

            {/* Precio */}
            <div className="text-right">
              {event.isFree ? (
                <span className="text-green-600 font-semibold">Gratis</span>
              ) : (
                <span className="text-gray-900 font-semibold">
                  {getMinPrice()}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {event.tags.slice(0, 3).map((tag, index) => (
                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

export default EventCard;
