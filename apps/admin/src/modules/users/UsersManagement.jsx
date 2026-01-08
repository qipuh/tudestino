import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Mail, Phone, Calendar, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filterType !== 'all') params.userType = filterType;
      if (searchTerm) params.search = searchTerm;

      const response = await api.get('/admin/users', { params });
      setUsers(response.data?.users || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('es-ES');

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Gestión de Usuarios</h1>
      
      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="all">Todos</option>
            <option value="host">Anfitriones</option>
            <option value="tourist">Turistas</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">URL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-12 text-center">No hay usuarios</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-medium">{user.name} {user.lastName}</div>
                        <div className="text-sm text-gray-500">@{user.username || user.email?.split('@')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{user.email}</div>
                    {user.phone && <div className="text-sm text-gray-500">{user.phone}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                      {user.userType || 'Usuario'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                  <td className="px-6 py-4">
                    {user.slug ? (
                      <a href={`/${user.slug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        <LinkIcon className="w-4 h-4 inline mr-1" />/{user.slug}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400">Sin URL</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-900 p-2">
                      <Eye className="w-5 h-5" />
                    </button>
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

export default UsersManagement;
