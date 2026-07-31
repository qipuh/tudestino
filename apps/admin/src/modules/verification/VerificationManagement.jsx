import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, FileText, User as UserIcon } from 'lucide-react';
import api from '../../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_URL = API_URL.replace(/\/api$/, '');

const getDocUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `${SERVER_URL}/uploads/identity/${filename}`;
};

function VerificationManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/verifications/pending');
      setUsers(response.data?.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching pending verifications:', err);
      setError('Error al cargar verificaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm('¿Aprobar la verificación de identidad de este usuario?')) return;

    try {
      setProcessingId(userId);
      await api.post(`/admin/verifications/${userId}/approve`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Error approving verification:', err);
      alert(err.response?.data?.message || 'Error al aprobar la verificación');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      alert('Debes escribir una razón para el rechazo');
      return;
    }

    try {
      setProcessingId(userId);
      await api.post(`/admin/verifications/${userId}/reject`, { reason: rejectReason.trim() });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setRejectingId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting verification:', err);
      alert(err.response?.data?.message || 'Error al rechazar la verificación');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Verificaciones Pendientes</h1>
        <p className="text-sm text-gray-600 mt-1">
          Revisa el documento y la selfie de cada usuario antes de aprobar o rechazar.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {users.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-300" />
          No hay verificaciones pendientes.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                      <UserIcon size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                    <FileText size={16} />
                    {user.documentType} - {user.documentNumber}
                  </div>
                  <div className="text-xs text-gray-400">
                    Solicitado: {new Date(user.createdAt).toLocaleString('es-PE')}
                  </div>
                </div>

                <div className="flex gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Documento</p>
                    {user.documentFrontPhoto ? (
                      <a href={getDocUrl(user.documentFrontPhoto)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={getDocUrl(user.documentFrontPhoto)}
                          alt="Documento"
                          className="h-28 w-40 object-cover rounded border"
                        />
                      </a>
                    ) : (
                      <div className="h-28 w-40 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Selfie</p>
                    {user.selfiePhoto ? (
                      <a href={getDocUrl(user.selfiePhoto)} target="_blank" rel="noopener noreferrer">
                        <img
                          src={getDocUrl(user.selfiePhoto)}
                          alt="Selfie"
                          className="h-28 w-28 object-cover rounded border"
                        />
                      </a>
                    ) : (
                      <div className="h-28 w-28 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-400">
                        Sin foto
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col justify-center gap-2 min-w-[160px]">
                  <button
                    onClick={() => handleApprove(user.id)}
                    disabled={processingId === user.id}
                    className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === user.id ? null : user.id)}
                    disabled={processingId === user.id}
                    className="flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Rechazar
                  </button>
                </div>
              </div>

              {rejectingId === user.id && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Razón del rechazo (ej. foto borrosa, documento no coincide)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <button
                    onClick={() => handleReject(user.id)}
                    disabled={processingId === user.id}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Confirmar rechazo
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerificationManagement;
