import { useState, useMemo, useEffect } from 'react';
import { MapPin, DollarSign, MapPinned, Loader2 } from 'lucide-react';
import {
  PROPERTY_AMENITY_LABELS,
  getAvailableAmenitiesByType,
  PROPERTY_AMENITY_CATEGORY_LABELS,
} from '@tudestino/shared';

const MAPBOX_TOKEN = 'pk.eyJ1IjoidHVkZXN0aW5vIiwiYSI6ImNtZ3lucTYzNjBjM3YybHBwdmlrNDF0Y24ifQ.p6uS0CGkHOhLxSE8ad8guw';

function AccommodationDataStep({ formData, updateFormData }) {
  const [parkingExpanded, setParkingExpanded] = useState(formData.parkingType === 'paid');
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState(null);

  const handleAddressChange = (field, value) => {
    updateFormData({
      address: {
        ...formData.address,
        [field]: value,
      },
    });
  };

  // Geocode address when key fields change
  useEffect(() => {
    const { street, city, state, country } = formData.address;

    // Only geocode if we have the essential fields
    if (!street || !city || !country) {
      return;
    }

    const geocodeAddress = async () => {
      setGeocoding(true);
      setGeocodeError(null);

      try {
        // Build the full address string
        const addressParts = [street, city, state, country].filter(Boolean);
        const fullAddress = addressParts.join(', ');

        // Call Mapbox Geocoding API
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        );

        if (!response.ok) {
          throw new Error('Error al geocodificar la dirección');
        }

        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [longitude, latitude] = data.features[0].center;

          updateFormData({
            address: {
              ...formData.address,
              latitude,
              longitude,
            },
          });

          console.log('✅ Dirección geocodificada:', { latitude, longitude });
        } else {
          setGeocodeError('No se pudo encontrar la ubicación. Verifica la dirección.');
        }
      } catch (error) {
        console.error('Error geocoding:', error);
        setGeocodeError('Error al buscar las coordenadas de la dirección');
      } finally {
        setGeocoding(false);
      }
    };

    // Debounce geocoding to avoid too many API calls
    const timeoutId = setTimeout(geocodeAddress, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.address.street, formData.address.city, formData.address.state, formData.address.country]);

  const handleAmenityToggle = (amenity) => {
    const amenities = formData.propertyAmenities || [];
    const newAmenities = amenities.includes(amenity)
      ? amenities.filter((a) => a !== amenity)
      : [...amenities, amenity];
    updateFormData({ propertyAmenities: newAmenities });
  };

  const handleParkingTypeChange = (type) => {
    updateFormData({
      parkingType: type,
      parkingDetails: type === 'paid' ? formData.parkingDetails : {}
    });
    setParkingExpanded(type === 'paid');
  };

  const handleParkingDetailChange = (field, value) => {
    updateFormData({
      parkingDetails: {
        ...formData.parkingDetails,
        [field]: value,
      },
    });
  };

  // Obtener amenities disponibles según el tipo de alojamiento
  const amenityCategories = useMemo(() => {
    const categories = getAvailableAmenitiesByType(formData.accommodationType);

    // Convertir a formato de grupos para el renderizado
    return Object.entries(categories).map(([categoryKey, amenities]) => ({
      title: PROPERTY_AMENITY_CATEGORY_LABELS[categoryKey],
      amenities,
    }));
  }, [formData.accommodationType]);

  return (
    <div className="space-y-8">
      {/* Nombre y Descripción */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información básica del alojamiento</h3>
          <p className="text-sm text-gray-600 mb-6">
            Esta información ayudará a los huéspedes a identificar y conocer tu propiedad.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del alojamiento *
            <span className="block text-xs font-normal text-gray-500 mt-1">
              Por ejemplo: "Departamento moderno en el centro", "Casa con vista al mar", "Habitación acogedora"
            </span>
          </label>
          <input
            type="text"
            value={formData.propertyName || ''}
            onChange={(e) => updateFormData({ propertyName: e.target.value })}
            placeholder="Ej: Apartamento céntrico con balcón"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
            required
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.propertyName ? `${formData.propertyName.length}/100 caracteres` : '0/100 caracteres'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del alojamiento *
            <span className="block text-xs font-normal text-gray-500 mt-1">
              Describe las características principales, ubicación, y lo que hace especial a tu alojamiento
            </span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Ej: Amplio departamento de 2 dormitorios ubicado en pleno centro de la ciudad. Cuenta con balcón, cocina equipada y WiFi de alta velocidad. A solo 5 minutos caminando de las principales atracciones turísticas..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base resize-vertical"
            rows={5}
            required
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description ? `${formData.description.length}/1000 caracteres` : '0/1000 caracteres'}
          </p>
        </div>
      </div>

      {/* Dirección */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Dirección del alojamiento</h3>
          {geocoding && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader2 size={16} className="animate-spin" />
              <span>Buscando coordenadas...</span>
            </div>
          )}
          {!geocoding && formData.address.latitude && formData.address.longitude && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <MapPinned size={16} />
              <span>Ubicación confirmada</span>
            </div>
          )}
        </div>
        {geocodeError && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            {geocodeError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calle y número *
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="Ej: Av. Libertador 1234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad *
            </label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="Ej: Buenos Aires"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado/Provincia *
            </label>
            <input
              type="text"
              value={formData.address.state}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              placeholder="Ej: CABA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País *
            </label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) => handleAddressChange('country', e.target.value)}
              placeholder="Ej: Argentina"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código Postal
            </label>
            <input
              type="text"
              value={formData.address.zipCode}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              placeholder="Ej: 1425"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Servicios del establecimiento */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Servicios y comodidades
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selecciona los servicios que ofrece tu alojamiento. Los servicios disponibles varían según el tipo de establecimiento.
        </p>
        <div className="space-y-6">
          {amenityCategories.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-medium text-gray-700 mb-3">{group.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {group.amenities.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.propertyAmenities?.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {PROPERTY_AMENITY_LABELS[amenity]}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desayuno */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desayuno</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="breakfast"
              checked={formData.breakfastIncluded === true}
              onChange={() => updateFormData({ breakfastIncluded: true })}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Incluye desayuno</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="breakfast"
              checked={formData.breakfastIncluded === false}
              onChange={() => updateFormData({ breakfastIncluded: false })}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">No incluye desayuno</span>
          </label>
        </div>
      </div>

      {/* Parking */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Estacionamiento</h3>
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parking"
                checked={formData.parkingType === 'no'}
                onChange={() => handleParkingTypeChange('no')}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">No hay estacionamiento disponible</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parking"
                checked={formData.parkingType === 'free'}
                onChange={() => handleParkingTypeChange('free')}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Estacionamiento gratis</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="parking"
                checked={formData.parkingType === 'paid'}
                onChange={() => handleParkingTypeChange('paid')}
                className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Estacionamiento de pago</span>
            </label>
          </div>

          {parkingExpanded && (
            <div className="ml-6 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={formData.parkingDetails.price || ''}
                      onChange={(e) => handleParkingDetailChange('price', e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por *
                  </label>
                  <select
                    value={formData.parkingDetails.pricePer || 'day'}
                    onChange={(e) => handleParkingDetailChange('pricePer', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="day">Día</option>
                    <option value="stay">Estancia completa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación *
                  </label>
                  <select
                    value={formData.parkingDetails.location || 'onsite'}
                    onChange={(e) => handleParkingDetailChange('location', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="onsite">Dentro del establecimiento</option>
                    <option value="offsite">Fuera del establecimiento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    value={formData.parkingDetails.type || 'private'}
                    onChange={(e) => handleParkingDetailChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="private">Privado</option>
                    <option value="public">Público</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccommodationDataStep;
