import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import AccommodationTypeStep from '../components/registration/AccommodationTypeStep';
import CancellationPolicyStep from '../components/registration/CancellationPolicyStep';
import AccommodationDataStep from '../components/registration/AccommodationDataStep';
import RulesStep from '../components/registration/RulesStep';
import api from '../../../services/api';

function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Paso 1: Tipo de alojamiento
    accommodationType: '',
    multipleUnits: false,
    hotelName: '',
    hotelCategory: null,

    // Paso 2: Política de cancelación
    cancellationPolicy: 'standard',

    // Paso 3: Ubicación
    address: {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
      latitude: null,
      longitude: null,
    },

    // Paso 4: Servicios
    propertyAmenities: [],
    breakfastIncluded: false,
    parkingType: 'no',
    parkingDetails: null,

    // Paso 5: Normas
    checkInTime: '14:00',
    checkOutTime: '12:00',
    childrenAllowed: true,
    petsAllowed: 'no',
    petFee: null,
    petFeePer: null,
    additionalRules: '',
  });

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      const response = await api.get(`/properties/${id}/full`);
      const property = response.success ? response.data : response;

      // Convertir el formato de la base de datos al formato del formulario
      setFormData({
        accommodationType: property.accommodationType,
        multipleUnits: property.multipleUnits,
        hotelName: property.hotelName || '',
        hotelCategory: property.hotelCategory,
        cancellationPolicy: property.cancellationPolicy,
        address: {
          street: property.addressStreet,
          city: property.addressCity,
          state: property.addressState || '',
          country: property.addressCountry,
          zipCode: property.addressZipCode || '',
          latitude: property.addressLatitude,
          longitude: property.addressLongitude,
        },
        propertyAmenities: property.propertyAmenities || [],
        breakfastIncluded: property.breakfastIncluded,
        parkingType: property.parkingType,
        parkingDetails: property.parkingDetails,
        checkInTime: property.checkInTime?.substring(0, 5) || '14:00',
        checkOutTime: property.checkOutTime?.substring(0, 5) || '12:00',
        childrenAllowed: property.childrenAllowed,
        petsAllowed: property.petsAllowed,
        petFee: property.petFee,
        petFeePer: property.petFeePer,
        additionalRules: property.additionalRules || '',
      });
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('No se pudo cargar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Actualizar solo la configuración de la propiedad, sin tocar las habitaciones
      const response = await api.put(`/properties/${id}`, formData);

      if (response.success) {
        alert('¡Propiedad actualizada exitosamente!');
        navigate('/host/properties');
      }
    } catch (err) {
      console.error('Error updating property:', err);
      alert(err.response?.data?.message || 'Error al actualizar la propiedad');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: 1, title: 'Tipo de alojamiento' },
    { number: 2, title: 'Política de cancelación' },
    { number: 3, title: 'Ubicación y servicios' },
    { number: 4, title: 'Normas' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/host/properties" className="text-primary hover:underline">
            Volver a mis propiedades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/host/properties"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Volver a mis propiedades
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar propiedad</h1>
          <p className="text-gray-600 mt-1">
            Actualiza la configuración de tu establecimiento
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                      currentStep >= step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center ${
                      currentStep >= step.number ? 'text-primary font-medium' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition ${
                      currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          {currentStep === 1 && (
            <AccommodationTypeStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 2 && (
            <CancellationPolicyStep formData={formData} setFormData={setFormData} />
          )}
          {currentStep === 3 && (
            <AccommodationDataStep
              formData={formData}
              updateFormData={(updates) => setFormData({ ...formData, ...updates })}
            />
          )}
          {currentStep === 4 && (
            <RulesStep formData={formData} setFormData={setFormData} />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Guardar cambios
                </>
              )}
            </button>
          )}
        </div>

        {/* Note about rooms */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta página solo edita la configuración del establecimiento. Para
            gestionar las habitaciones (agregar, editar o eliminar), ve a{' '}
            <Link
              to={`/host/properties/${id}/rooms`}
              className="underline font-medium hover:text-blue-900"
            >
              Gestionar habitaciones
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default EditPropertyPage;
