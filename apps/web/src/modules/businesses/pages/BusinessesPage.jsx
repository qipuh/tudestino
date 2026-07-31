import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Loader } from 'lucide-react';
import BusinessCard from '../components/BusinessCard';
import businessesService from '../services/businessesService';

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    limit: 20,
    offset: 0
  });

  useEffect(() => {
    fetchBusinesses();
  }, [filters]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const data = await businessesService.getBusinesses({
        ...filters,
        search: searchTerm || undefined
      });
      setBusinesses(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando negocios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, offset: 0 });
    fetchBusinesses();
  };

  const handleDelete = async (id) => {
    try {
      await businessesService.deleteBusiness(id);
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error eliminando:', err);
    }
  };

  const handleTypeChange = (e) => {
    setFilters({ ...filters, type: e.target.value, offset: 0 });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Negocios</h1>
            <p className="text-gray-600">Gestiona todos tus negocios</p>
          </div>
          <Link
            to="/businesses/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            Nuevo Negocio
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <form onSubmit={handleSearch} className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Search size={20} className="text-gray-400" />
              </button>
            </div>

            <select
              value={filters.type}
              onChange={handleTypeChange}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los tipos</option>
              <option value="accommodation">Alojamiento</option>
              <option value="restaurant">Restaurante</option>
              <option value="event">Evento</option>
              <option value="activity">Actividad</option>
              <option value="tour">Tour</option>
            </select>
          </form>
        </div>

        {/* Contenido */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No hay negocios para mostrar</p>
            <Link
              to="/businesses/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} />
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map(business => (
              <BusinessCard
                key={business.id}
                business={business}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && businesses.length > 0 && (
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => setFilters({ ...filters, offset: Math.max(0, filters.offset - filters.limit) })}
              disabled={filters.offset === 0}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setFilters({ ...filters, offset: filters.offset + filters.limit })}
              disabled={businesses.length < filters.limit}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
