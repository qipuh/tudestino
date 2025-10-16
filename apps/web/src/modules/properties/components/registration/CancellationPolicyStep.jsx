import { CANCELLATION_POLICIES, CANCELLATION_POLICY_CONFIG } from '@tudestino/shared';
import { Info, Check } from 'lucide-react';

function CancellationPolicyStep({ formData, updateFormData }) {
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
        <Info className="text-blue-600 flex-shrink-0" size={20} />
        <div className="text-sm text-blue-900">
          <p className="font-semibold mb-1">Condiciones de cancelación</p>
          <p>Las condiciones se establecen a nivel de alojamiento. Cualquier cambio que hagas se aplicará al total de habitaciones que tengas.</p>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(CANCELLATION_POLICY_CONFIG).map(([key, config]) => {
          const isSelected = formData.cancellationPolicy === key;
          return (
            <button
              key={key}
              onClick={() => updateFormData({ cancellationPolicy: key })}
              className={`w-full text-left p-5 border-2 rounded-lg transition ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check size={16} className="text-white" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                      {config.name}
                    </h4>
                    {config.discount > 0 && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                        -{config.discount}% descuento
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{config.description}</p>

                  {/* Detalles específicos de la política */}
                  <div className="text-xs text-gray-500 space-y-1">
                    {config.freeUntilHours && (
                      <p>✓ Cancelación gratis hasta {config.freeUntilHours} horas antes del check-in</p>
                    )}
                    {config.freeUntilDays && (
                      <p>✓ Cancelación gratis hasta {config.freeUntilDays} días antes del check-in</p>
                    )}
                    {config.chargeFirstNight && (
                      <p>• Si cancela después del plazo, se cobra la primera noche</p>
                    )}
                    {config.chargeFullAmount && (
                      <p>• Sin posibilidad de reembolso en ningún momento</p>
                    )}
                    {config.minimumNights && (
                      <p>• Aplicable solo para reservas de {config.minimumNights}+ noches</p>
                    )}
                    {config.chargePercentage && (
                      <p>• Si cancela después del plazo, se cobra el {config.chargePercentage}% del total</p>
                    )}
                    {config.charge24Hours && (
                      <p>• Cancelaciones dentro de 24 horas no tienen cargo</p>
                    )}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          <span className="font-semibold">💡 Recomendación:</span> La política estándar ofrece un buen equilibrio entre flexibilidad para el huésped y protección para el anfitrión. Las políticas con descuento pueden atraer más reservas.
        </p>
      </div>
    </div>
  );
}

export default CancellationPolicyStep;
