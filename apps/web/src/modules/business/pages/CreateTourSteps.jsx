import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, ChevronLeft, X, Plus, Check, Upload, Image as ImageIcon } from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';
import TagInput from '../../../components/TagInput';

// Mapeo de categorías frontend (español) -> backend (inglés)
const categoryMap = {
  'Aventura': 'adventure',
  'Cultural': 'cultural',
  'Playa': 'beach',
  'Romántico': 'romantic',
  'Familia': 'family',
  'Naturaleza': 'nature',
  'Gastronómico': 'gastronomic',
  'Religioso': 'religious',
  'Deportivo': 'sports',
  'Otro': 'other'
};

const categoryMapReverse = Object.fromEntries(
  Object.entries(categoryMap).map(([k, v]) => [v, k])
);

const categories = Object.keys(categoryMap);

const serviceTypeMap = {
  'Privado': 'private',
  'Grupal': 'group',
  'Compartido': 'shared'
};

const serviceTypeMapReverse = Object.fromEntries(
  Object.entries(serviceTypeMap).map(([k, v]) => [v, k])
);

const serviceTypes = Object.keys(serviceTypeMap);

const difficultyMap = {
  'Fácil': 'easy',
  'Moderada': 'moderate',
  'Difícil': 'hard',
  'Experto': 'expert'
};

const difficultyMapReverse = Object.fromEntries(
  Object.entries(difficultyMap).map(([k, v]) => [v, k])
);

const difficulties = Object.keys(difficultyMap);
const currencies = ['USD', 'PEN', 'EUR'];

const steps = [
  { id: 1, title: 'Información Básica', description: 'Datos principales del tour' },
  { id: 2, title: 'Itinerario', description: 'Planifica día a día' },
  { id: 3, title: 'Servicios', description: 'Qué incluye el tour' },
  { id: 4, title: 'Precios', description: 'Tarifas y descuentos' },
  { id: 5, title: 'Logística', description: 'Horarios y encuentros' },
  { id: 6, title: 'Requisitos', description: 'Políticas y requisitos' },
  { id: 7, title: 'Finalizar', description: 'Revisar y publicar' }
];

