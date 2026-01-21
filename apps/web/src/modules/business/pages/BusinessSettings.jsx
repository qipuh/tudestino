import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Plus, X, Save, Trash2 } from 'lucide-react';
import BusinessLayout from '../components/BusinessLayout';
import api from '../../../services/api';

function BusinessSettings() {
  const { id: businessId } = useParams();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    startDate: '',
    endDate: '',
    type: 'high' // high, low, custom
  });

  useEffect(() => {
    loadSeasons();
  }, [businessId]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/businesses/${businessId}/seasons`);
      setSeasons(response.data || []);
    } catch (err) {
      console.error('Error loading seasons:', err);
      // Si no hay temporadas, iniciar con array vacío
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeason = async () => {
    if (!newSeason.name || !newSeason.startDate || !newSeason.endDate) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await api.post(`/businesses/${businessId}/seasons`, newSeason);

      setSeasons([...seasons, response.data]);
      setShowAddModal(false);
      setNewSeason({ name: '', startDate: '', endDate: '', type: 'high' });
    } catch (err) {
      console.error('Error adding season:', err);
      setError(err.response?.data?.message || 'Error al agregar temporada');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSeason = async (seasonId) => {
    if (!confirm('¿Estás seguro de eliminar esta temporada?')) return;

    try {
      await api.delete(`/businesses/${businessId}/seasons/${seasonId}`);
      setSeasons(seasons.filter(s => s.id !== seasonId));
    } catch (err) {
      console.error('Error deleting season:', err);
      setError('Error al eliminar temporada');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
  };

  const getSeasonTypeLabel = (type) => {
    const labels = {
      high: 'Temporada Alta',
      low: 'Temporada Baja',
      custom: 'Personalizada'
    };
    return labels[type] || type;
  };

  const getSeasonTypeColor = (type) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      custom: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <BusinessLayout activeMenu="settings">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Configuración del Negocio</h1>
          <p className="text-gray-600 mt-1">
            Gestiona las temporadas y configuraciones de tu negocio
          </p>
        </div>

        {/* Gestión de Temporadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                Temporadas del Negocio
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Define las temporadas para aplicar diferentes precios en tus tours
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
            >
              <Plus size={18} />
              Agregar Temporada
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-gray-600 mt-2">Cargando temporadas...</p>
            </div>
          ) : seasons.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay temporadas definidas
              </h3>
              <p className="text-gray-600 mb-4">
                Crea temporadas para aplicar precios diferentes en tus tours
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Crear primera temporada
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {seasons.map((season) => (
                <div
                  key={season.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {season.name}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getSeasonTypeColor(season.type)}`}>
                          {getSeasonTypeLabel(season.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(season.startDate)} - {formatDate(season.endDate)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteSeason(season.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Modal para Agregar Temporada */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Nueva Temporada</h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                    setNewSeason({ name: '', startDate: '', endDate: '', type: 'high' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Temporada *
                  </label>
                  <input
                    type="text"
                    value={newSeason.name}
                    onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                    placeholder="Ej: Verano 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Temporada *
                  </label>
                  <select
                    value={newSeason.type}
                    onChange={(e) => setNewSeason({ ...newSeason, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="high">Temporada Alta</option>
                    <option value="low">Temporada Baja</option>
                    <option value="custom">Personalizada</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio *
                    </label>
                    <input
                      type="date"
                      value={newSeason.startDate}
                      onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin *
                    </label>
                    <input
                      type="date"
                      value={newSeason.endDate}
                      onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                    setNewSeason({ name: '', startDate: '', endDate: '', type: 'high' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddSeason}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Guardar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}

export default BusinessSettings;
