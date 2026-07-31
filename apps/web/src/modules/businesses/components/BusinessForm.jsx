import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import businessesService from '../services/businessesService';

export default function BusinessForm({ initialData = null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    businessType: initialData?.businessType || 'accommodation',
    status: initialData?.status || 'draft',
    address: typeof initialData?.address === 'string'
      ? JSON.parse(initialData.address)
      : (initialData?.address || {}),
    logo: initialData?.logo || '',
    coverImage: initialData?.coverImage || ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const key = name.replace('address.', '');
      setFormData({
        ...formData,
        address: { ...formData.address, [key]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        address: JSON.stringify(formData.address)
      };

      if (initialData?.id) {
        await businessesService.updateBusiness(initialData.id, payload);
      } else {
        await businessesService.createBusiness(payload);
      }

      navigate('/businesses');
    } catch (err) {
      setError(err.response?.data?.message || 'Error guardando negocio');
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
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">
            {initialData ? 'Editar Negocio' : 'Crear Negocio'}
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
              placeholder="Ej: Mi Hotel"
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Describe tu negocio..."
            />
          </div>

          {/* Tipo de Negocio */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Tipo de Negocio</label>
            <select
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="accommodation">Alojamiento</option>
              <option value="restaurant">Restaurante</option>
              <option value="event">Evento</option>
              <option value="activity">Actividad</option>
              <option value="tour">Tour</option>
              <option value="other">Otro</option>
            </select>
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
              <option value="draft">Borrador</option>
              <option value="active">Activo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          {/* Dirección */}
          <fieldset className="mb-6 p-4 border border-gray-200 rounded-lg">
            <legend className="text-sm font-medium">Dirección</legend>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <input
                type="text"
                name="address.street"
                value={formData.address.street || ''}
                onChange={handleChange}
                placeholder="Calle"
                className="px-4 py-2 border border-gray-300 rounded-lg col-span-2"
              />
              <input
                type="text"
                name="address.city"
                value={formData.address.city || ''}
                onChange={handleChange}
                placeholder="Ciudad"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="text"
                name="address.country"
                value={formData.address.country || ''}
                onChange={handleChange}
                placeholder="País"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.00001"
                name="address.latitude"
                value={formData.address.latitude || ''}
                onChange={handleChange}
                placeholder="Latitud"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                step="0.00001"
                name="address.longitude"
                value={formData.address.longitude || ''}
                onChange={handleChange}
                placeholder="Longitud"
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </fieldset>

          {/* Imágenes */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">URL Logo</label>
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL Portada</label>
              <input
                type="url"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Negocio'}
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
