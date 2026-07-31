import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import servicesService from '../services/servicesService';

export default function ServiceForm({ businessId, initialData = null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    type: initialData?.type || 'amenity',
    price: initialData?.price || '',
    status: initialData?.status || 'active',
    settings: initialData?.settings ? JSON.stringify(initialData.settings) : '{}'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        settings: formData.settings ? JSON.parse(formData.settings) : {}
      };

      if (initialData?.id) {
        await servicesService.updateService(initialData.id, payload);
      } else {
        await servicesService.createService(businessId, payload);
      }

      navigate(`/businesses/${businessId}/services`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error guardando servicio');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">
            {initialData ? 'Editar Servicio' : 'Crear Servicio'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {/* Nombre */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Nombre</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: WiFi gratis"
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe el servicio..."
            />
          </div>

          {/* Tipo */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="amenity">Amenidad</option>
              <option value="food_item">Plato</option>
              <option value="addon">Complemento</option>
              <option value="activity">Actividad</option>
              <option value="ticket_type">Entrada</option>
              <option value="other">Otro</option>
            </select>
          </div>

          {/* Precio */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Precio (opcional)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
            />
          </div>

          {/* Estado */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="archived">Archivado</option>
            </select>
          </div>

          {/* Settings (JSON) */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Configuración (JSON)</label>
            <textarea
              name="settings"
              value={formData.settings}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder='{}'
            />
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Servicio'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
