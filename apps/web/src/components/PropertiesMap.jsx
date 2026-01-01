import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Home, Star, DollarSign } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado para propiedades (estilo Airbnb)
const createPropertyIcon = (price, isHovered = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${isHovered ? '#222222' : 'white'};
        color: ${isHovered ? 'white' : '#222222'};
        padding: 8px 14px;
        border-radius: 24px;
        font-weight: 600;
        font-size: 14px;
        border: 1px solid ${isHovered ? '#222222' : 'rgba(0,0,0,0.08)'};
        box-shadow: ${isHovered ? '0 6px 16px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.18)'};
        white-space: nowrap;
        transform: ${isHovered ? 'scale(1.05)' : 'scale(1)'};
        transition: all 0.2s ease;
        cursor: pointer;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        S/${price}
      </div>
    `,
    iconSize: [70, 36],
    iconAnchor: [35, 36],
  });
};

// Componente para ajustar el mapa a los límites de las propiedades
function MapBounds({ properties, initialized, setInitialized }) {
  const map = useMap();

  useEffect(() => {
    // Solo ajustar bounds UNA VEZ al cargar las propiedades
    if (!initialized && properties.length > 0) {
      const validCoords = properties.filter(p =>
        (p.latitude && p.longitude) || (p.addressLatitude && p.addressLongitude)
      );

      if (validCoords.length > 0) {
        const bounds = validCoords.map(p => [
          p.latitude || p.addressLatitude,
          p.longitude || p.addressLongitude
        ]);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        setInitialized(true);
      }
    }
  }, [properties, map, initialized, setInitialized]);

  return null;
}

/**
 * Mapa interactivo con marcadores de propiedades
 */
function PropertiesMap({
  properties = [],
  hoveredPropertyId = null,
  selectedPropertyId = null,
  onMarkerClick = () => {},
  onMarkerHover = () => {},
  center = null,
  zoom = 12
}) {
  const [mapCenter, setMapCenter] = useState(center || [-7.1619, -78.5128]); // Default: Cajamarca
  const [mapZoom, setMapZoom] = useState(zoom);
  const [initialized, setInitialized] = useState(false);

  // Calcular centro basado en propiedades SOLO una vez
  useEffect(() => {
    if (!initialized && !center && properties.length > 0) {
      const validCoords = properties.filter(p =>
        (p.latitude && p.longitude) || (p.addressLatitude && p.addressLongitude)
      );

      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, p) =>
          sum + (p.latitude || p.addressLatitude || 0), 0
        ) / validCoords.length;
        const avgLng = validCoords.reduce((sum, p) =>
          sum + (p.longitude || p.addressLongitude || 0), 0
        ) / validCoords.length;
        setMapCenter([avgLat, avgLng]);
      }
    } else if (center) {
      setMapCenter(center);
    }
  }, [properties, center, initialized]);

  // Filtrar propiedades con coordenadas válidas
  const propertiesWithCoords = properties.filter(p =>
    (p.latitude && p.longitude) || (p.addressLatitude && p.addressLongitude)
  );

  console.log('🗺️ PropertiesMap Debug:', {
    totalProperties: properties.length,
    propertiesWithCoords: propertiesWithCoords.length,
    sampleProperty: properties[0],
  });

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <Home className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-600">No hay propiedades con ubicación para mostrar</p>
          <p className="text-xs text-gray-400 mt-2">Total propiedades: {properties.length}</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={mapZoom}
      scrollWheelZoom={true}
      className="h-full w-full rounded-lg"
      style={{ height: '100%', minHeight: '400px' }}
      zoomControl={true}
      whenReady={() => setInitialized(false)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
        url="https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoidHVkZXN0aW5vIiwiYSI6ImNtZ3lucTYzNjBjM3YybHBwdmlrNDF0Y24ifQ.p6uS0CGkHOhLxSE8ad8guw"
        tileSize={512}
        zoomOffset={-1}
      />

      {/* Ajustar mapa a las propiedades */}
      <MapBounds
        properties={propertiesWithCoords}
        initialized={initialized}
        setInitialized={setInitialized}
      />

      {/* Marcadores de propiedades */}
      {propertiesWithCoords.map((property) => {
        const isHovered = hoveredPropertyId === property.id;
        const isSelected = selectedPropertyId === property.id;

        // Obtener coordenadas (con fallback a addressLatitude/addressLongitude)
        const lat = property.latitude || property.addressLatitude;
        const lng = property.longitude || property.addressLongitude;

        // Obtener precio (soporta múltiples formatos)
        const price = property.price ||  // Desde resultados de búsqueda
                     (property.rooms && property.rooms.length > 0 ? property.rooms[0].pricePerNight : null) || // Desde rooms
                     property.basePrice || // Desde basePrice
                     0;

        return (
          <Marker
            key={property.id}
            position={[lat, lng]}
            icon={createPropertyIcon(price, isHovered || isSelected)}
            eventHandlers={{
              click: () => onMarkerClick(property),
              mouseover: () => onMarkerHover(property.id),
              mouseout: () => onMarkerHover(null),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                {property.rooms && property.rooms[0] && property.rooms[0].images && property.rooms[0].images[0] && (
                  <img
                    src={property.rooms[0].images[0]}
                    alt={property.propertyName || property.hotelName}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1">
                  {property.name || property.propertyName || property.hotelName || `${property.accommodationType || 'Propiedad'} en ${property.addressCity || property.location?.city}`}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {property.addressCity || property.location?.city}, {property.addressCountry || property.location?.country}
                </p>

                {property.ratingAverage > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">
                      {typeof property.ratingAverage === 'number'
                        ? property.ratingAverage.toFixed(1)
                        : property.ratingAverage}
                    </span>
                    <span className="text-xs text-gray-600">
                      ({property.ratingCount || 0})
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm font-bold">
                  <DollarSign size={14} />
                  <span>S/{price}</span>
                  <span className="text-xs font-normal text-gray-600">/ noche</span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default PropertiesMap;
