import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useBusiness from '../hooks/useBusiness';
import useBusinessService from '../hooks/useBusinessService';
import useBusinessProperty from '../hooks/useBusinessProperty';
import ServiceCard from '../components/ServiceCard';
import { getImageUrl } from '../../../services/api';
import BusinessLayout from '../components/BusinessLayout';

const serviceTypes = [
  { value: 'property', label: 'Propiedad / Habitación', icon: '🏠', description: 'Alojamiento, habitaciones' },
  { value: 'restaurant', label: 'Restaurante', icon: '🍽️', description: 'Comidas, menú' },
  { value: 'entertainment', label: 'Entretenimiento', icon: '🎭', description: 'Shows, actividades' },
  { value: 'events', label: 'Eventos', icon: '🎉', description: 'Conferencias, bodas' },
  { value: 'tours', label: 'Tours', icon: '🗺️', description: 'Excursiones, paseos' },
  { value: 'transport', label: 'Transporte', icon: '🚗', description: 'Traslados, alquiler' },
  { value: 'spa', label: 'Spa', icon: '💆', description: 'Masajes, tratamientos' },
  { value: 'other', label: 'Otro', icon: '📦', description: 'Otros servicios' },
];

function BusinessServices() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { business, fetchBusiness } = useBusiness();
  const { services, loading, error, fetchServices, createService, updateService, deleteService } = useBusinessService();
  const { rooms, loading: loadingRooms, fetchBusinessProperty, deleteRoom, updateRoom } = useBusinessProperty();

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    serviceType: 'property',
    name: '',
    description: '',
    status: 'active',
    settings: {},
  });

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    name: '',
    roomType: 'double',
    quantity: 1,
    guestCapacity: 2,
    pricePerNight: '',
    amenities: [],
    isAvailable: true,
    images: []
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  // Debug: Detectar cambios en rooms
  useEffect(() => {
    console.log('[BusinessServices] Rooms state changed:', rooms);
  }, [rooms]);

  // Redirigir a página de menú si es restaurante
  useEffect(() => {
    if (business && business.businessType === 'restaurant') {
      navigate(`/business/${id}/menu`);
    }
  }, [business, id, navigate]);

  const loadData = async () => {
    console.log('[BusinessServices] Loading data for business:', id);
    const businessResult = await fetchBusiness(id);
    console.log('[BusinessServices] Business result:', businessResult);
    await fetchServices(id);
    // Si es hotel, cargar habitaciones
    if (businessResult?.data?.businessType === 'hotel') {
      console.log('[BusinessServices] Business is hotel, fetching property...');
      const propertyResult = await fetchBusinessProperty(id);
      console.log('[BusinessServices] Property result:', propertyResult);
    } else {
      console.log('[BusinessServices] Business type:', businessResult?.data?.businessType, '- Not a hotel');
    }
  };

  const resetForm = () => {
    setFormData({
      serviceType: 'property',
      name: '',
      description: '',
      status: 'active',
      settings: {},
    });
    setEditingService(null);
  };

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceType: service.serviceType,
        name: service.name,
        description: service.description || '',
        status: service.status,
        settings: service.settings || {},
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Support nested settings fields (name starts with 'settings.')
    if (name.startsWith('settings.')) {
      const key = name.split('.')[1];
      const val = type === 'checkbox' ? checked : value;
      setFormData({
        ...formData,
        settings: {
          ...formData.settings,
          [key]: val,
        },
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Si es tipo property y no está editando, redirigir al flujo especializado
    if (!editingService && formData.serviceType === 'property') {
      navigate(`/business/${id}/property/create-rooms`);
      return;
    }

    if (editingService) {
      // Actualizar
      const result = await updateService(editingService.id, formData);
      if (result.success) {
        await fetchServices(id);
        handleCloseModal();
      }
    } else {
      // Crear
      const result = await createService(id, formData);
      if (result.success) {
        await fetchServices(id);
        handleCloseModal();
      }
    }
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) {
      return;
    }

    const result = await deleteService(serviceId);
    if (result.success) {
      await fetchServices(id);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta habitación?')) {
      return;
    }

    const result = await deleteRoom(roomId);
    if (result.success) {
      await loadData();
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    // Cargar todos los datos de la habitación en el formulario
    setRoomFormData({
      name: room.name || '',
      roomType: room.roomType || 'double',
      quantity: room.quantity || 1,
      guestCapacity: room.guestCapacity || 2,
      pricePerNight: room.pricePerNight || '',
      amenities: room.amenities || [],
      isAvailable: room.isAvailable !== undefined ? room.isAvailable : true,
      images: room.images || []
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;

    const result = await updateRoom(editingRoom.id, roomFormData);

    if (result.success) {
      setShowRoomModal(false);
      setEditingRoom(null);
      setRoomFormData({
        name: '',
        roomType: 'double',
        quantity: 1,
        guestCapacity: 2,
        pricePerNight: '',
        amenities: [],
        isAvailable: true,
        images: []
      });
      await loadData();
    }
  };

  const handleRoomFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRoomFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setRoomFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  console.log('[BusinessServices] Render - business type:', business.businessType);
  console.log('[BusinessServices] Render - rooms count:', rooms.length);
  console.log('[BusinessServices] Render - rooms:', rooms);

  return (
    <BusinessLayout activeMenu="services">
      <div>
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {business.businessType === 'hotel' ? 'Habitaciones' : 'Servicios'}
              </h1>
              <p className="text-gray-600 mt-1">
                {business.businessType === 'hotel'
                  ? 'Gestiona las habitaciones de tu hotel'
                  : 'Gestiona los servicios que ofrece tu negocio'
                }
              </p>
            </div>
            <button
              onClick={() => {
                if (business.businessType === 'hotel') {
                  navigate(`/business/${id}/property/create-rooms`);
                } else {
                  handleOpenModal();
                }
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark font-medium flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              <span>{business.businessType === 'hotel' ? 'Agregar Habitaciones' : 'Agregar Servicio'}</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && services.length === 0 && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando servicios...</p>
          </div>
        )}

        {/* Empty State - Para hoteles mostrar habitaciones si no hay servicios */}
        {!loading && !loadingRooms && services.length === 0 && business?.businessType === 'hotel' && rooms.length === 0 && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">🛏️</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              No hay habitaciones registradas
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Agrega habitaciones para que los huéspedes puedan reservar en tu hotel
            </p>
            <button
              onClick={() => navigate(`/business/${id}/property/create-rooms`)}
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark font-medium"
            >
              Agregar Habitaciones
            </button>
          </div>
        )}

        {/* Empty State - Para otros negocios */}
        {!loading && services.length === 0 && business?.businessType !== 'hotel' && (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">
              No hay servicios registrados
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Agrega servicios para que los usuarios puedan reservar o solicitar información
            </p>
            <button
              onClick={() => handleOpenModal()}
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary-dark font-medium"
            >
              Agregar Primer Servicio
            </button>
          </div>
        )}

        {/* Rooms Grid - Para hoteles */}
        {business?.businessType === 'hotel' && rooms.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Habitaciones ({rooms.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div key={room.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                  {/* Room Image */}
                  <div className="relative h-48 bg-gray-200">
                    {room.images && room.images.length > 0 ? (
                      <img
                        src={getImageUrl(`/uploads/rooms/${room.images[0]}`)}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-6xl">
                        🛏️
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                      S/. {room.pricePerNight}/noche
                    </div>
                  </div>

                  {/* Room Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{room.name}</h3>

                    <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <span>🛏️ {room.quantity} habitación{room.quantity !== 1 ? 'es' : ''}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥 {room.guestCapacity} huésped{room.guestCapacity !== 1 ? 'es' : ''} por habitación</span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-primary">
                        <span>👥 Total: {room.quantity * room.guestCapacity} huéspedes</span>
                      </div>
                    </div>

                    {room.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {room.description}
                      </p>
                    )}

                    {/* Amenities */}
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {amenity}
                          </span>
                        ))}
                        {room.amenities.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{room.amenities.length - 3} más
                          </span>
                        )}
                      </div>
                    )}

                    {/* Images count */}
                    {room.images && room.images.length > 1 && (
                      <div className="text-xs text-gray-500 mb-3">
                        📷 {room.images.length} fotos
                      </div>
                    )}

                    {/* Status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        room.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {room.isAvailable ? '✓ Disponible' : '✗ No disponible'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="flex-1 border border-red-500 text-red-600 py-2 px-4 rounded-lg hover:bg-red-50 transition text-sm font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Services Grid */}
        {services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-2">
            💡 Tipos de Servicios
          </h3>
          <p className="text-blue-800 text-sm mb-4">
            Cada tipo de servicio tiene configuraciones específicas:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {serviceTypes.map((type) => (
              <div key={type.value} className="flex items-center gap-2">
                <span className="text-xl">{type.icon}</span>
                <div>
                  <span className="font-medium text-blue-900">{type.label}:</span>{' '}
                  <span className="text-blue-700">{type.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Create/Edit Service */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Servicio *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {serviceTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                            formData.serviceType === type.value
                              ? 'border-primary bg-primary bg-opacity-5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="serviceType"
                            value={type.value}
                            checked={formData.serviceType === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          <span className="text-2xl">{type.icon}</span>
                          <span className="text-sm font-medium">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre del Servicio *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Ej: Habitación Doble Superior"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Describe el servicio..."
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="active">Activo</option>
                      <option value="draft">Borrador</option>
                      <option value="inactive">Inactivo</option>
                      <option value="under_maintenance">En mantenimiento</option>
                    </select>
                  </div>

                  {/* Settings (JSON) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Configuración (JSON opcional)
                    </label>
                    <textarea
                      name="settings"
                      value={JSON.stringify(formData.settings, null, 2)}
                      onChange={(e) => {
                        try {
                          const settings = JSON.parse(e.target.value);
                          setFormData({ ...formData, settings });
                        } catch (err) {
                          // Invalid JSON, ignore
                        }
                      }}
                      rows="5"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary font-mono text-sm"
                      placeholder='{"price": 100, "capacity": 2}'
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Configuración específica del servicio en formato JSON
                    </p>
                  </div>

                  {/* Property-specific fields (habitaciones) */}
                  {formData.serviceType === 'property' && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h4 className="text-sm font-medium mb-3">Opciones para habitaciones</h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Nombre de la habitación</label>
                          <input
                            type="text"
                            name="settings.roomName"
                            value={formData.settings?.roomName || ''}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Habitación Doble Superior"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Tipo de cama</label>
                          <select
                            name="settings.bedType"
                            value={formData.settings?.bedType || 'double'}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="single">Individual</option>
                            <option value="double">Doble</option>
                            <option value="queen">Queen</option>
                            <option value="king">King</option>
                            <option value="bunk">Litera</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Cantidad de camas</label>
                          <input
                            type="number"
                            min="1"
                            name="settings.bedCount"
                            value={formData.settings?.bedCount || 1}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Ocupación máxima</label>
                          <input
                            type="number"
                            min="1"
                            name="settings.occupancy"
                            value={formData.settings?.occupancy || 2}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="privateBathroom"
                            name="settings.privateBathroom"
                            checked={!!formData.settings?.privateBathroom}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <label htmlFor="privateBathroom" className="text-sm text-gray-700">Baño privado</label>
                        </div>

                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="hotWater"
                            name="settings.hotWater"
                            checked={!!formData.settings?.hotWater}
                            onChange={handleChange}
                            className="h-4 w-4"
                          />
                          <label htmlFor="hotWater" className="text-sm text-gray-700">Agua caliente</label>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm text-gray-700 mb-1">Servicios / Amenities (separados por comas)</label>
                          <input
                            type="text"
                            name="settings.amenities"
                            value={Array.isArray(formData.settings?.amenities) ? (formData.settings.amenities || []).join(', ') : (formData.settings?.amenities || '')}
                            onChange={(e) => {
                              const raw = e.target.value;
                              const arr = raw.split(',').map(s => s.trim()).filter(Boolean);
                              setFormData({
                                ...formData,
                                settings: {
                                  ...formData.settings,
                                  amenities: arr,
                                }
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="WiFi, Desayuno, TV, Aire Acondicionado"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear Servicio'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Room */}
      {showRoomModal && editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-3xl w-full my-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Editar Habitación</h2>
                <button
                  onClick={() => {
                    setShowRoomModal(false);
                    setEditingRoom(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSaveRoom}>
                <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
                  {/* Name and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la habitación *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={roomFormData.name}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <select
                        name="roomType"
                        value={roomFormData.roomType}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      >
                        <option value="single">Individual</option>
                        <option value="double">Doble</option>
                        <option value="triple">Triple</option>
                        <option value="quad">Cuádruple</option>
                        <option value="suite">Suite</option>
                        <option value="family">Familiar</option>
                      </select>
                    </div>
                  </div>

                  {/* Quantity, Capacity, Price */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        min="1"
                        value={roomFormData.quantity}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacidad
                      </label>
                      <input
                        type="number"
                        name="guestCapacity"
                        min="1"
                        value={roomFormData.guestCapacity}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Precio (S/.) *
                      </label>
                      <input
                        type="number"
                        name="pricePerNight"
                        step="0.01"
                        min="0"
                        value={roomFormData.pricePerNight}
                        onChange={handleRoomFormChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Características de la habitación
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'tv', label: 'TV', icon: '📺' },
                        { value: 'wifi', label: 'WiFi', icon: '📶' },
                        { value: 'air_conditioning', label: 'Aire', icon: '❄️' },
                        { value: 'heating', label: 'Calefacción', icon: '🔥' },
                        { value: 'private_bathroom', label: 'Baño privado', icon: '🚿' },
                        { value: 'balcony', label: 'Balcón', icon: '🪟' },
                        { value: 'minibar', label: 'Minibar', icon: '🍷' },
                        { value: 'safe_box', label: 'Caja fuerte', icon: '🔒' },
                        { value: 'jacuzzi_tub', label: 'Jacuzzi', icon: '🛁' },
                      ].map((amenity) => (
                        <label
                          key={amenity.value}
                          className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition text-sm ${
                            roomFormData.amenities.includes(amenity.value)
                              ? 'border-primary bg-primary bg-opacity-5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={roomFormData.amenities.includes(amenity.value)}
                            onChange={() => handleAmenityToggle(amenity.value)}
                            className="sr-only"
                          />
                          <span>{amenity.icon}</span>
                          <span>{amenity.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Images */}
                  {roomFormData.images && roomFormData.images.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Imágenes actuales ({roomFormData.images.length})
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {roomFormData.images.map((img, idx) => (
                          <div key={idx} className="relative aspect-square">
                            <img
                              src={getImageUrl(`/uploads/rooms/${img}`)}
                              alt={`Imagen ${idx + 1}`}
                              className="w-full h-full object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Nota: Por ahora no puedes agregar o eliminar imágenes desde aquí. Contacta con soporte si necesitas cambiar las fotos.
                      </p>
                    </div>
                  )}

                  {/* Availability */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="isAvailable"
                      checked={roomFormData.isAvailable}
                      onChange={handleRoomFormChange}
                      className="h-5 w-5"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700 block">Disponible para reservas</span>
                      <span className="text-xs text-gray-500">Desactiva esta opción para ocultar temporalmente la habitación</span>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomModal(false);
                      setEditingRoom(null);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading || loadingRooms}
                    className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium disabled:opacity-50"
                  >
                    {loading || loadingRooms ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}

export default BusinessServices;
