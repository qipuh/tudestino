import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Loader2 } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as rateManagementService from '../../../services/rateManagementService';
import BusinessLayout from '../components/BusinessLayout';

const ruleTypeLabel = {
  season: 'Temporada (rango de fechas)',
  day_of_week: 'Día de la semana',
  early_bird: 'Reserva anticipada (early bird)',
  last_minute: 'Última hora (last minute)',
};

const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const emptyForm = {
  name: '',
  ruleType: 'season',
  startDate: '',
  endDate: '',
  daysOfWeek: [],
  minAdvanceDays: '',
  maxAdvanceDays: '',
  adjustmentType: 'percentage',
  adjustmentValue: '',
  minStay: '',
  maxStay: '',
  priority: 0,
};

function RateRulesManager() {
  const { id: businessId, roomId } = useParams();
  const navigate = useNavigate();
  const { rooms, fetchBusinessProperty } = useBusinessProperty();

  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const room = rooms.find((r) => r.id === roomId);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [businessId, roomId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      await fetchBusinessProperty(businessId);
      const data = await rateManagementService.listRateRules(roomId);
      setRules(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar reglas de tarifa');
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name,
        ruleType: form.ruleType,
        adjustmentType: form.adjustmentType,
        adjustmentValue: Number(form.adjustmentValue),
        priority: Number(form.priority) || 0,
        minStay: form.minStay ? Number(form.minStay) : null,
        maxStay: form.maxStay ? Number(form.maxStay) : null,
      };
      if (form.ruleType === 'season') {
        payload.startDate = form.startDate;
        payload.endDate = form.endDate;
      }
      if (form.ruleType === 'day_of_week') {
        payload.daysOfWeek = form.daysOfWeek;
      }
      if (form.ruleType === 'early_bird') {
        payload.minAdvanceDays = Number(form.minAdvanceDays) || 0;
      }
      if (form.ruleType === 'last_minute') {
        payload.maxAdvanceDays = Number(form.maxAdvanceDays) || 0;
      }

      await rateManagementService.createRateRule(roomId, payload);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo crear la regla');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (rule) => {
    if (!confirm(`¿Eliminar la regla "${rule.name}"?`)) return;
    try {
      await rateManagementService.deleteRateRule(rule.id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar');
    }
  };

  const describeRule = (rule) => {
    if (rule.ruleType === 'season') return `${rule.startDate} → ${rule.endDate}`;
    if (rule.ruleType === 'day_of_week') return (rule.daysOfWeek || []).map((d) => dayNames[d]).join(', ');
    if (rule.ruleType === 'early_bird') return `≥ ${rule.minAdvanceDays} días de anticipación`;
    if (rule.ruleType === 'last_minute') return `≤ ${rule.maxAdvanceDays} días de anticipación`;
    return '';
  };

  return (
    <BusinessLayout activeMenu="services">
      <button
        onClick={() => navigate(`/business/${businessId}/services`)}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-4 transition"
      >
        <ArrowLeft size={18} />
        Volver a habitaciones
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Tarifas dinámicas {room ? `— ${room.name}` : ''}
        </h1>
        <p className="text-gray-600 mt-1">
          Precio base: S/ {room?.pricePerNight || '—'} por noche. Las reglas ajustan ese precio para fechas, días o anticipación específicas.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Nueva regla</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Temporada alta diciembre"
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de regla</label>
              <select
                value={form.ruleType}
                onChange={(e) => setForm({ ...form, ruleType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {Object.entries(ruleTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.ruleType === 'season' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
              </div>
            </div>
          )}

          {form.ruleType === 'day_of_week' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Días</label>
              <div className="flex gap-2">
                {dayNames.map((label, day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`w-12 py-2 rounded-lg text-sm font-medium ${form.daysOfWeek.includes(day) ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {form.ruleType === 'early_bird' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo días de anticipación</label>
              <input type="number" value={form.minAdvanceDays} onChange={(e) => setForm({ ...form, minAdvanceDays: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
          )}

          {form.ruleType === 'last_minute' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Máximo días de anticipación</label>
              <input type="number" value={form.maxAdvanceDays} onChange={(e) => setForm({ ...form, maxAdvanceDays: e.target.value })} className="w-full border rounded-lg px-3 py-2" required />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ajuste</label>
              <select value={form.adjustmentType} onChange={(e) => setForm({ ...form, adjustmentType: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                <option value="percentage">Porcentaje (%)</option>
                <option value="fixed">Monto fijo (S/)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
              <input type="number" value={form.adjustmentValue} onChange={(e) => setForm({ ...form, adjustmentValue: e.target.value })} placeholder="-10 o 50" className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estancia mín.</label>
              <input type="number" value={form.minStay} onChange={(e) => setForm({ ...form, minStay: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
              <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={saving} className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark font-medium flex items-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Crear regla
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Reglas activas ({rules.length})</h2>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" size={28} /></div>
        ) : rules.length === 0 ? (
          <p className="text-gray-500 text-sm">Sin reglas todavía. El precio se cobra al valor base.</p>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{rule.name}</p>
                  <p className="text-sm text-gray-500">
                    {ruleTypeLabel[rule.ruleType]} · {describeRule(rule)}
                  </p>
                  <p className="text-sm mt-1">
                    <span className={Number(rule.adjustmentValue) < 0 ? 'text-green-600' : 'text-amber-600'}>
                      {rule.adjustmentType === 'percentage' ? `${rule.adjustmentValue}%` : `S/ ${rule.adjustmentValue}`}
                    </span>
                    {rule.minStay && <span className="text-gray-500"> · mín. {rule.minStay} noches</span>}
                    <span className="text-gray-400"> · prioridad {rule.priority}</span>
                  </p>
                </div>
                <button onClick={() => handleDelete(rule)} className="p-2 rounded-lg hover:bg-red-50 text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

export default RateRulesManager;
