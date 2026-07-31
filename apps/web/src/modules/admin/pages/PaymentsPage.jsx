import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [totals, setTotals] = useState({ gross: 0, platform: 0, business: 0 });

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPayments({
        status: statusFilter || undefined,
        limit: 100
      });
      const paymentList = Array.isArray(data) ? data : (data.data || []);
      setPayments(paymentList);

      // Calculate totals
      const totalsData = paymentList.reduce(
        (acc, p) => ({
          gross: acc.gross + (p.grossAmount || 0),
          platform: acc.platform + (p.platformFeeAmount || 0),
          business: acc.business + (p.businessNetAmount || 0)
        }),
        { gross: 0, platform: 0, business: 0 }
      );
      setTotals(totalsData);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando pagos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-200 rounded"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Totales */}
        {!loading && payments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Monto Bruto Total</p>
              <p className="text-3xl font-bold">S/ {totals.gross.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Comisión Plataforma</p>
              <p className="text-3xl font-bold text-purple-600">S/ {totals.platform.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">Neto Negocios</p>
              <p className="text-3xl font-bold text-green-600">S/ {totals.business.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-8 flex gap-4 items-center">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completados</option>
            <option value="failed">Fallidos</option>
            <option value="refunded">Reembolsados</option>
          </select>
        </div>

        {/* Tabla de pagos */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">No hay pagos para mostrar</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">ID Reserva</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Negocio</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Monto Bruto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Comisión</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Neto</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(payment => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono">
                        {payment.reservationId?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {payment.businessId?.slice(0, 8)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">
                        S/ {payment.grossAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-purple-600 font-medium">
                        S/ {payment.platformFeeAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-green-600 font-medium">
                        S/ {payment.businessNetAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[payment.status]}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
