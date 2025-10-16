import { ACCOMMODATION_TYPES, ACCOMMODATION_TYPE_LABELS, isMultiUnitType } from '@tudestino/shared';
import { Hotel, Home, Building, Bed } from 'lucide-react';

const ACCOMMODATION_ICONS = {
  [ACCOMMODATION_TYPES.APARTMENT]: Building,
  [ACCOMMODATION_TYPES.HOTEL]: Hotel,
  [ACCOMMODATION_TYPES.MOTEL]: Hotel,
  [ACCOMMODATION_TYPES.HOSTEL]: Building,
  [ACCOMMODATION_TYPES.ROOM]: Bed,
  [ACCOMMODATION_TYPES.HOUSE]: Home,
  [ACCOMMODATION_TYPES.VILLA]: Home,
  [ACCOMMODATION_TYPES.CABIN]: Home,
  [ACCOMMODATION_TYPES.RESORT]: Hotel,
  [ACCOMMODATION_TYPES.BED_AND_BREAKFAST]: Home,
  [ACCOMMODATION_TYPES.GUESTHOUSE]: Building,
};

function AccommodationTypeStep({ formData, updateFormData }) {
  const handleTypeSelect = (type) => {
    const multipleUnits = isMultiUnitType(type);
    updateFormData({
      accommodationType: type,
      multipleUnits,
      hotelName: multipleUnits ? formData.hotelName : '',
      hotelCategory: multipleUnits ? formData.hotelCategory : '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          ¿Qué tipo de alojamiento quieres registrar?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(ACCOMMODATION_TYPES).map(([key, value]) => {
            const Icon = ACCOMMODATION_ICONS[value] || Home;
            const isSelected = formData.accommodationType === value;
            return (
              <button
                key={value}
                onClick={() => handleTypeSelect(value)}
                className={`p-4 border-2 rounded-lg transition ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-primary/50'
                }`}
              >
                <Icon
                  size={32}
                  className={`mx-auto mb-2 ${
                    isSelected ? 'text-primary' : 'text-gray-400'
                  }`}
                />
                <p className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                  {ACCOMMODATION_TYPE_LABELS[value]}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {formData.multipleUnits && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-4">
            Información del {ACCOMMODATION_TYPE_LABELS[formData.accommodationType]}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del establecimiento *
              </label>
              <input
                type="text"
                value={formData.hotelName}
                onChange={(e) => updateFormData({ hotelName: e.target.value })}
                placeholder="Ej: Hotel Plaza Mayor"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría (estrellas)
              </label>
              <select
                value={formData.hotelCategory}
                onChange={(e) => updateFormData({ hotelCategory: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Sin categoría</option>
                <option value="1">⭐ 1 estrella</option>
                <option value="2">⭐⭐ 2 estrellas</option>
                <option value="3">⭐⭐⭐ 3 estrellas</option>
                <option value="4">⭐⭐⭐⭐ 4 estrellas</option>
                <option value="5">⭐⭐⭐⭐⭐ 5 estrellas</option>
              </select>
            </div>
          </div>
          <p className="mt-3 text-sm text-blue-700">
            ℹ️ Podrás agregar múltiples habitaciones en el paso 5
          </p>
        </div>
      )}

      {!formData.accommodationType && (
        <p className="text-sm text-gray-500 italic">
          Selecciona un tipo de alojamiento para continuar
        </p>
      )}
    </div>
  );
}

export default AccommodationTypeStep;
