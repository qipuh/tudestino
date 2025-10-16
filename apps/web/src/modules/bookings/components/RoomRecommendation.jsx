import { useState } from 'react';
import { Lightbulb, Users, DollarSign, Check, ChevronDown, ChevronUp, Bed, Info } from 'lucide-react';
import { BED_TYPE_LABELS } from '@tudestino/shared';

function RoomRecommendation({ recommendations, onSelectRecommendation }) {
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [showGuestConfig, setShowGuestConfig] = useState(false);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const getBedDescription = (beds) => {
    if (!beds || beds.length === 0) return 'Sin especificar';
    return beds.map(bed => `${bed.count} ${BED_TYPE_LABELS[bed.type]}`).join(', ');
  };

  const getGuestDistribution = (roomDetail) => {
    const parts = [];
    if (roomDetail.couples > 0) {
      parts.push(`${roomDetail.couples} pareja${roomDetail.couples > 1 ? 's' : ''}`);
    }
    if (roomDetail.singles > 0) {
      parts.push(`${roomDetail.singles} persona${roomDetail.singles > 1 ? 's' : ''}`);
    }
    if (roomDetail.children > 0) {
      parts.push(`${roomDetail.children} niño${roomDetail.children > 1 ? 's' : ''}`);
    }
    return parts.join(' + ');
  };

  return (
    <div className="border-t pt-4 mt-4">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Lightbulb className="text-amber-600" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">
            Recomendaciones inteligentes
          </h3>
          <p className="text-sm text-gray-600">
            Hemos analizado las habitaciones disponibles y te sugerimos estas opciones óptimas para tu grupo.
          </p>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-3">
        {recommendations.slice(0, 3).map((recommendation, index) => {
          const isExpanded = expandedIndex === index;
          const isBest = index === 0;

          return (
            <div
              key={index}
              className={`
                border-2 rounded-xl overflow-hidden transition-all
                ${isBest ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'}
                ${isExpanded ? 'shadow-md' : 'shadow-sm hover:shadow-md'}
              `}
            >
              {/* Recommendation Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
                className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50/50 transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isBest && (
                      <span className="px-2 py-0.5 bg-primary text-white text-xs font-semibold rounded-full">
                        Mejor opción
                      </span>
                    )}
                    <span className="text-xs text-gray-600">
                      {recommendation.rooms.length} habitación{recommendation.rooms.length > 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1 text-gray-700">
                      <Users size={16} />
                      <span className="text-sm font-medium">
                        {recommendation.totalCapacity} huéspedes
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <DollarSign size={16} />
                      <span className="text-sm font-semibold">
                        ${recommendation.totalPrice.toFixed(2)}/noche
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      (${recommendation.pricePerPerson.toFixed(2)}/persona)
                    </span>
                  </div>

                  {/* Preview reasons */}
                  {!isExpanded && recommendation.reasons.length > 0 && (
                    <p className="text-xs text-gray-600">
                      {recommendation.reasons.slice(0, 2).join(' · ')}
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0 ml-4">
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t bg-white p-4 space-y-4">
                  {/* Room Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Bed size={16} />
                      Distribución de habitaciones
                    </h4>
                    <div className="space-y-3">
                      {recommendation.roomDetails.map((detail, roomIndex) => {
                        const roomLabel = detail.room.instanceNumber > 1
                          ? `${detail.room.name} #${detail.room.instanceNumber}`
                          : detail.room.name;

                        return (
                          <div
                            key={roomIndex}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm mb-1">
                                  {roomLabel}
                                </p>
                                <p className="text-xs text-gray-600 mb-1">
                                  {getBedDescription(detail.room.beds)}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-primary">
                                ${parseFloat(detail.room.pricePerNight).toFixed(2)}
                              </span>
                            </div>

                            {/* Guest assignment */}
                            <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200">
                              <Users size={14} className="text-gray-600" />
                              <span className="text-xs text-gray-700">
                                {getGuestDistribution(detail)}
                              </span>
                            </div>

                            {/* Room reasons */}
                            {detail.reasons.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {detail.reasons.map((reason, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <Check size={12} className="text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-gray-600">{reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Overall Reasons */}
                  {recommendation.reasons.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <Info size={16} />
                        ¿Por qué esta combinación?
                      </h4>
                      <ul className="space-y-1">
                        {recommendation.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="text-primary">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Select Button */}
                  <button
                    onClick={() => onSelectRecommendation(recommendation)}
                    className={`
                      w-full py-3 rounded-lg font-semibold text-white transition
                      ${isBest
                        ? 'bg-primary hover:bg-primary-dark'
                        : 'bg-gray-700 hover:bg-gray-800'
                      }
                    `}
                  >
                    {isBest ? 'Seleccionar esta opción' : 'Seleccionar combinación'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Info Note */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Nota:</strong> Las recomendaciones se basan en el número de huéspedes y la configuración de camas.
          Los precios mostrados son por noche por habitación.
        </p>
      </div>
    </div>
  );
}

export default RoomRecommendation;
