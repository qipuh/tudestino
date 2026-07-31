import { useState, useEffect } from 'react';
import { Search, Eye, MapPin, User, Link as LinkIcon, Building2, X } from 'lucide-react';
import api from '../../services/api';

function PropertiesManagement() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, [page, filterType]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filterType !== 'all') params.type = filterType;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/admin/businesses', { params });
      setBusinesses(response.data?.businesses || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-ES');

  const getTypeColor = (type) => {
    const colors = {
      'hotel': 'bg-purple-100 text-purple-700',
      'restaurant': 'bg-orange-100 text-orange-700',
      'tour': 'bg-green-100 text-green-700',
      'event': 'bg-pink-100 text-pink-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Gestión de Negocios</h1>
      
      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchBusinesses(); } }}
              placeholder="Buscar negocios... (Enter para buscar)"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => { setPage(1); fetchBusinesses(); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="hotel">Hoteles</option>
            <option value="restaurant">Restaurantes</option>
            <option value="tour">Tours</option>
            <option value="event">Eventos</option>
          </select>
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Negocio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Propietario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Creado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center">Cargando...</td></tr>
            ) : businesses.length === 0 ? (
              <tr><td colSpan="7" className="px-6 py-12 text-center">No hay negocios</td></tr>
            ) : (
              businesses.map((business) => (
                <tr key={business.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-medium">{business.name || business.propertyName}</div>
                        <div className="text-sm text-gray-500">{business.businessType}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{business.addressCity || business.location?.city}</div>
                        <div className="text-gray-500">{business.addressState || business.location?.state}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <div>{business.owner?.name || business.createdBy?.name}</div>
                        <div className="text-gray-500">{business.owner?.email || business.createdBy?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeColor(business.type || business.businessType)}`}>
                      {business.type || business.businessType || 'Negocio'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(business.createdAt)}</td>
                  <td className="px-6 py-4">
                    {business.slug ? (
                      <a href={`/${business.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        <LinkIcon className="w-4 h-4 inline mr-1" />/{business.slug}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Sin URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedBusiness(business)}
                      className="text-blue-600 hover:text-blue-900 p-2"
                      title="Ver detalle"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Detalle del negocio</h2>
              <button onClick={() => setSelectedBusiness(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span>{' '}
                <span className="font-medium text-gray-900">{selectedBusiness.name || selectedBusiness.propertyName}</span>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>{' '}
                <span className="font-medium text-gray-900">{selectedBusiness.businessType || selectedBusiness.type}</span>
              </div>
              <div>
                <span className="text-gray-500">Dueño:</span>{' '}
                <span className="font-medium text-gray-900">{selectedBusiness.owner?.name} ({selectedBusiness.owner?.email})</span>
              </div>
              <div>
                <span className="text-gray-500">Ciudad:</span>{' '}
                <span className="font-medium text-gray-900">{selectedBusiness.addressCity || selectedBusiness.location?.city || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500">Verificación:</span>{' '}
                <span className="font-medium text-gray-900">{selectedBusiness.verificationStatus || 'N/D'}</span>
              </div>
              <div>
                <span className="text-gray-500">Creado:</span>{' '}
                <span className="font-medium text-gray-900">{formatDate(selectedBusiness.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PropertiesManagement;
