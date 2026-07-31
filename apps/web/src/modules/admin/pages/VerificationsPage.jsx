import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, User, CreditCard, Clock } from 'lucide-react';
import api, { getImageUrl } from '../../../services/api';

function VerificationsPage() {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/verifications/pending');
      setPendingVerifications(response.data.data.users || []);
    } catch (err) {
      console.error('Error fetching pending verifications:', err);
      setError('Error al cargar las verificaciones pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    if (!confirm('¿Estás seguro de aprobar esta verificación?')) {
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/admin/verifications/${userId}/approve`);
      alert('Verificación aprobada exitosamente');
      // Remove from list
      setPendingVerifications(prev => prev.filter(v => v.id !== userId));
      setSelectedVerification(null);
    } catch (err) {
      console.error('Error approving verification:', err);
      alert('Error al aprobar la verificación: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (userId) => {
    if (!rejectReason.trim()) {
      alert('Debes proporcionar una razón para el rechazo');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar esta verificación?')) {
      return;
    }

    try {
      setProcessing(true);
      await api.post(`/admin/verifications/${userId}/reject`, {
        reason: rejectReason.trim()
      });
      alert('Verificación rechazada');
      // Remove from list
      setPendingVerifications(prev => prev.filter(v => v.id !== userId));
      setSelectedVerification(null);
      setRejectReason('');
    } catch (err) {
      console.error('Error rejecting verification:', err);
      alert('Error al rechazar la verificación: ' + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando verificaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verificaciones de Identidad
          </h1>
          <p className="text-gray-600">
            Revisa y aprueba las solicitudes de verificación de identidad
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {pendingVerifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay verificaciones pendientes
            </h3>
            <p className="text-gray-600">
              Todas las solicitudes de verificación han sido revisadas
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de verificaciones */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">
                  Pendientes ({pendingVerifications.length})
                </h2>
                <div className="space-y-2">
                  {pendingVerifications.map((verification) => (
                    <button
                      key={verification.id}
                      onClick={() => setSelectedVerification(verification)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition ${
                        selectedVerification?.id === verification.id
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {verification.name}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {verification.email}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-xs text-gray-500">
                              {formatDate(verification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Detalles de verificación */}
            <div className="lg:col-span-2">
              {selectedVerification ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Header del detalle */}
                  <div className="bg-primary px-6 py-4">
                    <h2 className="text-xl font-bold text-white">
                      Detalles de Verificación
                    </h2>
                  </div>

                  <div className="p-6">
                    {/* Información del usuario */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Información del Usuario</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-600">Nombre</label>
                          <p className="font-medium">{selectedVerification.name}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Email</label>
                          <p className="font-medium">{selectedVerification.email}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Tipo de Documento</label>
                          <p className="font-medium">{selectedVerification.documentType}</p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-600">Número de Documento</label>
                          <p className="font-medium">{selectedVerification.documentNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Documentos */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3">Documentos Subidos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Documento frontal */}
                        <div>
                          <label className="text-sm text-gray-600 block mb-2">
                            Documento de Identidad
                          </label>
                          {selectedVerification.documentFrontPhoto ? (
                            <a
                              href={getImageUrl(selectedVerification.documentFrontPhoto, 'identity')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={getImageUrl(selectedVerification.documentFrontPhoto, 'identity')}
                                alt="Documento frontal"
                                className="w-full rounded-lg border-2 border-gray-200 hover:border-primary transition cursor-pointer"
                              />
                            </a>
                          ) : (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <p className="text-gray-400">No disponible</p>
                            </div>
                          )}
                        </div>

                        {/* Selfie */}
                        <div>
                          <label className="text-sm text-gray-600 block mb-2">
                            Selfie con Documento
                          </label>
                          {selectedVerification.selfiePhoto ? (
                            <a
                              href={getImageUrl(selectedVerification.selfiePhoto, 'identity')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <img
                                src={getImageUrl(selectedVerification.selfiePhoto, 'identity')}
                                alt="Selfie"
                                className="w-full rounded-lg border-2 border-gray-200 hover:border-primary transition cursor-pointer"
                              />
                            </a>
                          ) : (
                            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                              <p className="text-gray-400">No disponible</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Haz clic en las imágenes para verlas en tamaño completo
                      </p>
                    </div>

                    {/* Campo de rechazo */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razón de rechazo (opcional)
                      </label>
                      <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Si vas a rechazar, explica la razón (ej: documento borroso, selfie no clara, etc.)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        rows="3"
                      />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleApprove(selectedVerification.id)}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <CheckCircle />
                        {processing ? 'Procesando...' : 'Aprobar Verificación'}
                      </button>
                      <button
                        onClick={() => handleReject(selectedVerification.id)}
                        disabled={processing || !rejectReason.trim()}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <XCircle />
                        {processing ? 'Procesando...' : 'Rechazar'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Selecciona una verificación
                  </h3>
                  <p className="text-gray-600">
                    Selecciona una verificación de la lista para ver los detalles y documentos
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerificationsPage;