function CreateTourSteps() {
  const { id: businessId, tourId } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Aventura', // Se guarda en español, se convierte al enviar
    serviceType: 'Grupal', // Se guarda en español, se convierte al enviar
    mainDestination: '',
    secondaryDestinations: [],
    durationDays: 1,
    durationNights: 0,
    shortDescription: '',
    fullDescription: '',
    coverImage: '',
    gallery: [],
    itinerary: [{ day: 1, title: '', description: '', activities: [] }],
    pointsOfInterest: [],
    includedActivities: [],
    accommodations: [],
    includedTransports: [],
    includes: {
      accommodation: false,
      meals: false,
      transport: false,
      guide: false,
      entranceFees: false,
      insurance: false
    },
    mealsIncluded: [],
    notIncluded: [],
    cancellationPolicy: '',
    requirements: [],
    guideLanguages: [],
    maxGroupSize: 20,
    basePricePerPerson: '',
    priceCurrency: 'USD',
    supplements: { single: '', highSeason: '', extraNight: '' },
    discounts: { children: '', groups: '', seniors: '' },
    meetingPoint: {
      address: '',
      coordinates: { lat: '', lng: '' },
      instructions: ''
    },
    departureTime: '',
    returnTime: '',
    operatingSeasons: [],
    departureDays: [],
    minimumPassengers: 2,
    difficulty: 'Moderada', // Se guarda en español, se convierte al enviar
    targetAudience: [],
    status: 'draft',
    internalNotes: ''
  });

  useEffect(() => {
    if (tourId) {
      setIsEditMode(true);
      loadTourData();
    }
  }, [tourId]);

  const loadTourData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/tours/${tourId}`);
      const tour = response.data;

      setFormData({
        name: tour.name || '',
        category: categoryMapReverse[tour.category] || 'Aventura',
        serviceType: serviceTypeMapReverse[tour.serviceType] || 'Grupal',
        mainDestination: tour.mainDestination || '',
        secondaryDestinations: tour.secondaryDestinations || [],
        durationDays: tour.durationDays || 1,
        durationNights: tour.durationNights || 0,
        shortDescription: tour.shortDescription || '',
        fullDescription: tour.fullDescription || '',
        coverImage: tour.coverImage || '',
        gallery: tour.gallery || [],
        itinerary: tour.itinerary || [{ day: 1, title: '', description: '', activities: [] }],
        pointsOfInterest: tour.pointsOfInterest || [],
        includedActivities: tour.includedActivities || [],
        accommodations: tour.accommodations || [],
        includedTransports: tour.includedTransports || [],
        includes: tour.includes || {
          accommodation: false,
          meals: false,
          transport: false,
          guide: false,
          entranceFees: false,
          insurance: false
        },
        mealsIncluded: tour.mealsIncluded || [],
        notIncluded: tour.notIncluded || [],
        cancellationPolicy: tour.cancellationPolicy || '',
        requirements: tour.requirements || [],
        guideLanguages: tour.guideLanguages || [],
        maxGroupSize: tour.maxGroupSize || 20,
        basePricePerPerson: tour.basePricePerPerson || '',
        priceCurrency: tour.priceCurrency || 'USD',
        supplements: tour.supplements || { single: '', highSeason: '', extraNight: '' },
        discounts: tour.discounts || { children: '', groups: '', seniors: '' },
        meetingPoint: tour.meetingPoint || {
          address: '',
          coordinates: { lat: '', lng: '' },
          instructions: ''
        },
        departureTime: tour.departureTime || '',
        returnTime: tour.returnTime || '',
        operatingSeasons: tour.operatingSeasons || [],
        departureDays: tour.departureDays || [],
        minimumPassengers: tour.minimumPassengers || 2,
        difficulty: difficultyMapReverse[tour.difficulty] || 'Moderada',
        targetAudience: tour.targetAudience || [],
        status: tour.status || 'draft',
        internalNotes: tour.internalNotes || ''
      });
    } catch (error) {
      console.error('Error loading tour:', error);
      setError('Error al cargar el tour');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      const parts = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parts[0]]: {
          ...prev[parts[0]],
          [parts[1]]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const handleItineraryChange = (index, field, value) => {
    const newItinerary = [...formData.itinerary];
    newItinerary[index] = {
      ...newItinerary[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const addItineraryDay = () => {
    setFormData(prev => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: '', description: '', activities: [] }
      ]
    }));
  };

  const removeItineraryDay = (index) => {
    if (formData.itinerary.length <= 1) return;
    const newItinerary = formData.itinerary.filter((_, i) => i !== index);
    newItinerary.forEach((day, i) => {
      day.day = i + 1;
    });
    setFormData(prev => ({ ...prev, itinerary: newItinerary }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.name && formData.mainDestination && formData.durationDays && formData.shortDescription;
      case 2:
        return formData.itinerary.length > 0;
      case 4:
        return formData.basePricePerPerson > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      if (validateStep(currentStep)) {
        setCurrentStep(currentStep + 1);
        window.scrollTo(0, 0);
      } else {
        setError('Por favor completa los campos requeridos antes de continuar');
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // Función para subir imagen de portada
  const handleCoverImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const response = await api.post('/upload/tours/single', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // La respuesta ya está procesada por el interceptor, así que accedemos directamente a data
      const filename = response.data?.filename || response.filename;
      setFormData(prev => ({ ...prev, coverImage: filename }));
    } catch (error) {
      console.error('Error uploading cover image:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error al subir la imagen de portada';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Función para subir imágenes de galería
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      setLoading(true);
      setError(null);
      const uploadedImages = [];

      for (const file of files) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', file);

        const response = await api.post('/upload/tours/single', uploadFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        // La respuesta ya está procesada por el interceptor
        const filename = response.data?.filename || response.filename;
        uploadedImages.push(filename);
      }

      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, ...uploadedImages]
      }));
    } catch (error) {
      console.error('Error uploading gallery images:', error);
      console.error('Error details:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Error al subir las imágenes de la galería';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar imagen de galería
  const removeGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convertir datos del frontend (español) al backend (inglés)
      const backendData = {
        ...formData,
        category: categoryMap[formData.category] || 'adventure',
        serviceType: serviceTypeMap[formData.serviceType] || 'group',
        difficulty: difficultyMap[formData.difficulty] || 'moderate'
      };

      if (isEditMode) {
        await api.put(`/tours/${tourId}`, backendData);
      } else {
        await api.post(`/businesses/${businessId}/tours`, backendData);
      }

      navigate(`/business/${businessId}/tours`);
    } catch (error) {
      console.error('Error saving tour:', error);
      setError(error.response?.data?.message || 'Error al guardar el tour');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo
          formData={formData}
          handleChange={handleChange}
          setFormData={setFormData}
          handleCoverImageUpload={handleCoverImageUpload}
          handleGalleryUpload={handleGalleryUpload}
          removeGalleryImage={removeGalleryImage}
        />;
      case 2:
        return <Step2Itinerary formData={formData} handleItineraryChange={handleItineraryChange} addItineraryDay={addItineraryDay} removeItineraryDay={removeItineraryDay} />;
      case 3:
        return <Step3Services formData={formData} handleChange={handleChange} setFormData={setFormData} />;
      case 4:
        return <Step4Pricing formData={formData} handleChange={handleChange} />;
      case 5:
        return <Step5Logistics formData={formData} handleChange={handleChange} setFormData={setFormData} />;
      case 6:
        return <Step6Requirements formData={formData} handleChange={handleChange} setFormData={setFormData} />;
      case 7:
        return <Step7Review formData={formData} handleChange={handleChange} />;
      default:
        return null;
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tour...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/business/${businessId}/tours`)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Editar Tour' : 'Crear Nuevo Tour'}
                </h1>
                <p className="text-gray-600 text-sm">
                  Paso {currentStep} de {steps.length}: {steps[currentStep - 1].description}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/business/${businessId}/tours`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check size={20} /> : step.id}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center hidden md:block ${
                      currentStep === step.id ? 'text-primary font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 transition ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 mt-6">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 sticky bottom-0 bg-gray-50 py-4 border-t">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
              >
                <ChevronLeft size={18} />
                Anterior
              </button>
            )}
            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium flex items-center justify-center gap-2"
              >
                Siguiente
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar Tour' : 'Publicar Tour'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Información Básica
function Step1BasicInfo({ formData, handleChange, setFormData, handleCoverImageUpload, handleGalleryUpload, removeGalleryImage }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Información Básica del Tour</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nombre del Tour *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Ej: Tour Místico Cusco - Machu Picchu 4D/3N"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Servicio *</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          >
            {serviceTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destino Principal *
        </label>
        <input
          type="text"
          name="mainDestination"
          value={formData.mainDestination}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Ej: Cusco, Perú"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Destinos Secundarios
        </label>
        <TagInput
          value={formData.secondaryDestinations}
          onChange={(value) => setFormData(prev => ({ ...prev, secondaryDestinations: value }))}
          placeholder="Escribe un destino y presiona Enter"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar cada destino</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duración (Días) *</label>
          <input
            type="number"
            name="durationDays"
            min="1"
            value={formData.durationDays}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duración (Noches) *</label>
          <input
            type="number"
            name="durationNights"
            min="0"
            value={formData.durationNights}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Corta *
        </label>
        <textarea
          name="shortDescription"
          value={formData.shortDescription}
          onChange={handleChange}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Breve descripción del tour (1-2 líneas)"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción Completa
        </label>
        <textarea
          name="fullDescription"
          value={formData.fullDescription}
          onChange={handleChange}
          rows="5"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Descripción detallada del tour..."
        />
      </div>

      {/* Imagen de Portada */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen de Portada
        </label>
        <div className="space-y-3">
          {formData.coverImage ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={getImageUrl(formData.coverImage, 'tours')}
                alt="Portada"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, coverImage: '' }))}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition bg-gray-50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click para subir</span> o arrastra y suelta
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCoverImageUpload}
              />
            </label>
          )}
        </div>
      </div>

      {/* Galería de Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Galería de Imágenes
        </label>
        <div className="space-y-3">
          {/* Grid de imágenes existentes */}
          {formData.gallery && formData.gallery.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {formData.gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={getImageUrl(image, 'tours')}
                    alt={`Galería ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botón para agregar más imágenes */}
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition bg-gray-50">
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Agregar imágenes</span>
              </p>
              <p className="text-xs text-gray-500">Puedes seleccionar múltiples</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

