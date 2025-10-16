import {
  ACCOMMODATION_TYPE_LABELS,
  CANCELLATION_POLICY_CONFIG,
  PROPERTY_AMENITY_LABELS,
  ROOM_AMENITY_LABELS,
} from '@tudestino/shared';
import { MapPin, DollarSign, Clock, Check, AlertCircle } from 'lucide-react';

function ReviewStep({ formData }) {
  const getValidationErrors = () => {
    const errors = [];

    if (!formData.accommodationType) errors.push('Tipo de alojamiento no seleccionado');
    if (formData.multipleUnits && !formData.hotelName) errors.push('Nombre del establecimiento requerido');
    if (!formData.address.street || !formData.address.city || !formData.address.country) {
      errors.push('Dirección incompleta');
    }
    if (!formData.checkInTime || !formData.checkOutTime) errors.push('Horarios no configurados');
    if (formData.rooms.length === 0) errors.push('Debe configurar al menos una habitación');

    return errors;
  };

  const errors = getValidationErrors();
  const isValid = errors.length === 0;

  return (
    <div className="space-y-8">
      {/* Validation Status */}
      {!isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-red-900 mb-2">
                Faltan datos requeridos:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
              <p className="text-sm text-red-700 mt-3">
                Por favor regresa a los pasos anteriores para completar la información.
              </p>
            </div>
          </div>
        </div>
      )}

      {isValid && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <p className="text-sm text-green-900">
              ¡Perfecto! Tu alojamiento está listo para ser publicado. Revisa los detalles a continuación.
            </p>
          </div>
        </div>
      )}

      {/* Tipo de Alojamiento */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Alojamiento</h3>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Tipo:</span>{' '}
            {ACCOMMODATION_TYPE_LABELS[formData.accommodationType]}
          </p>
          {formData.multipleUnits && (
            <>
              <p className="text-gray-700">
                <span className="font-medium">Nombre:</span> {formData.hotelName}
              </p>
              {formData.hotelCategory && (
                <p className="text-gray-700">
                  <span className="font-medium">Categoría:</span>{' '}
                  {'⭐'.repeat(parseInt(formData.hotelCategory))}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Política de Cancelación */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Política de Cancelación</h3>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">
              {CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.name}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            {CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.description}
          </p>
          {CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.discount > 0 && (
            <p className="text-sm text-green-700 font-medium">
              -{CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.discount}% de descuento aplicado
            </p>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
        </div>
        <div className="space-y-1 text-gray-700">
          <p>{formData.address.street}</p>
          <p>
            {formData.address.city}, {formData.address.state} {formData.address.zipCode}
          </p>
          <p>{formData.address.country}</p>
        </div>
      </div>

      {/* Servicios */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Servicios del Establecimiento</h3>
        {formData.propertyAmenities?.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {formData.propertyAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2 text-sm text-gray-700">
                <Check size={16} className="text-green-600 flex-shrink-0" />
                <span>{PROPERTY_AMENITY_LABELS[amenity]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No se agregaron servicios</p>
        )}

        <div className="mt-4 pt-4 border-t space-y-2">
          <p className="text-sm text-gray-700">
            <span className="font-medium">Desayuno:</span>{' '}
            {formData.breakfastIncluded ? 'Incluido' : 'No incluido'}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-medium">Estacionamiento:</span>{' '}
            {formData.parkingType === 'no' && 'No disponible'}
            {formData.parkingType === 'free' && 'Gratis'}
            {formData.parkingType === 'paid' &&
              `De pago - $${formData.parkingDetails.price}/${formData.parkingDetails.pricePer === 'day' ? 'día' : 'estancia'}`}
          </p>
        </div>
      </div>

      {/* Normas */}
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Normas</h3>
        </div>
        <div className="space-y-2 text-gray-700">
          <p>
            <span className="font-medium">Check-in:</span> {formData.checkInTime}
          </p>
          <p>
            <span className="font-medium">Check-out:</span> {formData.checkOutTime}
          </p>
          <p>
            <span className="font-medium">Niños:</span>{' '}
            {formData.childrenAllowed ? 'Permitidos' : 'No permitidos'}
          </p>
          <p>
            <span className="font-medium">Mascotas:</span>{' '}
            {formData.petsAllowed === 'no' && 'No permitidas'}
            {formData.petsAllowed === 'yes_free' && 'Permitidas sin cargo'}
            {formData.petsAllowed === 'yes_paid' &&
              `Permitidas con cargo de $${formData.petFee}/${formData.petFeePer === 'day' ? 'día' : 'estancia'}`}
          </p>
          {formData.additionalRules && (
            <div className="mt-3 pt-3 border-t">
              <p className="font-medium mb-1">Normas adicionales:</p>
              <p className="text-sm text-gray-600">{formData.additionalRules}</p>
            </div>
          )}
        </div>
      </div>

      {/* Habitaciones */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Habitaciones ({formData.rooms.length})
        </h3>
        <div className="space-y-4">
          {formData.rooms.map((room, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{room.name}</h4>
                  <p className="text-sm text-gray-600">
                    Hasta {room.guestCapacity} huéspedes
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <DollarSign size={18} />
                  {room.pricePerNight}/noche
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-medium">Camas:</span>{' '}
                  {room.beds.map(bed => `${bed.count} ${bed.type}`).join(', ')}
                </p>

                {room.amenities.length > 0 && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">Amenidades:</p>
                    <div className="grid grid-cols-2 gap-1">
                      {room.amenities.slice(0, 6).map((amenity) => (
                        <div key={amenity} className="flex items-center gap-1 text-xs text-gray-600">
                          <Check size={12} className="text-green-600" />
                          <span>{ROOM_AMENITY_LABELS[amenity]}</span>
                        </div>
                      ))}
                      {room.amenities.length > 6 && (
                        <p className="text-xs text-gray-500">
                          +{room.amenities.length - 6} más
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-gray-700">
                  <span className="font-medium">Fotos:</span> {room.images.length}
                </p>
              </div>

              {/* Galería de fotos pequeña */}
              {room.images.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {room.images.slice(0, 4).map((image, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={image}
                      alt={`${room.name} - ${imgIndex + 1}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                  {room.images.length > 4 && (
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                      +{room.images.length - 4}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Resumen de precios */}
      {formData.rooms.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Resumen de Precios</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p>
              <span className="font-medium">Precio más bajo:</span> $
              {Math.min(...formData.rooms.map(r => parseFloat(r.pricePerNight || 0)))}/noche
            </p>
            <p>
              <span className="font-medium">Precio más alto:</span> $
              {Math.max(...formData.rooms.map(r => parseFloat(r.pricePerNight || 0)))}/noche
            </p>
            {CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.discount > 0 && (
              <p className="text-green-700 font-medium">
                * Los precios mostrados ya incluyen el descuento de{' '}
                {CANCELLATION_POLICY_CONFIG[formData.cancellationPolicy]?.discount}%
              </p>
            )}
          </div>
        </div>
      )}

      {/* Nota final */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          Al publicar este alojamiento, aceptas los{' '}
          <a href="#" className="text-primary hover:underline">
            Términos y Condiciones
          </a>{' '}
          de TuDestino y confirmas que toda la información proporcionada es precisa y verídica.
        </p>
      </div>
    </div>
  );
}

export default ReviewStep;
