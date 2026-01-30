import { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

// Tipos de habitación con iconos
const roomTypes = [
  { value: 'single', label: 'Individual', icon: 'bed-outline', color: 'text-blue-600', bgColor: 'bg-blue-50', defaultCapacity: 1 },
  { value: 'double', label: 'Doble', icon: 'bed-outline', color: 'text-green-600', bgColor: 'bg-green-50', defaultCapacity: 2 },
  { value: 'twin', label: 'Twin', icon: 'albums-outline', color: 'text-purple-600', bgColor: 'bg-purple-50', defaultCapacity: 2 },
  { value: 'triple', label: 'Triple', icon: 'people-outline', color: 'text-orange-600', bgColor: 'bg-orange-50', defaultCapacity: 3 },
  { value: 'quad', label: 'Cuádruple', icon: 'people-outline', color: 'text-red-600', bgColor: 'bg-red-50', defaultCapacity: 4 },
  { value: 'suite', label: 'Suite', icon: 'diamond-outline', color: 'text-amber-600', bgColor: 'bg-amber-50', defaultCapacity: 2 },
  { value: 'junior_suite', label: 'Junior Suite', icon: 'star-outline', color: 'text-yellow-600', bgColor: 'bg-yellow-50', defaultCapacity: 2 },
  { value: 'family', label: 'Familiar', icon: 'home-outline', color: 'text-pink-600', bgColor: 'bg-pink-50', defaultCapacity: 4 },
  { value: 'deluxe', label: 'Deluxe', icon: 'sparkles-outline', color: 'text-indigo-600', bgColor: 'bg-indigo-50', defaultCapacity: 2 },
  { value: 'penthouse', label: 'Penthouse', icon: 'business-outline', color: 'text-cyan-600', bgColor: 'bg-cyan-50', defaultCapacity: 4 },
  { value: 'studio', label: 'Estudio', icon: 'cube-outline', color: 'text-teal-600', bgColor: 'bg-teal-50', defaultCapacity: 2 },
  { value: 'apartment', label: 'Apartamento', icon: 'apps-outline', color: 'text-lime-600', bgColor: 'bg-lime-50', defaultCapacity: 4 },
];

// Tipos de cama
const bedTypes = [
  { value: 'single', label: 'Cama Individual', icon: 'bed-outline', width: '90-100cm' },
  { value: 'double', label: 'Cama Doble', icon: 'bed-outline', width: '135-140cm' },
  { value: 'queen', label: 'Cama Queen', icon: 'bed-outline', width: '150-160cm' },
  { value: 'king', label: 'Cama King', icon: 'bed-outline', width: '180-200cm' },
  { value: 'sofa_bed', label: 'Sofá Cama', icon: 'apps-outline', width: 'Variable' },
  { value: 'bunk_bed', label: 'Litera', icon: 'albums-outline', width: '90cm' },
];

// Amenidades básicas
const basicAmenities = [
  { value: 'wifi', label: 'WiFi gratis', icon: 'wifi-outline' },
  { value: 'tv', label: 'TV', icon: 'tv-outline' },
  { value: 'air_conditioning', label: 'Aire acondicionado', icon: 'snow-outline' },
  { value: 'heating', label: 'Calefacción', icon: 'flame-outline' },
  { value: 'fan', label: 'Ventilador', icon: 'refresh-outline' },
  { value: 'desk', label: 'Escritorio', icon: 'laptop-outline' },
  { value: 'safe_box', label: 'Caja fuerte', icon: 'lock-closed-outline' },
  { value: 'minibar', label: 'Minibar', icon: 'wine-outline' },
  { value: 'coffee_maker', label: 'Cafetera', icon: 'cafe-outline' },
  { value: 'iron', label: 'Plancha', icon: 'arrow-down-outline' },
  { value: 'hairdryer', label: 'Secador de pelo', icon: 'flash-outline' },
];

// Amenidades de baño
const bathroomAmenities = [
  { value: 'private_bathroom', label: 'Baño privado', icon: 'water-outline' },
  { value: 'shared_bathroom', label: 'Baño compartido', icon: 'people-outline' },
  { value: 'hot_water', label: 'Agua caliente 24h', icon: 'thermometer-outline' },
  { value: 'shower', label: 'Ducha', icon: 'water-outline' },
  { value: 'bathtub', label: 'Bañera', icon: 'square-outline' },
  { value: 'jacuzzi', label: 'Jacuzzi', icon: 'ellipse-outline' },
  { value: 'toiletries', label: 'Artículos de aseo', icon: 'flower-outline' },
  { value: 'towels', label: 'Toallas', icon: 'document-outline' },
  { value: 'slippers', label: 'Pantuflas', icon: 'footsteps-outline' },
  { value: 'bathrobe', label: 'Bata de baño', icon: 'shirt-outline' },
];

// Vistas
const viewTypes = [
  { value: 'city', label: 'Vista a la ciudad', icon: 'business-outline' },
  { value: 'sea', label: 'Vista al mar', icon: 'water-outline' },
  { value: 'mountain', label: 'Vista a la montaña', icon: 'triangle-outline' },
  { value: 'garden', label: 'Vista al jardín', icon: 'leaf-outline' },
  { value: 'pool', label: 'Vista a la piscina', icon: 'water-outline' },
  { value: 'interior', label: 'Vista interior', icon: 'home-outline' },
  { value: 'street', label: 'Vista a la calle', icon: 'car-outline' },
];

// Opciones de comida
const mealOptions = [
  { value: 'none', label: 'Sin comidas incluidas', icon: 'close-circle-outline' },
  { value: 'breakfast', label: 'Desayuno incluido', icon: 'cafe-outline' },
  { value: 'half_board', label: 'Media pensión (desayuno + cena)', icon: 'restaurant-outline' },
  { value: 'full_board', label: 'Pensión completa (3 comidas)', icon: 'fast-food-outline' },
  { value: 'all_inclusive', label: 'Todo incluido', icon: 'infinite-outline' },
];

// Extras
const extraAmenities = [
  { value: 'balcony', label: 'Balcón', icon: 'square-outline' },
  { value: 'terrace', label: 'Terraza', icon: 'grid-outline' },
  { value: 'kitchen', label: 'Cocina', icon: 'restaurant-outline' },
  { value: 'kitchenette', label: 'Cocineta', icon: 'fast-food-outline' },
  { value: 'washing_machine', label: 'Lavadora', icon: 'refresh-circle-outline' },
  { value: 'soundproof', label: 'Insonorizada', icon: 'volume-mute-outline' },
  { value: 'smoking', label: 'Permitido fumar', icon: 'cloud-outline' },
  { value: 'non_smoking', label: 'No fumar', icon: 'ban-outline' },
  { value: 'wheelchair_accessible', label: 'Accesible para sillas de ruedas', icon: 'accessibility-outline' },
];

function CreateRoomsSimplified() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams();
  const propertyData = location.state?.propertyData || {};

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState({
    type: 'double',
    customName: '',
    quantity: 1,
    capacity: 2,
    pricePerNight: 0,
    beds: [{ type: 'double', quantity: 1 }],
    basicAmenities: ['wifi', 'tv', 'private_bathroom', 'hot_water'],
    bathroomAmenities: ['private_bathroom', 'hot_water', 'shower', 'towels'],
    view: 'interior',
    mealPlan: 'none',
    extras: [],
    description: '',
    images: [],
  });

  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'type') {
      const selectedType = roomTypes.find(t => t.value === value);
      setCurrentRoom({
        ...currentRoom,
        type: value,
        capacity: selectedType?.defaultCapacity || 2,
      });
    } else {
      setCurrentRoom({
        ...currentRoom,
        [name]: value,
      });
    }
  };

  const handleTypeSelect = (typeValue) => {
    const selectedType = roomTypes.find(t => t.value === typeValue);
    setCurrentRoom({
      ...currentRoom,
      type: typeValue,
      capacity: selectedType?.defaultCapacity || 2,
    });
  };

  const handleAmenityToggle = (category, amenity) => {
    const currentAmenities = currentRoom[category];
    const updated = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    setCurrentRoom({ ...currentRoom, [category]: updated });
  };

  // Manejo de camas
  const handleAddBed = () => {
    setCurrentRoom({
      ...currentRoom,
      beds: [...currentRoom.beds, { type: 'single', quantity: 1 }]
    });
  };

  const handleRemoveBed = (index) => {
    setCurrentRoom({
      ...currentRoom,
      beds: currentRoom.beds.filter((_, i) => i !== index)
    });
  };

  const handleBedChange = (index, field, value) => {
    const updatedBeds = [...currentRoom.beds];
    updatedBeds[index] = { ...updatedBeds[index], [field]: value };
    setCurrentRoom({ ...currentRoom, beds: updatedBeds });
  };

  // Drag and drop de imágenes
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const filesArray = Array.from(files);

    // Crear previsualizaciones inmediatas
    const newPreviews = [];
    for (const file of filesArray) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push({
            preview: reader.result,
            file: file,
            uploading: true
          });

          // Actualizar previews inmediatamente
          if (newPreviews.length === filesArray.filter(f => f.type.startsWith('image/')).length) {
            setCurrentRoom(prev => ({
              ...prev,
              images: [...prev.images, ...newPreviews]
            }));

            // Subir archivos
            uploadFiles(newPreviews);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const uploadFiles = async (previews) => {
    const token = localStorage.getItem('token');

    for (let i = 0; i < previews.length; i++) {
      const preview = previews[i];
      const formData = new FormData();
      formData.append('image', preview.file);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/upload/rooms/single`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const result = await response.json();

        if (result.success && result.data && result.data.url) {
          // Reemplazar preview con URL real
          // La URL ya viene como /uploads/rooms/filename.jpg
          // El servidor sirve las imágenes desde http://localhost:3000/uploads (sin /api)
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          const imageUrl = `${baseUrl}${result.data.url}`;

          setCurrentRoom(prev => ({
            ...prev,
            images: prev.images.map(img =>
              img.preview === preview.preview
                ? imageUrl
                : img
            )
          }));
        } else {
          throw new Error(result.message || 'Error al subir imagen');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        alert(`Error al subir imagen: ${error.message}`);
        // Remover preview si falla
        setCurrentRoom(prev => ({
          ...prev,
          images: prev.images.filter(img => img.preview !== preview.preview)
        }));
      }
    }
  };

  const handleRemoveImage = (index) => {
    setCurrentRoom({
      ...currentRoom,
      images: currentRoom.images.filter((_, i) => i !== index)
    });
  };

  const handleAddRoom = () => {
    if (!currentRoom.pricePerNight) {
      alert('Por favor completa el precio de la habitación');
      return;
    }

    if (currentRoom.beds.length === 0) {
      alert('Agrega al menos un tipo de cama');
      return;
    }

    setRooms([...rooms, currentRoom]);

    // Reset form
    setCurrentRoom({
      type: 'double',
      customName: '',
      quantity: 1,
      capacity: 2,
      pricePerNight: 0,
      beds: [{ type: 'double', quantity: 1 }],
      basicAmenities: ['wifi', 'tv', 'private_bathroom', 'hot_water'],
      bathroomAmenities: ['private_bathroom', 'hot_water', 'shower', 'towels'],
      view: 'interior',
      mealPlan: 'none',
      extras: [],
      description: '',
      images: [],
    });
  };

  const handleDeleteRoom = (index) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSubmitAll = async () => {
    if (rooms.length === 0) {
      alert('Debes agregar al menos una habitación');
      return;
    }

    try {
      const completeData = {
        ...propertyData,
        rooms: rooms,
      };

      console.log('Datos completos para enviar:', completeData);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/businesses/${businessId}/properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(completeData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la propiedad');
      }

      alert('¡Propiedad y habitaciones creadas exitosamente!');
      navigate(`/business/${businessId}`);
    } catch (error) {
      console.error('Error al crear propiedad:', error);
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agregar Habitaciones</h1>
          <p className="text-gray-600 mt-2">
            Define los tipos de habitación que ofreces en tu alojamiento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 space-y-8">
              <h2 className="text-2xl font-bold">Nueva Habitación</h2>

              {/* Tipo de Habitación con Botones */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="bed-outline" className="text-xl text-primary"></ion-icon>
                  Tipo de habitación *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {roomTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleTypeSelect(type.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                        currentRoom.type === type.value
                          ? `${type.color.replace('text-', 'border-')} ring-2 ring-offset-2 ${type.color.replace('text-', 'ring-')} ${type.bgColor}`
                          : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        currentRoom.type === type.value ? type.bgColor : 'bg-gray-100'
                      }`}>
                        <ion-icon
                          name={type.icon}
                          className={`text-3xl ${currentRoom.type === type.value ? type.color : 'text-gray-500'}`}
                        ></ion-icon>
                      </div>
                      <span className={`text-sm font-semibold text-center ${
                        currentRoom.type === type.value ? type.color : 'text-gray-900'
                      }`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre personalizado (opcional)
                </label>
                <input
                  type="text"
                  name="customName"
                  value={currentRoom.customName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Ej: Suite Luna de Miel, Habitación Ejecutiva Premium..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dale un nombre único a tu habitación para destacarla
                </p>
              </div>

              {/* Configuración de Camas */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-base font-semibold text-gray-900 flex items-center gap-2">
                    <ion-icon name="bed-outline" className="text-xl text-primary"></ion-icon>
                    Configuración de camas *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddBed}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark text-sm"
                  >
                    <ion-icon name="add-circle-outline"></ion-icon>
                    Agregar cama
                  </button>
                </div>

                <div className="space-y-3">
                  {currentRoom.beds.map((bed, index) => (
                    <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg">
                      <select
                        value={bed.type}
                        onChange={(e) => handleBedChange(index, 'type', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      >
                        {bedTypes.map((bedType) => (
                          <option key={bedType.value} value={bedType.value}>
                            {bedType.label} ({bedType.width})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={bed.quantity}
                        onChange={(e) => handleBedChange(index, 'quantity', parseInt(e.target.value))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                      {currentRoom.beds.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBed(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <ion-icon name="trash-outline" className="text-xl"></ion-icon>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Precio y Cantidad */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio por noche (S/.) *
                  </label>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={currentRoom.pricePerNight}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    placeholder="150.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de habitaciones
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={currentRoom.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (huéspedes)
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={currentRoom.capacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Plan de comidas */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="restaurant-outline" className="text-xl text-primary"></ion-icon>
                  Plan de comidas
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mealOptions.map((meal) => (
                    <button
                      key={meal.value}
                      type="button"
                      onClick={() => setCurrentRoom({ ...currentRoom, mealPlan: meal.value })}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                        currentRoom.mealPlan === meal.value
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <ion-icon name={meal.icon} className="text-2xl text-primary"></ion-icon>
                      <span className="text-sm font-medium">{meal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de vista */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="eye-outline" className="text-xl text-primary"></ion-icon>
                  Vista de la habitación
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {viewTypes.map((view) => (
                    <button
                      key={view.value}
                      type="button"
                      onClick={() => setCurrentRoom({ ...currentRoom, view: view.value })}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                        currentRoom.view === view.value
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <ion-icon name={view.icon} className="text-2xl text-primary"></ion-icon>
                      <span className="text-xs text-center font-medium">{view.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenidades básicas */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="star-outline" className="text-xl text-primary"></ion-icon>
                  Amenidades básicas
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {basicAmenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        currentRoom.basicAmenities.includes(amenity.value)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentRoom.basicAmenities.includes(amenity.value)}
                        onChange={() => handleAmenityToggle('basicAmenities', amenity.value)}
                        className="sr-only"
                      />
                      <ion-icon name={amenity.icon} className="text-xl text-primary"></ion-icon>
                      <span className="text-sm flex-1">{amenity.label}</span>
                      {currentRoom.basicAmenities.includes(amenity.value) && (
                        <ion-icon name="checkmark-circle" className="text-xl text-primary"></ion-icon>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Amenidades de baño */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="water-outline" className="text-xl text-primary"></ion-icon>
                  Baño y amenidades
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bathroomAmenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        currentRoom.bathroomAmenities.includes(amenity.value)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentRoom.bathroomAmenities.includes(amenity.value)}
                        onChange={() => handleAmenityToggle('bathroomAmenities', amenity.value)}
                        className="sr-only"
                      />
                      <ion-icon name={amenity.icon} className="text-xl text-primary"></ion-icon>
                      <span className="text-sm flex-1">{amenity.label}</span>
                      {currentRoom.bathroomAmenities.includes(amenity.value) && (
                        <ion-icon name="checkmark-circle" className="text-xl text-primary"></ion-icon>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="add-circle-outline" className="text-xl text-primary"></ion-icon>
                  Extras y características especiales
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {extraAmenities.map((amenity) => (
                    <label
                      key={amenity.value}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${
                        currentRoom.extras.includes(amenity.value)
                          ? 'border-primary bg-primary bg-opacity-5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={currentRoom.extras.includes(amenity.value)}
                        onChange={() => handleAmenityToggle('extras', amenity.value)}
                        className="sr-only"
                      />
                      <ion-icon name={amenity.icon} className="text-xl text-primary"></ion-icon>
                      <span className="text-sm flex-1">{amenity.label}</span>
                      {currentRoom.extras.includes(amenity.value) && (
                        <ion-icon name="checkmark-circle" className="text-xl text-primary"></ion-icon>
                      )}
                    </label>
                  ))}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (opcional)
                </label>
                <textarea
                  name="description"
                  value={currentRoom.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  placeholder="Describe las características especiales de esta habitación..."
                />
              </div>

              {/* Drag and Drop de Imágenes */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ion-icon name="images-outline" className="text-xl text-primary"></ion-icon>
                  Fotografías de la habitación
                  <span className="text-sm font-normal text-gray-500">
                    ({currentRoom.images.length} imagen{currentRoom.images.length !== 1 ? 'es' : ''})
                  </span>
                </label>

                <div
                  className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                    dragActive
                      ? 'border-primary bg-primary bg-opacity-10 scale-105'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {dragActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary bg-opacity-10 rounded-lg border-2 border-primary">
                      <div className="text-center">
                        <ion-icon name="cloud-upload" className="text-7xl text-primary mb-2 animate-bounce"></ion-icon>
                        <p className="text-lg font-semibold text-primary">
                          Suelta las imágenes aquí
                        </p>
                      </div>
                    </div>
                  )}

                  <ion-icon
                    name="cloud-upload-outline"
                    className={`text-6xl mb-4 transition ${dragActive ? 'text-primary' : 'text-gray-400'}`}
                  ></ion-icon>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Arrastra y suelta tus imágenes aquí
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    o haz clic para seleccionar archivos (JPG, PNG, WebP)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark cursor-pointer transition"
                  >
                    <ion-icon name="images-outline" className="text-xl"></ion-icon>
                    Seleccionar imágenes
                  </label>
                  <p className="text-xs text-gray-500 mt-4">
                    Puedes agregar múltiples imágenes a la vez
                  </p>
                </div>

                {/* Preview de imágenes */}
                {currentRoom.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {currentRoom.images.map((image, index) => {
                      const isUploading = typeof image === 'object' && image.uploading;
                      const imageUrl = typeof image === 'string' ? image : image.preview;

                      return (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`Habitación ${index + 1}`}
                            className={`w-full h-32 object-cover rounded-lg border-2 ${
                              isUploading ? 'border-blue-400 opacity-70' : 'border-transparent'
                            }`}
                          />
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                              <div className="flex flex-col items-center gap-2">
                                <div className="animate-spin">
                                  <ion-icon name="cloud-upload-outline" className="text-3xl text-white"></ion-icon>
                                </div>
                                <span className="text-xs text-white font-medium">Subiendo...</span>
                              </div>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                            disabled={isUploading}
                          >
                            <ion-icon name="close-outline" className="text-lg"></ion-icon>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Botón Agregar */}
              <button
                type="button"
                onClick={handleAddRoom}
                className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary-dark font-semibold text-lg flex items-center justify-center gap-2"
              >
                <ion-icon name="add-circle-outline" className="text-2xl"></ion-icon>
                Agregar esta Habitación
              </button>
            </div>
          </div>

          {/* Lista de Habitaciones Agregadas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ion-icon name="list-outline" className="text-2xl text-primary"></ion-icon>
                Habitaciones ({rooms.length})
              </h2>

              {rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ion-icon name="bed-outline" className="text-6xl text-gray-300 mb-3"></ion-icon>
                  <p className="text-sm">Aún no has agregado habitaciones</p>
                </div>
              ) : (
                <div className="space-y-3 mb-6 max-h-[600px] overflow-y-auto">
                  {rooms.map((room, index) => {
                    const roomType = roomTypes.find(t => t.value === room.type);
                    return (
                      <div
                        key={index}
                        className="border-2 rounded-lg p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <ion-icon name={roomType?.icon} className={`text-2xl ${roomType?.color}`}></ion-icon>
                              <div className="font-bold text-gray-900">
                                {room.customName || roomType?.label}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center gap-1">
                                <ion-icon name="people-outline"></ion-icon>
                                {room.quantity} hab. • {room.capacity} huéspedes
                              </div>
                              <div className="flex items-center gap-1">
                                <ion-icon name="bed-outline"></ion-icon>
                                {room.beds.map(b => `${b.quantity}x ${bedTypes.find(bt => bt.value === b.type)?.label}`).join(', ')}
                              </div>
                              {room.mealPlan !== 'none' && (
                                <div className="flex items-center gap-1">
                                  <ion-icon name="restaurant-outline"></ion-icon>
                                  {mealOptions.find(m => m.value === room.mealPlan)?.label}
                                </div>
                              )}
                            </div>
                            <div className="text-xl font-bold text-primary mt-2">
                              S/. {room.pricePerNight}/noche
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRoom(index)}
                          className="w-full mt-2 text-sm bg-red-50 hover:bg-red-100 text-red-700 py-2 px-3 rounded-lg flex items-center justify-center gap-2"
                        >
                          <ion-icon name="trash-outline"></ion-icon>
                          Eliminar
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {rooms.length > 0 && (
                <button
                  type="button"
                  onClick={handleSubmitAll}
                  className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
                >
                  <ion-icon name="checkmark-circle-outline" className="text-2xl"></ion-icon>
                  Finalizar y Guardar Todo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomsSimplified;
