# PMS TuDestino — progreso

Seguimiento del roadmap acordado (ver nota de arquitectura). Checklist vivo, se actualiza en cada sesión.

## Fase 1 — Front Desk + Housekeeping ✅ COMPLETA

- [x] Migración `room_units`, `front_desk_stays`, `housekeeping_tasks`
- [x] Modelos `RoomUnit`, `FrontDeskStay`, `HousekeepingTask` + asociaciones
- [x] Endpoint bulk `POST /properties/:propertyId/rooms/:roomId/units/bulk` (rango o lista)
- [x] CRUD unidades físicas (`room-unit.controller.js`)
- [x] `front-desk.service/controller/routes.js`: room-map, arrivals, departures, check-in, check-out, change-room, bloqueo de unidad
- [x] `housekeeping.service/controller/routes.js`: tareas, asignación, cambio de estado (auto-crea tarea al check-out)
- [x] Frontend: `RoomUnitsManager.jsx`, `FrontDesk.jsx`, `Housekeeping.jsx`, nav en `BusinessLayout`
- [x] E2E backend (`apps/api/test-pms-phase1-e2e.js`) — 15/15 checks
- [x] Prueba UI real con Playwright (bulk → check-in → check-out → tarea → resuelta) — 11/11 checks, 0 errores de consola

**Bugs encontrados y corregidos en el camino:**
- `users.role` en DB real no tiene `'host'` en el ENUM (el modelo lo declara pero nunca se migró) — todo dueño de propiedad real es `business_owner`. Rutas de front-desk/housekeeping/room-units corregidas para aceptar `business_owner`.
- Loop infinito de refetch en `FrontDesk.jsx`/`Housekeeping.jsx`: `useBusinessProperty()` no memoiza sus funciones, así que incluirlas en deps de `useEffect` retriggerea sin fin. Corregido acotando deps a valores primitivos.

## Fase 2 — Facturación y Caja ✅ COMPLETA

- [x] Migración `invoices`, `invoice_payments`, `cash_registers`
- [x] Modelos + asociaciones
- [x] Servicio: crear factura desde booking (desglose alojamiento/limpieza/servicio/extras), múltiples formas de pago (`cash`/`card`/`transfer`/`other`)
- [x] Cierre de caja diario (calcula `expectedCash` desde movimientos en efectivo del turno, `difference` vs lo contado)
- [x] Reembolsos / notas de crédito — modelados como `InvoicePayment` negativo (`isRefund`), no tabla aparte
- [x] Guest ledger (`GET /billing/bookings/:bookingId/ledger`) — total facturado, pagado, balance
- [x] E2E backend (`apps/api/test-billing-e2e.js`) — 19/19 checks
- [x] Frontend: `Billing.jsx` — apertura/cierre de caja, nueva factura, detalle con pagos/reembolsos, nav en `BusinessLayout`
- [x] Prueba UI real con Playwright — 10/10 checks, 0 errores de consola

**Simplificación consciente:** sin tabla `credit_notes` aparte ni "cuentas corporativas" — reembolsos viven en `invoice_payments` (amount negativo), y facturación a empresas queda para cuando haya un caso real que lo pida.

**Bugs de rol adicionales encontrados y corregidos** (misma familia que el de Fase 1 — `business_owner` es el rol real, `host` no existe en la DB):
- `bookings.controller.js` `getMyBookings`: solo miraba `role==='host'`, así que un dueño de hotel real (`business_owner`) recibía SUS PROPIAS reservas como huésped en vez de las de su propiedad. Corregido.
- `properties.routes.js`: 7 rutas (`update/delete room`, `update/delete property`, `upload images`, `update property full`) solo aceptaban `host`/`admin`, bloqueando a cualquier dueño de hotel real. Corregido a `host`, `business_owner`, `admin`.

**Nota de entorno (no bug de app):** al probar con `with_server.py` reiniciando el dev server de Vite en cada corrida, las primeras requests a rutas con módulos nuevos (muchos imports) pueden tardar y dar falsos negativos por timeout. Con servers persistentes (`nohup` + reutilizar el mismo proceso entre corridas) todo carga instantáneo. Para próximas pruebas UI: levantar servers una vez, reusar.

## Fase 3 — Rate Management + Revenue básico ✅ COMPLETA

- [x] Motor de tarifas dinámicas nuevo (`rate_rules`, por habitación) — `business_seasons` queda intacto, era solo etiqueta sin lógica de precio
- [x] 4 tipos de regla: temporada (rango de fechas), día de semana, early-bird (anticipación mínima), last-minute (anticipación máxima)
- [x] Ajuste porcentual o fijo, prioridad para resolver reglas superpuestas, restricciones de estancia mínima/máxima
- [x] Endpoint de cotización (`GET /rate-management/quote`) — noche por noche, con regla aplicada visible y violaciones de estancia
- [x] Dashboard KPI: RevPAR, ADR, Ocupación, GOPPAR (simplificado — sin costos operativos, ver nota abajo), ingresos, tasa de cancelación
- [x] E2E backend (`apps/api/test-rate-revenue-e2e.js`) — 19/19 checks
- [x] Frontend: `RateRulesManager.jsx` (crear/listar/borrar reglas por habitación, link "Gestionar tarifas" desde Servicios) + `RevenueDashboard.jsx` (selector de rango, tarjetas KPI), nav "Revenue" en `BusinessLayout`
- [x] Prueba UI real con Playwright — 9/9 checks (tras fix), 0 errores de consola

**Simplificación consciente:** sin paquetes promocionales ni restricciones por canal (no hay channel manager todavía, ver Fase 6) — quedan para cuando haya un caso real. GOPPAR usa facturación total / habitaciones-noche disponibles porque el sistema no registra costos operativos; está etiquetado "simplificado" en la UI para no aparentar más precisión de la que tiene.

**Bug real encontrado por la prueba UI (no por el E2E):** el filtro de solapamiento de fechas en `revenue.service.js` usaba `checkIn: Op.lt(endDate)` — excluía reservas cuyo check-in cae justo el último día del rango de reporte, mostrando 0% ocupación pese a tener una reserva válida. El E2E no lo agarró porque ningún caso de prueba tenía check-in exactamente en `endDate`. Corregido a `Op.lte` + agregado caso de borde al E2E (19/19 ahora). Lección: los E2E con datos "cómodos" no cubren bordes de fecha — la prueba en navegador con datos sembrados de forma más realista sí.

## Fase 4 — Mantenimiento + Inventario

- [ ] `maintenance_orders`: prioridad, categoría, técnico asignado
- [ ] `inventory_items` / stock, alertas de mínimo, proveedores, órdenes de compra

## Fase 5 — CRM/Loyalty + Autoservicio huésped

- [ ] Perfil de huésped extendido (historial, preferencias, lista negra/blanca)
- [ ] Segmentación, campañas, programa de fidelización
- [ ] Check-in digital / llave móvil (integración con app mobile existente)

## Fase 6 — Eventos, Spa y Channel Manager

- [ ] Eventos y salones (calendario, facturación de eventos)
- [ ] Spa: agenda de citas (extender patrón `business-service`)
- [ ] Conectores OTA (Booking, Expedia) — mayor riesgo/costo, integraciones externas

---

**Convenciones del proyecto:** ver nota de arquitectura publicada (artifact "Módulo PMS TuDestino"). Cada módulo nuevo vive en `apps/api/src/modules/<nombre>` con patrón `model/service/controller/routes`, IDs `CHAR(36)` UUID, migraciones con `up()/down()` ejecutables directo (`node run-<nombre>-migration.js`).
