import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, MapPin } from 'lucide-react';
import { attractionsService } from '../../services/attractions.service';
import AttractionForm from './AttractionForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const CATEGORIES = {
  naturaleza: 'Naturaleza',
  cultura: 'Cultura',
  aventura: 'Aventura',
  gastronomia: 'Gastronomía',
  urbano: 'Urbano'
};

function AttractionsManagement() {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState(null);

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      setLoading(true);
      const response = await attractionsService.getAll();
      setAttractions(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching attractions:', err);
      setError('Error al cargar los atractivos turísticos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este atractivo? Se eliminarán también todas sus imágenes y tags.')) return;

    try {
      await attractionsService.delete(id);
      fetchAttractions();
    } catch (err) {
      console.error('Error deleting attraction:', err);
      alert('Error al eliminar el atractivo');
    }
  };

  const handleTogglePublish = async (attraction) => {
    try {
      const formData = new FormData();
      formData.append('title', attraction.title);
      formData.append('isPublished', !attraction.isPublished);
      if (attraction.description) formData.append('description', attraction.description);
      if (attraction.category) formData.append('category', attraction.category);

      await attractionsService.update(attraction.id, formData);
      fetchAttractions();
    } catch (err) {
      console.error('Error updating attraction:', err);
      alert('Error al actualizar el atractivo');
    }
  };

  const handleCreate = () => {
    setEditingAttraction(null);
    setShowForm(true);
  };

  const handleEdit = (attraction) => {
    setEditingAttraction(attraction);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAttraction(null);
    fetchAttractions();
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    // Construir URL base desde API_URL (ej: https://api.tudestino.pe/api -> https://tudestino.pe)
    const apiUrl = API_URL || '';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '').replace('api.', '');
    return `${baseUrl}/uploads/attractions/${imageUrl}`;
  };

  const filteredAttractions = attractions.filter(attraction => {
    const matchesCategory = !filterCategory || attraction.category === filterCategory;
    const matchesSearch = !searchTerm ||
      attraction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attraction.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <AttractionForm
        attraction={editingAttraction}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingAttraction(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atractivos Turísticos</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona los atractivos turísticos de la plataforma
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo Atractivo
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por título o ciudad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORIES).map(([key, value]) => (
            <option key={key} value={key}>{value}</option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Attractions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vistas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttractions.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  No hay atractivos turísticos registrados. Crea el primero.
                </td>
              </tr>
            ) : (
              filteredAttractions.map((attraction) => (
                <tr key={attraction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attraction.coverImage ? (
                      <img
                        src={getImageUrl(attraction.coverImage)}
                        alt={attraction.title}
                        className="h-16 w-28 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-28 bg-gray-200 rounded flex items-center justify-center">
                        <MapPin size={24} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {attraction.title}
                    </div>
                    {attraction.description && (
                      <div className="text-xs text-gray-500 max-w-xs truncate mt-1">
                        {attraction.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {CATEGORIES[attraction.category] || attraction.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{attraction.city || '-'}</div>
                    {attraction.region && (
                      <div className="text-xs text-gray-500">{attraction.region}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(attraction)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attraction.isPublished
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {attraction.isPublished ? 'Publicado' : 'Borrador'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attraction.views || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleTogglePublish(attraction)}
                        className="text-gray-600 hover:text-gray-900"
                        title={attraction.isPublished ? 'Despublicar' : 'Publicar'}
                      >
                        {attraction.isPublished ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(attraction)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(attraction.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
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

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Atractivos</div>
          <div className="text-2xl font-bold text-gray-900">{attractions.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Publicados</div>
          <div className="text-2xl font-bold text-green-600">
            {attractions.filter(a => a.isPublished).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Borradores</div>
          <div className="text-2xl font-bold text-gray-600">
            {attractions.filter(a => !a.isPublished).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Vistas</div>
          <div className="text-2xl font-bold text-blue-600">
            {attractions.reduce((sum, a) => sum + (a.views || 0), 0)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttractionsManagement;
