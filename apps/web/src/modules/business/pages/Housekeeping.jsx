import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Play, Check, Flag, RotateCcw } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as housekeepingService from '../../../services/housekeepingService';
import * as roomUnitService from '../../../services/roomUnitService';
import BusinessLayout from '../components/BusinessLayout';

const columns = [
  { key: 'pending', label: 'Pendientes', className: 'border-gray-300' },
  { key: 'in_progress', label: 'En curso', className: 'border-blue-300' },
  { key: 'done', label: 'Listas', className: 'border-green-300' },
  { key: 'flagged', label: 'Con incidencia', className: 'border-red-300' },
];

const taskTypeLabel = {
  checkout_clean: 'Limpieza de salida',
  stayover: 'Repaso (huésped en casa)',
  deep_clean: 'Limpieza profunda',
  inspection: 'Inspección',
};

function Housekeeping() {
  const { id: businessId } = useParams();
  const { property, rooms, fetchBusinessProperty } = useBusinessProperty();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [units, setUnits] = useState([]);
  const [newTask, setNewTask] = useState({ roomUnitId: '', taskType: 'stayover' });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const propResult = await fetchBusinessProperty(businessId);
      const propertyId = propResult?.data?.id;
      if (!propertyId) {
        setError('Este negocio no tiene una propiedad configurada');
        return;
      }
      const data = await housekeepingService.getTasks(propertyId);
      setTasks(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
    // load excluded on purpose: fetchBusinessProperty from useBusinessProperty
    // is not memoized (new identity every render), so depending on `load`
    // here would cause an infinite effect loop.
  }, [businessId]);

  useEffect(() => {
    (async () => {
      if (!property?.id || rooms.length === 0) return;
      const allUnits = await Promise.all(
        rooms.map((r) => roomUnitService.getRoomUnits(property.id, r.id).catch(() => []))
      );
      setUnits(allUnits.flat().map((u) => ({ ...u, roomName: rooms.find((r) => r.id === u.roomId)?.name })));
    })();
  }, [property, rooms]);

  const handleStatusChange = async (task, status) => {
    let incidentNotes;
    if (status === 'flagged') {
      incidentNotes = prompt('Describe la incidencia:');
      if (incidentNotes === null) return;
    }
    try {
      await housekeepingService.updateTaskStatus(task.id, status, incidentNotes);
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo actualizar la tarea');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!property?.id || !newTask.roomUnitId) return;
    try {
      await housekeepingService.createTask(property.id, newTask);
      setShowNewTask(false);
      setNewTask({ roomUnitId: '', taskType: 'stayover' });
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo crear la tarea');
    }
  };

  return (
    <BusinessLayout activeMenu="housekeeping">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Housekeeping</h1>
          <p className="text-gray-600 mt-1">Tablero de tareas de limpieza</p>
        </div>
        <button
          onClick={() => setShowNewTask(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Nueva tarea
        </button>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div key={col.key} className={`bg-white rounded-lg shadow-sm border-t-4 ${col.className} p-4`}>
              <h2 className="font-bold text-gray-900 mb-3">{col.label} ({tasks.filter((t) => t.status === col.key).length})</h2>
              <div className="space-y-3">
                {tasks.filter((t) => t.status === col.key).map((task) => (
                  <div key={task.id} className="border rounded-lg p-3 text-sm">
                    <p className="font-semibold text-gray-900">Unidad {task.unitNumber}</p>
                    <p className="text-xs text-gray-500 mb-2">{taskTypeLabel[task.taskType] || task.taskType}</p>
                    {task.incidentNotes && (
                      <p className="text-xs text-red-600 mb-2">⚠ {task.incidentNotes}</p>
                    )}
                    <div className="flex gap-1 flex-wrap">
                      {task.status === 'pending' && (
                        <button onClick={() => handleStatusChange(task, 'in_progress')} className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          <Play size={12} /> Iniciar
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button onClick={() => handleStatusChange(task, 'done')} className="flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                          <Check size={12} /> Terminar
                        </button>
                      )}
                      {(task.status === 'pending' || task.status === 'in_progress') && (
                        <button onClick={() => handleStatusChange(task, 'flagged')} className="flex items-center gap-1 text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          <Flag size={12} /> Incidencia
                        </button>
                      )}
                      {task.status === 'flagged' && (
                        <button onClick={() => handleStatusChange(task, 'pending')} className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          <RotateCcw size={12} /> Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.filter((t) => t.status === col.key).length === 0 && (
                  <p className="text-xs text-gray-400">Sin tareas</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showNewTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateTask} className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Nueva tarea</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select
                value={newTask.roomUnitId}
                onChange={(e) => setNewTask({ ...newTask, roomUnitId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecciona una unidad</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>{u.roomName} — {u.unitNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de tarea</label>
              <select
                value={newTask.taskType}
                onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              >
                {Object.entries(taskTypeLabel).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowNewTask(false)} className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-primary text-white rounded-lg py-2 font-medium">
                Crear
              </button>
            </div>
          </form>
        </div>
      )}
    </BusinessLayout>
  );
}

export default Housekeeping;
