import { useState, useEffect, useRef } from 'react';
import { MapPin, Ruler, ExternalLink, MousePointer } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapSelector({ location = {}, distanceMarkers = {}, onChange }) {
  const [lat, setLat] = useState(location.latitude || '');
  const [lng, setLng] = useState(location.longitude || '');
  const [hasMarkers, setHasMarkers] = useState(distanceMarkers.enabled || false);
  const [startPoint, setStartPoint] = useState(distanceMarkers.startPoint || { lat: '', lng: '', name: '' });
  const [endPoint, setEndPoint] = useState(distanceMarkers.endPoint || { lat: '', lng: '', name: '' });
  const mapRef = useRef(null);

  // Default center (Cajamarca, Peru)
  const defaultCenter = [-7.1633, -78.5142];
  const center = (lat && lng) ? [parseFloat(lat), parseFloat(lng)] : defaultCenter;

  const handleLocationChange = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    onChange({
      location: { latitude: newLat, longitude: newLng },
      distanceMarkers: hasMarkers ? { enabled: true, startPoint, endPoint } : { enabled: false },
    });
  };

  const handleMapClick = (clickLat, clickLng) => {
    const roundedLat = clickLat.toFixed(6);
    const roundedLng = clickLng.toFixed(6);
    handleLocationChange(roundedLat, roundedLng);
  };

  const handleMarkersToggle = (enabled) => {
    setHasMarkers(enabled);
    onChange({
      location: { latitude: lat, longitude: lng },
      distanceMarkers: enabled ? { enabled: true, startPoint, endPoint } : { enabled: false },
    });
  };

  const handleStartPointChange = (field, value) => {
    const newStartPoint = { ...startPoint, [field]: value };
    setStartPoint(newStartPoint);
    onChange({
      location: { latitude: lat, longitude: lng },
      distanceMarkers: { enabled: hasMarkers, startPoint: newStartPoint, endPoint },
    });
  };

  const handleEndPointChange = (field, value) => {
    const newEndPoint = { ...endPoint, [field]: value };
    setEndPoint(newEndPoint);
    onChange({
      location: { latitude: lat, longitude: lng },
      distanceMarkers: { enabled: hasMarkers, startPoint, endPoint: newEndPoint },
    });
  };

  const getGoogleMapsUrl = () => {
    if (lat && lng) {
      return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    return null;
  };

  const calculateDistance = () => {
    if (!startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
      return null;
    }

    const R = 6371; // Radio de la Tierra en km
    const dLat = ((parseFloat(endPoint.lat) - parseFloat(startPoint.lat)) * Math.PI) / 180;
    const dLon = ((parseFloat(endPoint.lng) - parseFloat(startPoint.lng)) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((parseFloat(startPoint.lat) * Math.PI) / 180) *
        Math.cos((parseFloat(endPoint.lat) * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  };

  const distance = calculateDistance();

  return (
    <div className="space-y-6">
      {/* Main Location */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
          <MapPin size={18} className="text-blue-600" />
          Ubicación del Atractivo
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Latitud</label>
            <input
              type="number"
              step="0.0000001"
              value={lat}
              onChange={(e) => handleLocationChange(e.target.value, lng)}
              placeholder="-7.1633"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Longitud</label>
            <input
              type="number"
              step="0.0000001"
              value={lng}
              onChange={(e) => handleLocationChange(lat, e.target.value)}
              placeholder="-78.5142"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Google Maps Link */}
        {lat && lng && (
          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ExternalLink size={16} />
            Ver en Google Maps
          </a>
        )}

        {/* Interactive Map */}
        <div className="mt-4 rounded-lg overflow-hidden border-2 border-gray-300">
          <div className="bg-blue-50 px-3 py-2 border-b border-blue-200 flex items-center gap-2 text-sm text-blue-700">
            <MousePointer size={16} />
            <span>Haz clic en el mapa para establecer la ubicación</span>
          </div>
          <div style={{ height: '400px', width: '100%' }}>
            <MapContainer
              center={center}
              zoom={lat && lng ? 14 : 11}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onLocationSelect={handleMapClick} />
              {lat && lng && (
                <Marker position={[parseFloat(lat), parseFloat(lng)]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-semibold">Ubicación seleccionada</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Lat: {lat}<br />
                        Lng: {lng}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        </div>
      </div>

      {/* Distance Markers Toggle */}
      <div className="border-t pt-6">
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="hasMarkers"
            checked={hasMarkers}
            onChange={(e) => handleMarkersToggle(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="hasMarkers" className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
            <Ruler size={18} className="text-blue-600" />
            Marcar distancia (punto de inicio y fin)
          </label>
        </div>

        {hasMarkers && (
          <div className="space-y-6 pl-7">
            {/* Start Point */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Punto de Inicio
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Nombre del punto</label>
                  <input
                    type="text"
                    value={startPoint.name}
                    onChange={(e) => handleStartPointChange('name', e.target.value)}
                    placeholder="Ej: Entrada principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={startPoint.lat}
                      onChange={(e) => handleStartPointChange('lat', e.target.value)}
                      placeholder="-7.1633"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={startPoint.lng}
                      onChange={(e) => handleStartPointChange('lng', e.target.value)}
                      placeholder="-78.5142"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* End Point */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-sm font-medium text-red-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                Punto Final
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Nombre del punto</label>
                  <input
                    type="text"
                    value={endPoint.name}
                    onChange={(e) => handleEndPointChange('name', e.target.value)}
                    placeholder="Ej: Mirador principal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Latitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={endPoint.lat}
                      onChange={(e) => handleEndPointChange('lat', e.target.value)}
                      placeholder="-7.1633"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Longitud</label>
                    <input
                      type="number"
                      step="0.0000001"
                      value={endPoint.lng}
                      onChange={(e) => handleEndPointChange('lng', e.target.value)}
                      placeholder="-78.5142"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Distance Display */}
            {distance && (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distancia calculada:</span>
                  <span className="text-lg font-bold text-blue-600">{distance} km</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MapSelector;
