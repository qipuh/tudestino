import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

export default function BusinessVerificationPage() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(null);

  useEffect(() => {
    fetchPendingBusinesses();
  }, []);

  const fetchPendingBusinesses = async () => {
    try {
      setLoading(true);
      const data = await adminService.getBusinessesForVerification({
        status: 'pending',
        limit: 50
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

  const handleVerify = async (id) => {
    try {
      setVerifying(id);
      await adminService.verifyBusiness(id, { status: 'approved' });
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setVerifying(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Motivo del rechazo:');
    if (!reason) return;

    try {
      setVerifying(id);
      await adminService.rejectBusiness(id, reason);
      setBusinesses(businesses.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setVerifying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Verificación de Negocios</h1>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-medium">
            {businesses.length} pendientes
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Check size={48} className="mx-auto text-green-500 mb-4" />
            <p className="text-gray-600 text-lg">Todos los negocios han sido verificados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {businesses.map(business => (
              <div key={business.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                  {/* Info */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{business.name}</h2>
                    <p className="text-gray-600 mb-4">{business.description}</p>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Tipo:</span> {business.businessType}
                      </div>
                      <div>
                        <span className="font-medium">Propietario:</span> {business.ownerId?.slice(0, 8)}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {business.contactEmail || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Teléfono:</span> {business.contactPhone || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div>
                    <h3 className="font-semibold mb-3">Documentos</h3>
                    {business.verificationDocuments ? (
                      <div className="space-y-2 text-sm">
                        {typeof business.verificationDocuments === 'string'
                          ? business.verificationDocuments
                          : JSON.stringify(business.verificationDocuments, null, 2)
                        }
                      </div>
                    ) : (
                      <p className="text-gray-500">Sin documentos</p>
                    )}
                  </div>

                  {/* Datos Bancarios */}
                  <div>
                    <h3 className="font-semibold mb-3">Datos Bancarios</h3>
                    {business.bankAccount ? (
                      <div className="space-y-2 text-sm">
                        {typeof business.bankAccount === 'string'
                          ? business.bankAccount
                          : JSON.stringify(business.bankAccount, null, 2)
                        }
                      </div>
                    ) : (
                      <p className="text-gray-500">Sin datos bancarios</p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="border-t pt-4 flex gap-4">
                  <button
                    onClick={() => handleVerify(business.id)}
                    disabled={verifying === business.id}
                    className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    {verifying === business.id ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <Check size={20} />
                    )}
                    {verifying === business.id ? 'Aprobando...' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => handleReject(business.id)}
                    disabled={verifying === business.id}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                  >
                    {verifying === business.id ? (
                      <Loader size={20} className="animate-spin" />
                    ) : (
                      <X size={20} />
                    )}
                    {verifying === business.id ? 'Rechazando...' : 'Rechazar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
