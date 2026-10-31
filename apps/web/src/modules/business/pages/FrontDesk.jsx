import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { LogIn, LogOut, Loader2, DoorOpen, Lock, Unlock } from 'lucide-react';
import useBusinessProperty from '../hooks/useBusinessProperty';
import * as frontDeskService from '../../../services/frontDeskService';
import BusinessLayout from '../components/BusinessLayout';

const unitTileClass = {
  available: 'bg-green-50 border-green-300 text-green-800',
  occupied: 'bg-blue-50 border-blue-300 text-blue-800',
  maintenance: 'bg-amber-50 border-amber-300 text-amber-800',
  blocked: 'bg-gray-100 border-gray-300 text-gray-600',
};

const today = () => new Date().toISOString().slice(0, 10);

function FrontDesk() {
  const { id: businessId } = useParams();
  const { property, fetchBusinessProperty } = useBusinessProperty();

  const [tab, setTab] = useState('map');
  const [date, setDate] = useState(today());
  const [roomMap, setRoomMap] = useState([]);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checkInFor, setCheckInFor] = useState(null); // arrival being checked in

  const loadProperty = useCallback(async () => {
    const result = await fetchBusinessProperty(businessId);
    return result?.data?.id || null;
  }, [businessId, fetchBusinessProperty]);

  const loadAll = useCallback(async (propertyId) => {
    if (!propertyId) return;
    setLoading(true);
    setError(null);
    try {
      const [map, arr, dep] = await Promise.all([
        frontDeskService.getRoomMap(propertyId),
        frontDeskService.getArrivals(propertyId, date),
        frontDeskService.getDepartures(propertyId, date),
      ]);
      setRoomMap(map || []);
      setArrivals(arr || []);
      setDepartures(dep || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar front-desk');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    (async () => {
      const propertyId = property?.id || (await loadProperty());
      await loadAll(propertyId);
    })();
    // property/loadProperty/loadAll excluded on purpose: useBusinessProperty
    // returns fresh function identities every render (not memoized), so
    // including them here causes an infinite effect loop.
  }, [businessId, date]);

  const refresh = async () => {
    if (property?.id) await loadAll(property.id);
  };

  const handleCheckOut = async (stayId) => {
    if (!stayId) return;
    if (!confirm('¿Confirmar check-out?')) return;
    try {
      await frontDeskService.checkOut({ stayId });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo hacer check-out');
    }
  };

  const handleToggleBlock = async (unit) => {
    const next = unit.operationalStatus === 'blocked' ? 'available' : 'blocked';
    try {
      await frontDeskService.setUnitStatus(unit.id, { operationalStatus: next });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo cambiar el estado');
    }
  };

  const availableUnitsForRoom = (roomId) => {
    const group = roomMap.find((r) => r.roomId === roomId);
    return group ? group.units.filter((u) => u.operationalStatus === 'available') : [];
  };

  const handleConfirmCheckIn = async (roomUnitId) => {
    if (!checkInFor) return;
    try {
      await frontDeskService.checkIn({ bookingId: checkInFor.bookingId, roomUnitId });
      setCheckInFor(null);
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo hacer check-in');
    }
  };

  return (
    <BusinessLayout activeMenu="front-desk">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recepción</h1>
          <p className="text-gray-600 mt-1">Mapa de habitaciones, llegadas y salidas del día</p>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-lg px-3 py-2"
        />
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'map', label: 'Mapa de habitaciones' },
          { key: 'arrivals', label: `Llegadas (${arrivals.length})` },
          { key: 'departures', label: `Salidas (${departures.length})` },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t.key ? 'bg-primary text-white' : 'bg-white text-gray-700 border'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      ) : (
        <>
          {tab === 'map' && (
            <div className="space-y-6">
              {roomMap.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
                  No hay unidades físicas creadas todavía. Ve a Habitaciones → Gestionar unidades físicas.
                </div>
              )}
              {roomMap.map((group) => (
                <div key={group.roomId} className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-4">{group.roomName}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {group.units.map((unit) => (
                      <div
                        key={unit.id}
                        className={`border rounded-lg p-3 text-sm ${unitTileClass[unit.operationalStatus]}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold flex items-center gap-1">
                            <DoorOpen size={14} /> {unit.unitNumber}
                          </span>
                          {unit.housekeepingStatus === 'dirty' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500" title="Sucia" />
                          )}
                          {unit.housekeepingStatus === 'out_of_service' && (
                            <span className="w-2 h-2 rounded-full bg-red-500" title="Fuera de servicio" />
                          )}
                        </div>
                        {unit.currentGuest ? (
                          <p className="text-xs truncate mb-2">{unit.currentGuest.name}</p>
                        ) : (
                          <p className="text-xs text-gray-400 mb-2">&nbsp;</p>
                        )}
                        <div className="flex gap-1">
                          {unit.operationalStatus === 'occupied' && (
                            <button
                              onClick={() => handleCheckOut(unit.stayId)}
                              className="flex-1 bg-white/70 hover:bg-white rounded px-2 py-1 text-xs font-medium flex items-center justify-center gap-1"
                            >
                              <LogOut size={12} /> Check-out
                            </button>
                          )}
                          {(unit.operationalStatus === 'available' || unit.operationalStatus === 'blocked') && (
                            <button
                              onClick={() => handleToggleBlock(unit)}
                              className="flex-1 bg-white/70 hover:bg-white rounded px-2 py-1 text-xs font-medium flex items-center justify-center gap-1"
                            >
                              {unit.operationalStatus === 'blocked' ? <Unlock size={12} /> : <Lock size={12} />}
                              {unit.operationalStatus === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'arrivals' && (
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {arrivals.length === 0 && <p className="p-6 text-gray-500 text-sm">Sin llegadas para esta fecha.</p>}
              {arrivals.map((a) => (
                <div key={a.bookingId} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{a.guest?.name || 'Huésped'}</p>
                    <p className="text-xs text-gray-500">{a.checkIn} → {a.checkOut} · {a.guests} huésped(es)</p>
                  </div>
                  <button
                    onClick={() => setCheckInFor(a)}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <LogIn size={16} /> Check-in
                  </button>
                </div>
              ))}
            </div>
          )}

          {tab === 'departures' && (
            <div className="bg-white rounded-lg shadow-sm divide-y">
              {departures.length === 0 && <p className="p-6 text-gray-500 text-sm">Sin salidas para esta fecha.</p>}
              {departures.map((d) => (
                <div key={d.bookingId} className="p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{d.guest?.name || 'Huésped'}</p>
                    <p className="text-xs text-gray-500">{d.checkIn} → {d.checkOut} · {d.guests} huésped(es)</p>
                  </div>
                  <button
                    onClick={() => handleCheckOut(d.stay?.id)}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <LogOut size={16} /> Check-out
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de check-in: elegir unidad física disponible */}
      {checkInFor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Check-in</h3>
            <p className="text-sm text-gray-600 mb-4">{checkInFor.guest?.name} — elige la unidad física</p>

            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {availableUnitsForRoom(checkInFor.roomId).length === 0 && (
                <p className="text-sm text-amber-600">No hay unidades disponibles para este tipo de habitación.</p>
              )}
              {availableUnitsForRoom(checkInFor.roomId).map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => handleConfirmCheckIn(unit.id)}
                  className="w-full text-left border rounded-lg px-4 py-2 hover:border-primary hover:bg-primary/5"
                >
                  Unidad {unit.unitNumber} {unit.floor ? `· Piso ${unit.floor}` : ''}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCheckInFor(null)}
              className="w-full border rounded-lg py-2 text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}

export default FrontDesk;
