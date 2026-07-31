import React, { useState } from 'react';
import { ArrowLeft, Loader, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

export default function PayoutsPage() {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState('');
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchPayouts = async (e) => {
    e.preventDefault();
    if (!businessId) return;

    try {
      setLoading(true);
      const data = await adminService.getPayoutsByBusiness(businessId);
      setPayouts(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando payouts');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerPayout = async (bId) => {
    try {
      setLoading(true);
      await adminService.triggerPayout(bId, {
        periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        periodEnd: new Date()
      });
      alert('Payout procesado exitosamente');
      handleSearchPayouts({ preventDefault: () => {} });
    } catch (err) {
      console.error('Error:', err);
      alert('Error procesando payout: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    paid: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700'
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
          <h1 className="text-3xl font-bold">Gestión de Payouts</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleSearchPayouts} className="flex gap-4">
            <input
              type="text"
              placeholder="ID del negocio"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        {/* Payouts List */}
        {loading && businessId ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : payouts.length === 0 && businessId ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay payouts para este negocio</p>
          </div>
        ) : payouts.length > 0 ? (
          <div className="space-y-4">
            {payouts.map(payout => (
              <div key={payout.id} className="bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 text-sm">Período</p>
                    <p className="font-semibold">
                      {new Date(payout.periodStart).toLocaleDateString()} -{' '}
                      {new Date(payout.periodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Monto Bruto</p>
                    <p className="font-bold text-lg">S/ {payout.grossAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Deducciones</p>
                    <p className="font-bold text-orange-600">S/ {payout.deductions?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Neto</p>
                    <p className="font-bold text-green-600">S/ {payout.totalAmount?.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Estado</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[payout.status]}`}>
                      {payout.status}
                    </span>
                  </div>
                </div>

                {payout.status !== 'paid' && (
                  <div className="border-t pt-4 flex gap-4">
                    <button
                      onClick={() => handleTriggerPayout(businessId)}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <DollarSign size={18} />
                      Procesar Payout
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
