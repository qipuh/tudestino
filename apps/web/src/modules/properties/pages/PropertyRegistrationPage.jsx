import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import AccommodationTypeStep from '../components/registration/AccommodationTypeStep';
import CancellationPolicyStep from '../components/registration/CancellationPolicyStep';
import AccommodationDataStep from '../components/registration/AccommodationDataStep';
import RulesStep from '../components/registration/RulesStep';
import RoomsStep from '../components/registration/RoomsStep';
import ReviewStep from '../components/registration/ReviewStep';
import api from '../../../services/api';

const STEPS = [
  { id: 1, name: 'Tipo de alojamiento', component: AccommodationTypeStep },
  { id: 2, name: 'Condiciones generales', component: CancellationPolicyStep },
  { id: 3, name: 'Datos del alojamiento', component: AccommodationDataStep },
  { id: 4, name: 'Normas', component: RulesStep },
  { id: 5, name: 'Habitaciones', component: RoomsStep },
  { id: 6, name: 'Revisión', component: ReviewStep },
];

function PropertyRegistrationPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Accommodation Type
    accommodationType: '',
    multipleUnits: false,
    hotelName: '',
    hotelCategory: '',

    // Step 2: Cancellation Policies
    cancellationPolicy: 'standard',

    // Step 3: Accommodation Data
    propertyName: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: null,
      longitude: null,
    },
    propertyAmenities: [],
    parkingType: 'no', // 'no', 'free', 'paid'
    parkingDetails: {
      price: '',
      pricePer: 'day', // 'day', 'stay'
      location: 'onsite', // 'onsite', 'offsite'
      type: 'private', // 'private', 'public'
    },
    breakfastIncluded: false,

    // Step 4: Rules
    checkInTime: '14:00',
    checkOutTime: '12:00',
    childrenAllowed: true,
    petsAllowed: 'no', // 'no', 'yes_free', 'yes_paid'
    petFee: '',

    // Step 5: Rooms
    rooms: [],

    // Verification
    emailVerified: false,
  });

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post('/properties/register', formData);

      if (response.success) {
        alert('¡Propiedad publicada exitosamente!');
        navigate('/host/properties');
      } else {
        throw new Error(response.message || 'Error al publicar la propiedad');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
      alert(error.response?.data?.message || error.message || 'Error al publicar la propiedad. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : step.id === currentStep
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.id < currentStep ? <Check size={20} /> : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center hidden sm:block ${
                      step.id === currentStep ? 'font-semibold text-primary' : 'text-gray-600'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {STEPS[currentStep - 1].name}
          </h2>
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Paso {currentStep} de {STEPS.length}
          </span>

          {currentStep < STEPS.length ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Siguiente
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Publicar alojamiento
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PropertyRegistrationPage;
