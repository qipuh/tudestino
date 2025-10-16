import { Clock, Baby, PawPrint, DollarSign } from 'lucide-react';

function RulesStep({ formData, updateFormData }) {
  const handlePetsChange = (value) => {
    updateFormData({
      petsAllowed: value,
      petFee: value === 'yes_paid' ? formData.petFee : '',
    });
  };

  return (
    <div className="space-y-8">
      {/* Check-in / Check-out */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">Horarios de entrada y salida</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de check-in *
            </label>
            <input
              type="time"
              value={formData.checkInTime}
              onChange={(e) => updateFormData({ checkInTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Hora a partir de la cual los huéspedes pueden hacer check-in
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de check-out *
            </label>
            <input
              type="time"
              value={formData.checkOutTime}
              onChange={(e) => updateFormData({ checkOutTime: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Hora límite para que los huéspedes hagan check-out
            </p>
          </div>
        </div>
      </div>

      {/* Niños */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Baby className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">¿Aloja niños?</h3>
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="children"
              checked={formData.childrenAllowed === true}
              onChange={() => updateFormData({ childrenAllowed: true })}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Sí, se admiten niños</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="children"
              checked={formData.childrenAllowed === false}
              onChange={() => updateFormData({ childrenAllowed: false })}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">No se admiten niños</span>
          </label>
        </div>
        {formData.childrenAllowed && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              ℹ️ Tu alojamiento será más atractivo para familias. Considera ofrecer servicios adicionales como cunas o tronas.
            </p>
          </div>
        )}
      </div>

      {/* Mascotas */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <PawPrint className="text-primary" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">¿Admite mascotas?</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pets"
              checked={formData.petsAllowed === 'no'}
              onChange={() => handlePetsChange('no')}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">No se admiten mascotas</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pets"
              checked={formData.petsAllowed === 'yes_free'}
              onChange={() => handlePetsChange('yes_free')}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Sí, sin cargo adicional</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="pets"
              checked={formData.petsAllowed === 'yes_paid'}
              onChange={() => handlePetsChange('yes_paid')}
              className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
            />
            <span className="text-sm text-gray-700">Sí, con cargo adicional</span>
          </label>

          {formData.petsAllowed === 'yes_paid' && (
            <div className="ml-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo por mascota *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="number"
                    value={formData.petFee}
                    onChange={(e) => updateFormData({ petFee: e.target.value })}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <select
                  value={formData.petFeePer || 'stay'}
                  onChange={(e) => updateFormData({ petFeePer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="day">Por día</option>
                  <option value="stay">Por estancia</option>
                </select>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Este cargo se aplicará por cada mascota que traigan los huéspedes
              </p>
            </div>
          )}
        </div>
        {formData.petsAllowed !== 'no' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-900">
              ✅ Admitir mascotas puede aumentar tus reservas. Muchos viajeros buscan alojamientos pet-friendly.
            </p>
          </div>
        )}
      </div>

      {/* Normas adicionales */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Normas adicionales (opcional)</h3>
        <textarea
          value={formData.additionalRules || ''}
          onChange={(e) => updateFormData({ additionalRules: e.target.value })}
          placeholder="Ej: No se permiten fiestas, No fumar en el interior, Horario de silencio de 22:00 a 08:00"
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">
          Agrega cualquier norma adicional que los huéspedes deban conocer
        </p>
      </div>
    </div>
  );
}

export default RulesStep;
