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

// Icono personalizado para propiedades
const createPropertyIcon = (price, isHovered = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${isHovered ? '#e91e63' : 'white'};
        color: ${isHovered ? 'white' : '#1f2937'};
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 14px;
        border: 2px solid ${isHovered ? '#c2185b' : '#e5e7eb'};
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        white-space: nowrap;
        transform: ${isHovered ? 'scale(1.1)' : 'scale(1)'};
        transition: all 0.2s;
      ">
        $${price}
      </div>
    `,
    iconSize: [60, 30],
    iconAnchor: [30, 30],
  });
};

// Componente para ajustar el mapa a los límites de las propiedades
function MapBounds({ properties }) {
  const map = useMap();

  useEffect(() => {
    if (properties.length > 0) {
      const validCoords = properties.filter(p => p.latitude && p.longitude);

      if (validCoords.length > 0) {
        const bounds = validCoords.map(p => [p.latitude, p.longitude]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [properties, map]);

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
  const [mapCenter, setMapCenter] = useState(center || [51.505, -0.09]); // Default: Londres
  const [mapZoom, setMapZoom] = useState(zoom);

  // Calcular centro basado en propiedades
  useEffect(() => {
    if (!center && properties.length > 0) {
      const validCoords = properties.filter(p => p.latitude && p.longitude);

      if (validCoords.length > 0) {
        const avgLat = validCoords.reduce((sum, p) => sum + p.latitude, 0) / validCoords.length;
        const avgLng = validCoords.reduce((sum, p) => sum + p.longitude, 0) / validCoords.length;
        setMapCenter([avgLat, avgLng]);
      }
    } else if (center) {
      setMapCenter(center);
    }
  }, [properties, center]);

  // Filtrar propiedades con coordenadas válidas
  const propertiesWithCoords = properties.filter(p => p.latitude && p.longitude);

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <Home className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-600">No hay propiedades con ubicación para mostrar</p>
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
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Ajustar mapa a las propiedades */}
      <MapBounds properties={propertiesWithCoords} />

      {/* Marcadores de propiedades */}
      {propertiesWithCoords.map((property) => {
        const isHovered = hoveredPropertyId === property.id;
        const isSelected = selectedPropertyId === property.id;

        return (
          <Marker
            key={property.id}
            position={[property.latitude, property.longitude]}
            icon={createPropertyIcon(property.basePrice, isHovered || isSelected)}
            eventHandlers={{
              click: () => onMarkerClick(property),
              mouseover: () => onMarkerHover(property.id),
              mouseout: () => onMarkerHover(null),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                {property.images && property.images[0] && (
                  <img
                    src={property.images[0]}
                    alt={property.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1">{property.title}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  {property.city}, {property.country}
                </p>

                {property.averageRating > 0 && (
                  <div className="flex items-center gap-1 mb-2">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">
                      {typeof property.averageRating === 'number'
                        ? property.averageRating.toFixed(1)
                        : property.averageRating}
                    </span>
                    <span className="text-xs text-gray-600">
                      ({property.ratingCount})
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-sm font-bold">
                  <DollarSign size={14} />
                  <span>${property.basePrice}</span>
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
