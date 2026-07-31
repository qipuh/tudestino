import { useState, useEffect } from 'react';
import { Search, Eye, X, Link as LinkIcon } from 'lucide-react';
import api from '../../services/api';

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, filterType]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      // El backend filtra por `role` (guest/host/business_owner/admin),
      // no por `userType` - ese nombre de parámetro nunca coincidía y el
      // filtro no hacía nada.
      if (filterType !== 'all') params.role = filterType;
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
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchUsers(); } }}
              placeholder="Buscar usuarios... (Enter para buscar)"
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <button
            onClick={() => { setPage(1); fetchUsers(); }}
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
            <option value="guest">Viajeros</option>
            <option value="host">Anfitriones</option>
            <option value="business_owner">Negocios</option>
            <option value="admin">Administradores</option>
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
                    <button
                      onClick={() => setSelectedUser(user)}
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

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-gray-900">Detalle de usuario</h2>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Nombre:</span>{' '}
                <span className="font-medium text-gray-900">{selectedUser.name} {selectedUser.lastName}</span>
              </div>
              <div>
                <span className="text-gray-500">Usuario:</span>{' '}
                <span className="font-medium text-gray-900">@{selectedUser.username || selectedUser.email?.split('@')[0]}</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>{' '}
                <span className="font-medium text-gray-900">{selectedUser.email}</span>
              </div>
              {selectedUser.phone && (
                <div>
                  <span className="text-gray-500">Teléfono:</span>{' '}
                  <span className="font-medium text-gray-900">{selectedUser.phone}</span>
                </div>
              )}
              <div>
                <span className="text-gray-500">Rol:</span>{' '}
                <span className="font-medium text-gray-900">{selectedUser.role}</span>
              </div>
              <div>
                <span className="text-gray-500">Registrado:</span>{' '}
                <span className="font-medium text-gray-900">{formatDate(selectedUser.createdAt)}</span>
              </div>
              <div>
                <span className="text-gray-500">Identidad:</span>{' '}
                <span className="font-medium text-gray-900">
                  {selectedUser.identityStatus === 'verified' ? 'Verificada' : selectedUser.identityStatus === 'rejected' ? 'Rechazada' : 'Pendiente'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;
