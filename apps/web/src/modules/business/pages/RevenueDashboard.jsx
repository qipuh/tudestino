import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, TrendingUp, Percent, DollarSign, BarChart3 } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as revenueService from '../../../services/revenueService';
import BusinessLayout from '../components/BusinessLayout';

const fmt = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const monthAgo = new Date();
monthAgo.setDate(monthAgo.getDate() - 30);

function KpiCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 text-gray-500 mb-2">
        <Icon size={18} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

function RevenueDashboard() {
  const { id: businessId } = useParams();
  const { fetchBusinessProperty } = useBusinessProperty();

  const [startDate, setStartDate] = useState(fmt(monthAgo));
  const [endDate, setEndDate] = useState(fmt(today));
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const propResult = await fetchBusinessProperty(businessId);
      const propertyId = propResult?.data?.id;
      if (!propertyId) {
        setError('Este negocio no tiene una propiedad configurada');
        return;
      }
      const data = await revenueService.getKPIs(propertyId, startDate, endDate);
      setKpis(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar KPIs');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [businessId, startDate, endDate]);

  useEffect(() => {
    load();
  }, [businessId, startDate, endDate]);

  return (
    <BusinessLayout activeMenu="revenue">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
          <p className="text-gray-600 mt-1">Indicadores clave del período seleccionado</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-lg px-3 py-2" />
          <span className="text-gray-400">→</span>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded-lg px-3 py-2" />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : kpis && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KpiCard icon={Percent} label="Ocupación" value={`${kpis.occupancy}%`} sub={`${kpis.soldRoomNights} / ${kpis.availableRoomNights} habitaciones-noche`} />
            <KpiCard icon={DollarSign} label="ADR" value={`S/ ${kpis.adr}`} sub="Tarifa promedio por noche vendida" />
            <KpiCard icon={TrendingUp} label="RevPAR" value={`S/ ${kpis.revpar}`} sub="Ingreso por habitación disponible" />
            <KpiCard icon={BarChart3} label="GOPPAR (simplificado)" value={`S/ ${kpis.goppar}`} sub="Facturado / habitación disponible, sin costos operativos" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">Ingresos por alojamiento</p>
              <p className="text-2xl font-bold text-gray-900">S/ {kpis.roomRevenue}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">Reservas en el período</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.bookingsCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-sm text-gray-500 mb-1">Tasa de cancelación</p>
              <p className="text-2xl font-bold text-gray-900">{kpis.cancellationRate}%</p>
              <p className="text-xs text-gray-500 mt-1">{kpis.cancelledCount} cancelada(s)</p>
            </div>
          </div>
        </>
      )}
    </BusinessLayout>
  );
}

export default RevenueDashboard;
