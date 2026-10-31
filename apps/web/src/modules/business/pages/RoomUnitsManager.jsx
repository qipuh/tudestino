import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Lock, Unlock, Loader2 } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as roomUnitService from '../../../services/roomUnitService';
import BusinessLayout from '../components/BusinessLayout';

const opStatusLabel = {
  available: { label: 'Disponible', className: 'bg-green-100 text-green-700' },
  occupied: { label: 'Ocupada', className: 'bg-blue-100 text-blue-700' },
  maintenance: { label: 'Mantenimiento', className: 'bg-amber-100 text-amber-700' },
  blocked: { label: 'Bloqueada', className: 'bg-gray-200 text-gray-700' },
};

const hkStatusLabel = {
  clean: { label: 'Limpia', className: 'bg-green-50 text-green-700 border border-green-200' },
  dirty: { label: 'Sucia', className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  inspected: { label: 'Inspeccionada', className: 'bg-blue-50 text-blue-700 border border-blue-200' },
  out_of_service: { label: 'Fuera de servicio', className: 'bg-red-50 text-red-700 border border-red-200' },
};

function RoomUnitsManager() {
  const { id: businessId, roomId } = useParams();
  const navigate = useNavigate();
  const { property, rooms, fetchBusinessProperty } = useBusinessProperty();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('range'); // 'range' | 'list'
  const [range, setRange] = useState({ startNumber: '', count: 5, floor: '', prefix: '' });
  const [listText, setListText] = useState('');
  const [saving, setSaving] = useState(false);

  const room = rooms.find((r) => r.id === roomId);

  useEffect(() => {
    load();
  }, [businessId, roomId]);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const propResult = await fetchBusinessProperty(businessId);
      const propertyId = propResult?.data?.id;
      if (!propertyId) {
        setError('Este negocio no tiene una propiedad configurada');
        return;
      }
      const data = await roomUnitService.getRoomUnits(propertyId, roomId);
      setUnits(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las unidades');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCreate = async (e) => {
    e.preventDefault();
    if (!property?.id) return;

    setSaving(true);
    setError(null);
    try {
      let payload;
      if (mode === 'range') {
        if (!range.startNumber || !range.count) {
          setError('Indica número inicial y cantidad');
          setSaving(false);
          return;
        }
        payload = {
          range: {
            startNumber: Number(range.startNumber),
            count: Number(range.count),
            floor: range.floor || null,
            prefix: range.prefix || '',
          },
        };
      } else {
        const lines = listText.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) {
          setError('Escribe al menos un número de habitación');
          setSaving(false);
          return;
        }
        payload = { units: lines.map((unitNumber) => ({ unitNumber })) };
      }

      await roomUnitService.bulkCreateRoomUnits(property.id, roomId, payload);
      setRange({ startNumber: '', count: 5, floor: '', prefix: '' });
      setListText('');
      await load();
    } catch (err) {
      if (err.response?.status === 409) {
        setError(`Ya existen: ${err.response.data.conflicts.join(', ')}`);
      } else {
        setError(err.response?.data?.message || 'Error al crear las unidades');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleBlock = async (unit) => {
    const next = unit.operationalStatus === 'blocked' ? 'available' : 'blocked';
    try {
      await roomUnitService.updateRoomUnit(property.id, roomId, unit.id, { operationalStatus: next });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  };

  const handleDelete = async (unit) => {
    if (!confirm(`¿Eliminar la unidad ${unit.unitNumber}?`)) return;
    try {
      await roomUnitService.deleteRoomUnit(property.id, roomId, unit.id);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo eliminar');
    }
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
          Unidades físicas {room ? `— ${room.name}` : ''}
        </h1>
        <p className="text-gray-600 mt-1">
          Cada unidad es una habitación real (ej. &quot;204&quot;) que recepción y limpieza operan una por una.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('range')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'range' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Rango numérico
          </button>
          <button
            onClick={() => setMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === 'list' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Lista manual
          </button>
        </div>

        <form onSubmit={handleBulkCreate} className="space-y-4">
          {mode === 'range' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número inicial</label>
                <input
                  type="number"
                  value={range.startNumber}
                  onChange={(e) => setRange({ ...range, startNumber: e.target.value })}
                  placeholder="301"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  value={range.count}
                  onChange={(e) => setRange({ ...range, count: e.target.value })}
                  min={1}
                  max={200}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Piso (opcional)</label>
                <input
                  type="text"
                  value={range.floor}
                  onChange={(e) => setRange({ ...range, floor: e.target.value })}
                  placeholder="3"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefijo (opcional)</label>
                <input
                  type="text"
                  value={range.prefix}
                  onChange={(e) => setRange({ ...range, prefix: e.target.value })}
                  placeholder="A-"
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
              <p className="col-span-full text-xs text-gray-500">
                Genera unidades consecutivas, ej. 301, 302, 303...
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Números de habitación (uno por línea)</label>
              <textarea
                value={listText}
                onChange={(e) => setListText(e.target.value)}
                rows={5}
                placeholder={'204\n205\n206-A'}
                className="w-full border rounded-lg px-3 py-2 font-mono text-sm"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Crear unidades
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Unidades existentes ({units.length})</h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : units.length === 0 ? (
          <p className="text-gray-500 text-sm">Todavía no hay unidades físicas para este tipo de habitación.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">Número</th>
                  <th className="py-2 pr-4">Piso</th>
                  <th className="py-2 pr-4">Estado</th>
                  <th className="py-2 pr-4">Limpieza</th>
                  <th className="py-2 pr-4"></th>
                </tr>
              </thead>
              <tbody>
                {units.map((unit) => (
                  <tr key={unit.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium text-gray-900">{unit.unitNumber}</td>
                    <td className="py-2 pr-4 text-gray-600">{unit.floor || '—'}</td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${opStatusLabel[unit.operationalStatus]?.className}`}>
                        {opStatusLabel[unit.operationalStatus]?.label}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${hkStatusLabel[unit.housekeepingStatus]?.className}`}>
                        {hkStatusLabel[unit.housekeepingStatus]?.label}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleBlock(unit)}
                          disabled={unit.operationalStatus === 'occupied'}
                          title={unit.operationalStatus === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
                        >
                          {unit.operationalStatus === 'blocked' ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>
                        <button
                          onClick={() => handleDelete(unit)}
                          disabled={unit.operationalStatus === 'occupied'}
                          title="Eliminar"
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

export default RoomUnitsManager;