// Step 2: Itinerario
function Step2Itinerary({ formData, handleItineraryChange, addItineraryDay, removeItineraryDay }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Itinerario Detallado</h2>
        <button
          type="button"
          onClick={addItineraryDay}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark text-sm flex items-center gap-2"
        >
          <Plus size={16} />
          Agregar Día
        </button>
      </div>

      <div className="space-y-4">
        {formData.itinerary.map((day, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900">Día {day.day}</h3>
              {formData.itinerary.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItineraryDay(index)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Día
                </label>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => handleItineraryChange(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ej: Cusco - Valle Sagrado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción del Día
                </label>
                <textarea
                  value={day.description}
                  onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe las actividades del día"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actividades (separadas por comas)
                </label>
                <input
                  type="text"
                  value={day.activities?.join(', ') || ''}
                  onChange={(e) => {
                    const activities = e.target.value.split(',').map(a => a.trim()).filter(Boolean);
                    handleItineraryChange(index, 'activities', activities);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ej: Visita a ruinas, Almuerzo típico"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 3: Servicios Incluidos
function Step3Services({ formData, handleChange, setFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Servicios Incluidos</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Selecciona los servicios incluidos
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { key: 'accommodation', label: 'Alojamiento', icon: '🏨' },
            { key: 'meals', label: 'Comidas', icon: '🍽️' },
            { key: 'transport', label: 'Transporte', icon: '🚐' },
            { key: 'guide', label: 'Guía', icon: '👨‍🏫' },
            { key: 'entranceFees', label: 'Entradas', icon: '🎫' },
            { key: 'insurance', label: 'Seguro', icon: '🛡️' }
          ].map(service => (
            <label
              key={service.key}
              className={`flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition ${
                formData.includes[service.key]
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                name={`includes.${service.key}`}
                checked={formData.includes[service.key]}
                onChange={handleChange}
                className="sr-only"
              />
              <span className="text-2xl">{service.icon}</span>
              <span className="text-sm font-medium">{service.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comidas Incluidas
        </label>
        <TagInput
          value={formData.mealsIncluded}
          onChange={(value) => setFormData(prev => ({ ...prev, mealsIncluded: value }))}
          placeholder="Ej: Desayuno, Almuerzo, Cena"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          No Incluido
        </label>
        <TagInput
          value={formData.notIncluded}
          onChange={(value) => setFormData(prev => ({ ...prev, notIncluded: value }))}
          placeholder="Ej: Bebidas alcohólicas, Propinas"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>
    </div>
  );
}

// Step 4: Precios
function Step4Pricing({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Precios y Tarifas</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio Base por Persona *
          </label>
          <input
            type="number"
            name="basePricePerPerson"
            step="0.01"
            min="0"
            value={formData.basePricePerPerson}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Moneda *</label>
          <select
            name="priceCurrency"
            value={formData.priceCurrency}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          >
            {currencies.map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Suplementos (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Habitación Individual</label>
            <input
              type="number"
              name="supplements.single"
              step="0.01"
              min="0"
              value={formData.supplements.single}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Temporada Alta</label>
            <input
              type="number"
              name="supplements.highSeason"
              step="0.01"
              min="0"
              value={formData.supplements.highSeason}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Noche Extra</label>
            <input
              type="number"
              name="supplements.extraNight"
              step="0.01"
              min="0"
              value={formData.supplements.extraNight}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium text-gray-900 mb-3">Descuentos en % (Opcional)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Niños</label>
            <input
              type="number"
              name="discounts.children"
              step="0.01"
              min="0"
              max="100"
              value={formData.discounts.children}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Grupos</label>
            <input
              type="number"
              name="discounts.groups"
              step="0.01"
              min="0"
              max="100"
              value={formData.discounts.groups}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Tercera Edad</label>
            <input
              type="number"
              name="discounts.seniors"
              step="0.01"
              min="0"
              max="100"
              value={formData.discounts.seniors}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Logística
function Step5Logistics({ formData, handleChange, setFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Logística Operativa</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Punto de Encuentro
        </label>
        <input
          type="text"
          name="meetingPoint.address"
          value={formData.meetingPoint.address}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Ej: Plaza de Armas de Cusco"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Instrucciones del Punto de Encuentro
        </label>
        <textarea
          name="meetingPoint.instructions"
          value={formData.meetingPoint.instructions}
          onChange={handleChange}
          rows="2"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Detalles adicionales..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Salida</label>
          <input
            type="time"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Retorno</label>
          <input
            type="time"
            name="returnTime"
            value={formData.returnTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Días de Salida
        </label>
        <TagInput
          value={formData.departureDays}
          onChange={(value) => setFormData(prev => ({ ...prev, departureDays: value }))}
          placeholder="Ej: Lunes, Miércoles, Viernes"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mínimo de Pasajeros
          </label>
          <input
            type="number"
            name="minimumPassengers"
            min="1"
            value={formData.minimumPassengers}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño Máximo del Grupo
          </label>
          <input
            type="number"
            name="maxGroupSize"
            min="1"
            value={formData.maxGroupSize}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
}

// Step 6: Requisitos
function Step6Requirements({ formData, handleChange, setFormData }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Requisitos y Políticas</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nivel de Dificultad
        </label>
        <select
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
        >
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Requisitos
        </label>
        <TagInput
          value={formData.requirements}
          onChange={(value) => setFormData(prev => ({ ...prev, requirements: value }))}
          placeholder="Ej: Pasaporte vigente, Buena condición física"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idiomas del Guía
        </label>
        <TagInput
          value={formData.guideLanguages}
          onChange={(value) => setFormData(prev => ({ ...prev, guideLanguages: value }))}
          placeholder="Ej: Español, Inglés, Francés"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Público Objetivo
        </label>
        <TagInput
          value={formData.targetAudience}
          onChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}
          placeholder="Ej: Familias, Parejas, Aventureros"
        />
        <p className="text-xs text-gray-500 mt-1">Presiona Enter o coma para agregar</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Política de Cancelación
        </label>
        <textarea
          name="cancellationPolicy"
          value={formData.cancellationPolicy}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Describe la política de cancelación..."
        />
      </div>
    </div>
  );
}

// Step 7: Revisar y Finalizar
function Step7Review({ formData, handleChange }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Revisar y Publicar</h2>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">📋 Resumen del Tour</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Nombre:</strong> {formData.name || 'Sin nombre'}</p>
          <p><strong>Destino:</strong> {formData.mainDestination || 'Sin destino'}</p>
          <p><strong>Duración:</strong> {formData.durationDays}D/{formData.durationNights}N</p>
          <p><strong>Precio:</strong> {formData.priceCurrency} {formData.basePricePerPerson || '0'} por persona</p>
          <p><strong>Categoría:</strong> {formData.category}</p>
          <p><strong>Tipo:</strong> {formData.serviceType}</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado del Tour *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          required
        >
          <option value="draft">Borrador (no visible para clientes)</option>
          <option value="active">Activo (visible para clientes)</option>
          <option value="inactive">Inactivo</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas Internas (opcional)
        </label>
        <textarea
          name="internalNotes"
          value={formData.internalNotes}
          onChange={handleChange}
          rows="3"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
          placeholder="Notas privadas para uso interno..."
        />
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-900 mb-2">✅ Todo listo</h3>
        <p className="text-sm text-green-800">
          Haz clic en "Publicar Tour" para crear el tour. Podrás editarlo más tarde si es necesario.
        </p>
      </div>
    </div>
  );
}

export default CreateTourSteps;
