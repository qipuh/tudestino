export const CANCELLATION_POLICIES = {
  STANDARD: 'standard',
  NON_REFUNDABLE: 'non_refundable',
  LONG_STAY: 'long_stay',
  FLEXIBLE: 'flexible',
  MODERATE: 'moderate',
  STRICT: 'strict',
};

export const CANCELLATION_POLICY_CONFIG = {
  [CANCELLATION_POLICIES.STANDARD]: {
    name: 'Estándar',
    description: 'Cancelación gratis hasta las 18:00 del día de llegada',
    discount: 0,
    freeUntilHours: 18, // Hours before check-in
    chargeFirstNight: true,
    charge24Hours: false,
  },
  [CANCELLATION_POLICIES.FLEXIBLE]: {
    name: 'Flexible',
    description: 'Cancelación gratis hasta 24 horas antes de la llegada',
    discount: 0,
    freeUntilHours: 24,
    chargeFirstNight: false,
    charge24Hours: false,
  },
  [CANCELLATION_POLICIES.MODERATE]: {
    name: 'Moderada',
    description: 'Cancelación gratis hasta 5 días antes de la llegada',
    discount: 0,
    freeUntilDays: 5,
    chargeFirstNight: true,
    charge24Hours: false,
  },
  [CANCELLATION_POLICIES.STRICT]: {
    name: 'Estricta',
    description: 'Cancelación gratis hasta 7 días antes de la llegada',
    discount: 0,
    freeUntilDays: 7,
    chargePercentage: 50, // 50% if cancelled after deadline
  },
  [CANCELLATION_POLICIES.NON_REFUNDABLE]: {
    name: 'No reembolsable',
    description: 'Tarifa reducida sin posibilidad de cancelación',
    discount: 10, // 10% discount
    freeUntilHours: 0,
    chargeFullAmount: true,
  },
  [CANCELLATION_POLICIES.LONG_STAY]: {
    name: 'Estancia larga (7+ noches)',
    description: 'Descuento por estancias de 7 noches o más',
    discount: 15, // 15% discount
    minimumNights: 7,
    freeUntilHours: 18,
    chargeFirstNight: true,
  },
};

export const getCancellationPolicyLabel = (policy) => {
  return CANCELLATION_POLICY_CONFIG[policy]?.name || policy;
};

export const getCancellationPolicyDescription = (policy) => {
  return CANCELLATION_POLICY_CONFIG[policy]?.description || '';
};
