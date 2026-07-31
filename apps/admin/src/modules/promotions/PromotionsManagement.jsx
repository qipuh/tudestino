import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag, Power } from 'lucide-react';
import api from '../../services/api';

const emptyForm = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  maxUses: '',
  validFrom: '',
  validUntil: '',
};

function PromotionsManagement() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/promotions');
      setPromotions(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching promotions:', err);
      setError('Error al cargar los códigos promocionales');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/promotions', {
        ...form,
        maxUses: form.maxUses ? parseInt(form.maxUses) : null,
        discountValue: parseFloat(form.discountValue),
      });
      setShowForm(false);
      setForm(emptyForm);
      fetchPromotions();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al crear el código');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (promo) => {
    try {
      await api.put(`/promotions/${promo.id}`, { isActive: !promo.isActive });
      fetchPromotions();
    } catch (err) {
      alert('Error al actualizar el código');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este código promocional?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      fetchPromotions();
    } catch (err) {
      alert('Error al eliminar el código');
    }
  };

  const formatDiscount = (promo) =>
    promo.discountType === 'percentage' ? `${promo.discountValue}%` : `S/ ${promo.discountValue}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag size={24} />
            Códigos Promocionales
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Nota: estos códigos aún no se aplican automáticamente en el checkout - por ahora es solo gestión.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo código
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Código</label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="VERANO2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo (S/)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor del descuento</label>
              <input
                type="number"
                required
                step="0.01"
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usos máximos (opcional)</label>
              <input
                type="number"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                placeholder="Ilimitado"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido desde</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={(e) => setForm({ ...form, validFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Válido hasta</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear código'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center text-gray-500">No hay códigos promocionales</td></tr>
            ) : (
              promotions.map((promo) => (
                <tr key={promo.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-mono font-semibold text-gray-900">{promo.code}</div>
                    <div className="text-xs text-gray-500">{promo.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDiscount(promo)}</td>
                  <td className="px-6 py-4 text-sm">
                    {promo.usedCount} / {promo.maxUses ?? '∞'}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">
                    {promo.validFrom ? new Date(promo.validFrom).toLocaleDateString('es-PE') : '—'}
                    {' - '}
                    {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${promo.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {promo.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleToggleActive(promo)} className="text-gray-600 hover:text-gray-900" title="Activar/Desactivar">
                        <Power size={18} />
                      </button>
                      <button onClick={() => handleDelete(promo.id)} className="text-red-600 hover:text-red-900" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PromotionsManagement;
