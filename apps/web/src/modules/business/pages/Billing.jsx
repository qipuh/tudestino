import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Plus, DollarSign, Lock, Unlock, Receipt, Undo2 } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as billingService from '../../../services/billingService';
import * as bookingService from '../../bookings/services/bookingService';
import BusinessLayout from '../components/BusinessLayout';

const statusLabel = {
  issued: { label: 'Emitida', className: 'bg-amber-100 text-amber-700' },
  paid: { label: 'Pagada', className: 'bg-green-100 text-green-700' },
  void: { label: 'Anulada', className: 'bg-gray-200 text-gray-600' },
  credited: { label: 'Reembolsada', className: 'bg-red-100 text-red-700' },
};

const methodLabel = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', other: 'Otro' };

function Billing() {
  const { id: businessId } = useParams();
  const { fetchBusinessProperty } = useBusinessProperty();

  const [invoices, setInvoices] = useState([]);
  const [register, setRegister] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ bookingId: '', extraLineItems: [] });

  const [showOpenRegister, setShowOpenRegister] = useState(false);
  const [openingFloat, setOpeningFloat] = useState('0');

  const [showCloseRegister, setShowCloseRegister] = useState(false);
  const [countedCash, setCountedCash] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ method: 'cash', amount: '', reference: '' });
  const [refundForm, setRefundForm] = useState({ method: 'cash', amount: '', reason: '' });

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
      const [invoicesData, registerData, myBookings] = await Promise.all([
        billingService.listInvoices(businessId),
        billingService.getCurrentCashRegister(businessId),
        bookingService.getMyBookings().catch(() => []),
      ]);
      setInvoices(invoicesData || []);
      setRegister(registerData || null);
      setBookings((myBookings || []).filter((b) => b.propertyId === propertyId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar facturación');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [businessId]);

  useEffect(() => {
    load();
  }, [businessId]);

  const refreshInvoice = async (invoiceId) => {
    const data = await billingService.getInvoice(invoiceId);
    setSelectedInvoice(data);
    setInvoices((prev) => prev.map((inv) => (inv.id === invoiceId ? data : inv)));
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!newInvoice.bookingId) return;
    try {
      const invoice = await billingService.createInvoice({
        bookingId: newInvoice.bookingId,
        extraLineItems: newInvoice.extraLineItems.filter((i) => i.concept),
      });
      setShowNewInvoice(false);
      setNewInvoice({ bookingId: '', extraLineItems: [] });
      await load();
      setSelectedInvoice(invoice);
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo crear la factura');
    }
  };

  const addExtraLine = () => {
    setNewInvoice((prev) => ({ ...prev, extraLineItems: [...prev.extraLineItems, { concept: '', quantity: 1, unitPrice: 0 }] }));
  };

  const updateExtraLine = (idx, field, value) => {
    setNewInvoice((prev) => ({
      ...prev,
      extraLineItems: prev.extraLineItems.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    }));
  };

  const handleOpenRegister = async (e) => {
    e.preventDefault();
    try {
      await billingService.openCashRegister(businessId, Number(openingFloat) || 0);
      setShowOpenRegister(false);
      setOpeningFloat('0');
      await load();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo abrir la caja');
    }
  };

  const handleCloseRegister = async (e) => {
    e.preventDefault();
    if (countedCash === '') return;
    try {
      const closed = await billingService.closeCashRegister(register.id, { countedCash: Number(countedCash) });
      setShowCloseRegister(false);
      setCountedCash('');
      await load();
      alert(`Caja cerrada. Esperado: S/ ${closed.expectedCash} · Contado: S/ ${closed.countedCash} · Diferencia: S/ ${closed.difference}`);
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo cerrar la caja');
    }
  };

  const handleAddPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount) return;
    try {
      await billingService.addPayment(selectedInvoice.id, { ...paymentForm, amount: Number(paymentForm.amount) });
      setPaymentForm({ method: 'cash', amount: '', reference: '' });
      await refreshInvoice(selectedInvoice.id);
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo registrar el pago');
    }
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    if (!refundForm.amount || !refundForm.reason) return;
    try {
      await billingService.issueRefund(selectedInvoice.id, { ...refundForm, amount: Number(refundForm.amount) });
      setRefundForm({ method: 'cash', amount: '', reason: '' });
      await refreshInvoice(selectedInvoice.id);
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo registrar el reembolso');
    }
  };

  return (
    <BusinessLayout activeMenu="billing">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Facturación y Caja</h1>
          <p className="text-gray-600 mt-1">Facturas, pagos, reembolsos y cierre de caja</p>
        </div>
        <button
          onClick={() => setShowNewInvoice(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <Plus size={16} /> Nueva factura
        </button>
      </div>

      {/* Estado de caja */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${register?.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {register?.status === 'open' ? <Unlock size={18} /> : <Lock size={18} />}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {register?.status === 'open' ? 'Caja abierta' : 'Caja cerrada'}
            </p>
            {register?.status === 'open' && (
              <p className="text-sm text-gray-500">Fondo inicial: S/ {register.openingFloat}</p>
            )}
          </div>
        </div>
        {register?.status === 'open' ? (
          <button
            onClick={() => setShowCloseRegister(true)}
            className="border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cerrar caja
          </button>
        ) : (
          <button
            onClick={() => setShowOpenRegister(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Abrir caja
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {invoices.length === 0 && <p className="p-6 text-gray-500 text-sm">Todavía no hay facturas.</p>}
          {invoices.map((inv) => (
            <button
              key={inv.id}
              onClick={async () => setSelectedInvoice(await billingService.getInvoice(inv.id))}
              className="w-full text-left p-4 flex items-center justify-between gap-4 hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <Receipt size={18} className="text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">S/ {inv.total}</p>
                  <p className="text-xs text-gray-500">Emitida {new Date(inv.issuedAt).toLocaleDateString('es-PE')} · Pagado S/ {inv.amountPaid}</p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusLabel[inv.status]?.className}`}>
                {statusLabel[inv.status]?.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Modal: nueva factura */}
      {showNewInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCreateInvoice} className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900">Nueva factura</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reserva</label>
              <select
                value={newInvoice.bookingId}
                onChange={(e) => setNewInvoice({ ...newInvoice, bookingId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
                required
              >
                <option value="">Selecciona una reserva</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.checkIn} → {b.checkOut} · S/ {b.totalPrice}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Se factura alojamiento + limpieza + servicio de la reserva automáticamente.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">Cargos extra (opcional)</label>
                <button type="button" onClick={addExtraLine} className="text-xs text-primary font-medium">+ Agregar</button>
              </div>
              {newInvoice.extraLineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-5 gap-2 mb-2">
                  <input
                    placeholder="Concepto"
                    value={item.concept}
                    onChange={(e) => updateExtraLine(idx, 'concept', e.target.value)}
                    className="col-span-3 border rounded-lg px-2 py-1.5 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Cant."
                    value={item.quantity}
                    onChange={(e) => updateExtraLine(idx, 'quantity', e.target.value)}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="P. unit"
                    value={item.unitPrice}
                    onChange={(e) => updateExtraLine(idx, 'unitPrice', e.target.value)}
                    className="border rounded-lg px-2 py-1.5 text-sm"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowNewInvoice(false)} className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-primary text-white rounded-lg py-2 font-medium">
                Crear factura
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: abrir caja */}
      {showOpenRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleOpenRegister} className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Abrir caja</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fondo inicial (S/)</label>
              <input
                type="number"
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowOpenRegister(false)} className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-primary text-white rounded-lg py-2 font-medium">
                Abrir
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: cerrar caja */}
      {showCloseRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleCloseRegister} className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Cerrar caja</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo contado (S/)</label>
              <input
                type="number"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowCloseRegister(false)} className="flex-1 border rounded-lg py-2 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button type="submit" className="flex-1 bg-primary text-white rounded-lg py-2 font-medium">
                Cerrar caja
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Detalle de factura */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Factura</h3>
                <span className={`text-xs px-2 py-1 rounded-full ${statusLabel[selectedInvoice.status]?.className}`}>
                  {statusLabel[selectedInvoice.status]?.label}
                </span>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="border rounded-lg divide-y">
              {selectedInvoice.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between p-2 text-sm">
                  <span>{item.concept} {item.quantity > 1 ? `×${item.quantity}` : ''}</span>
                  <span className="font-medium">S/ {item.total}</span>
                </div>
              ))}
              <div className="flex justify-between p-2 text-sm font-bold bg-gray-50">
                <span>Total</span>
                <span>S/ {selectedInvoice.total}</span>
              </div>
              <div className="flex justify-between p-2 text-sm text-gray-600">
                <span>Pagado</span>
                <span>S/ {selectedInvoice.amountPaid}</span>
              </div>
              <div className="flex justify-between p-2 text-sm font-medium">
                <span>Saldo</span>
                <span>S/ {(Number(selectedInvoice.total) - Number(selectedInvoice.amountPaid)).toFixed(2)}</span>
              </div>
            </div>

            {selectedInvoice.payments?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Movimientos</p>
                <div className="space-y-1">
                  {selectedInvoice.payments.map((p) => (
                    <div key={p.id} className="flex justify-between text-xs text-gray-600 border-b pb-1">
                      <span className="flex items-center gap-1">
                        {p.isRefund && <Undo2 size={12} className="text-red-500" />}
                        {methodLabel[p.method]} {p.reference ? `(${p.reference})` : ''}
                      </span>
                      <span className={p.isRefund ? 'text-red-600' : ''}>S/ {p.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedInvoice.status !== 'void' && selectedInvoice.status !== 'credited' && Number(selectedInvoice.amountPaid) < Number(selectedInvoice.total) && (
              <form onSubmit={handleAddPayment} className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1"><DollarSign size={14} /> Registrar pago</p>
                <div className="grid grid-cols-3 gap-2">
                  <select value={paymentForm.method} onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm">
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="other">Otro</option>
                  </select>
                  <input type="number" placeholder="Monto" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm" />
                  <input placeholder="Referencia" value={paymentForm.reference} onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm" />
                </div>
                <button type="submit" className="w-full bg-primary text-white rounded-lg py-2 text-sm font-medium">Registrar pago</button>
              </form>
            )}

            {Number(selectedInvoice.amountPaid) > 0 && (
              <form onSubmit={handleIssueRefund} className="border-t pt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-1"><Undo2 size={14} /> Reembolso / nota de crédito</p>
                <div className="grid grid-cols-3 gap-2">
                  <select value={refundForm.method} onChange={(e) => setRefundForm({ ...refundForm, method: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm">
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="other">Otro</option>
                  </select>
                  <input type="number" placeholder="Monto" value={refundForm.amount} onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm" />
                  <input placeholder="Motivo" value={refundForm.reason} onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })} className="border rounded-lg px-2 py-1.5 text-sm" />
                </div>
                <button type="submit" className="w-full border border-red-500 text-red-600 rounded-lg py-2 text-sm font-medium hover:bg-red-50">Registrar reembolso</button>
              </form>
            )}
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}

export default Billing;
