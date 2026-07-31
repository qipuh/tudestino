import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import offersService from '../services/offersService';

export default function OfferForm({ businessId, initialData = null }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    title: initialData?.title || '',
    description: initialData?.description || '',
    discountType: initialData?.discountType || 'percentage',
    discountValue: initialData?.discountValue || '',
    maxUses: initialData?.maxUses || '',
    validFrom: initialData?.validFrom?.split('T')[0] || '',
    validUntil: initialData?.validUntil?.split('T')[0] || '',
    isActive: initialData?.isActive !== false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: new Date(formData.validFrom).toISOString(),
        validUntil: new Date(formData.validUntil).toISOString()
      };

      if (initialData?.id) {
        await offersService.updateOffer(initialData.id, payload);
      } else {
        await offersService.createOffer(businessId, payload);
      }

      navigate(`/businesses/${businessId}/offers`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error guardando oferta');
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
            {initialData ? 'Editar Oferta' : 'Crear Oferta'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8">
          {/* Código */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Código (ej: VERANO2024)</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Código único"
            />
          </div>

          {/* Título */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ej: Descuento Verano"
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
              placeholder="Describe la oferta..."
            />
          </div>

          {/* Grid descuento */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Descuento</label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed_amount">Monto Fijo (S/)</option>
                <option value="free_service">Servicio Gratis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Valor de Descuento</label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="0"
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Válida desde</label>
              <input
                type="date"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Válida hasta</label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* Max usos */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Máximo de usos (vacío = ilimitado)</label>
            <input
              type="number"
              name="maxUses"
              value={formData.maxUses}
              onChange={handleChange}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="100"
            />
          </div>

          {/* Activa */}
          <div className="mb-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded"
              />
              <span className="text-sm font-medium">Oferta activa</span>
            </label>
          </div>

          {/* Botones */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Guardando...' : 'Guardar Oferta'}
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
