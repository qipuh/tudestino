# Plan de Mejoras: Búsqueda y Reserva Mobile

**Estado**: EN PROGRESO
**Objetivo**: Implementar flujo de búsqueda y reserva similar a la versión web

---

## ✅ COMPLETADO

### 1. Pantalla de Búsqueda de Lugares
- ✅ Creada `location_search_screen.dart`
- ✅ Autocompletado de lugares
- ✅ Destinos populares predefinidos
- ✅ Integración con geocoding

---

## 📋 TAREAS PENDIENTES

### 2. Selector de Calendario (2 Meses)
**Archivo a crear**: `apps/mobile/lib/modules/search/date_range_selector_screen.dart`

**Funcionalidad**:
- Mostrar 2 meses por defecto
- No permitir seleccionar checkout antes de checkin
- Validación de rango mínimo (1 noche)
- Navegación fluida entre pasos

**Código base**:
```dart
import 'package:flutter/material.dart';
import 'package:table_calendar/table_calendar.dart';

class DateRangeSelectorScreen extends StatefulWidget {
  final DateTime? initialCheckIn;
  final DateTime? initialCheckOut;

  const DateRangeSelectorScreen({
    super.key,
    this.initialCheckIn,
    this.initialCheckOut,
  });

  @override
  State<DateRangeSelectorScreen> createState() => _DateRangeSelectorScreenState();
}

class _DateRangeSelectorScreenState extends State<DateRangeSelectorScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _checkInDate;
  DateTime? _checkOutDate;

  @override
  void initState() {
    super.initState();
    _checkInDate = widget.initialCheckIn;
    _checkOutDate = widget.initialCheckOut;
  }

  void _onDaySelected(DateTime selectedDay, DateTime focusedDay) {
    if (_checkInDate == null || (_checkInDate != null && _checkOutDate != null)) {
      // Seleccionar check-in
      setState(() {
        _checkInDate = selectedDay;
        _checkOutDate = null;
        _focusedDay = focusedDay;
      });
    } else if (_checkInDate != null && _checkOutDate == null) {
      // Seleccionar check-out
      if (selectedDay.isAfter(_checkInDate!)) {
        setState(() {
          _checkOutDate = selectedDay;
        });
      } else {
        // Mostrar error
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('La fecha de salida debe ser posterior a la fecha de entrada'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('¿Cuándo viajas?'),
        actions: [
          if (_checkInDate != null && _checkOutDate != null)
            TextButton(
              onPressed: () {
                Navigator.pop(context, {
                  'checkIn': _checkInDate,
                  'checkOut': _checkOutDate,
                });
              },
              child: const Text('Continuar'),
            ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Info Card
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildDateInfo(
                    'Entrada',
                    _checkInDate,
                    Icons.login,
                  ),
                  Container(
                    height: 40,
                    width: 1,
                    color: Colors.grey.shade300,
                  ),
                  _buildDateInfo(
                    'Salida',
                    _checkOutDate,
                    Icons.logout,
                  ),
                ],
              ),
            ),

            // Calendar (Mes 1)
            TableCalendar(
              firstDay: DateTime.now(),
              lastDay: DateTime.now().add(const Duration(days: 365)),
              focusedDay: _focusedDay,
              calendarFormat: CalendarFormat.month,
              selectedDayPredicate: (day) {
                return isSameDay(_checkInDate, day) || isSameDay(_checkOutDate, day);
              },
              rangeStartDay: _checkInDate,
              rangeEndDay: _checkOutDate,
              onDaySelected: _onDaySelected,
              calendarStyle: CalendarStyle(
                todayDecoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withAlpha(100),
                  shape: BoxShape.circle,
                ),
                selectedDecoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  shape: BoxShape.circle,
                ),
                rangeHighlightColor: Theme.of(context).primaryColor.withAlpha(50),
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
              ),
            ),

            // Calendar (Mes 2)
            TableCalendar(
              firstDay: DateTime.now().add(const Duration(days: 30)),
              lastDay: DateTime.now().add(const Duration(days: 365)),
              focusedDay: _focusedDay.add(const Duration(days: 30)),
              calendarFormat: CalendarFormat.month,
              selectedDayPredicate: (day) {
                return isSameDay(_checkInDate, day) || isSameDay(_checkOutDate, day);
              },
              rangeStartDay: _checkInDate,
              rangeEndDay: _checkOutDate,
              onDaySelected: _onDaySelected,
              calendarStyle: CalendarStyle(
                todayDecoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withAlpha(100),
                  shape: BoxShape.circle,
                ),
                selectedDecoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  shape: BoxShape.circle,
                ),
                rangeHighlightColor: Theme.of(context).primaryColor.withAlpha(50),
              ),
              headerStyle: const HeaderStyle(
                formatButtonVisible: false,
                titleCentered: true,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDateInfo(String label, DateTime? date, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: Theme.of(context).primaryColor),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          date != null
              ? '${date.day}/${date.month}/${date.year}'
              : 'Seleccionar',
          style: TextStyle(
            fontSize: 16,
            fontWeight: date != null ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
```

### 3. Selector de Huéspedes
**Archivo a crear**: `apps/mobile/lib/modules/search/guests_selector_screen.dart`

**Funcionalidad**:
- Selector de adultos (1-16)
- Selector de niños (0-10)
- Incrementar/decrementar con botones
- Mostrar totales

**Código base**:
```dart
import 'package:flutter/material.dart';

class GuestsSelectorScreen extends StatefulWidget {
  final int initialAdults;
  final int initialChildren;

  const GuestsSelectorScreen({
    super.key,
    this.initialAdults = 2,
    this.initialChildren = 0,
  });

  @override
  State<GuestsSelectorScreen> createState() => _GuestsSelectorScreenState();
}

class _GuestsSelectorScreenState extends State<GuestsSelectorScreen> {
  late int _adults;
  late int _children;

  @override
  void initState() {
    super.initState();
    _adults = widget.initialAdults;
    _children = widget.initialChildren;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('¿Quiénes viajan?'),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context, {
                'adults': _adults,
                'children': _children,
              });
            },
            child: const Text('Confirmar'),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildGuestCounter(
            'Adultos',
            'Mayores de 18 años',
            _adults,
            Icons.person,
            (value) => setState(() => _adults = value),
            min: 1,
            max: 16,
          ),
          const Divider(height: 32),
          _buildGuestCounter(
            'Niños',
            'Menores de 18 años',
            _children,
            Icons.child_care,
            (value) => setState(() => _children = value),
            min: 0,
            max: 10,
          ),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Total de huéspedes',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text(
                  '${_adults + _children}',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGuestCounter(
    String title,
    String subtitle,
    int value,
    IconData icon,
    Function(int) onChanged,
    {int min = 0, int max = 16}
  ) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Theme.of(context).primaryColor.withAlpha(25),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: Theme.of(context).primaryColor),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Text(
                subtitle,
                style: TextStyle(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
        Row(
          children: [
            IconButton(
              onPressed: value > min
                  ? () => onChanged(value - 1)
                  : null,
              icon: const Icon(Icons.remove_circle_outline),
              color: Theme.of(context).primaryColor,
            ),
            SizedBox(
              width: 40,
              child: Text(
                value.toString(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            IconButton(
              onPressed: value < max
                  ? () => onChanged(value + 1)
                  : null,
              icon: const Icon(Icons.add_circle_outline),
              color: Theme.of(context).primaryColor,
            ),
          ],
        ),
      ],
    );
  }
}
```

### 4. Pantalla de Resultados con Mapa
**Archivo a modificar**: `apps/mobile/lib/modules/search/search_screen.dart`

**Cambios necesarios**:

1. **Agregar Google Maps** (requiere API key):
   - Crear archivo `android/app/src/main/AndroidManifest.xml` con API key
   - Agregar `<meta-data android:name="com.google.android.geo.API_KEY" android:value="YOUR_API_KEY"/>`

2. **Layout con mapa arriba y lista abajo**:
```dart
Column(
  children: [
    // Mapa (40% de altura)
    Expanded(
      flex: 4,
      child: GoogleMap(
        initialCameraPosition: CameraPosition(
          target: LatLng(lat, lng),
          zoom: 12,
        ),
        markers: _markers,
        onMapCreated: (controller) {
          _mapController = controller;
        },
      ),
    ),

    // Lista de propiedades (60% de altura)
    Expanded(
      flex: 6,
      child: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,  // 2 propiedades por fila
          childAspectRatio: 0.75,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: properties.length,
        itemBuilder: (context, index) {
          return PropertyGridCard(property: properties[index]);
        },
      ),
    ),
  ],
)
```

3. **Crear marcadores desde propiedades**:
```dart
Set<Marker> _createMarkers(List<Property> properties) {
  return properties.map((property) {
    return Marker(
      markerId: MarkerId(property.id),
      position: LatLng(
        property.addressLatitude ?? 0,
        property.addressLongitude ?? 0,
      ),
      infoWindow: InfoWindow(
        title: property.displayName,
        snippet: '\$${property.minPrice}/noche',
      ),
      onTap: () {
        // Navegar a detalle de propiedad
        Navigator.of(context).pushNamed(
          '/property-detail',
          arguments: property.id,
        );
      },
    );
  }).toSet();
}
```

### 5. Grid de Propiedades (2 por fila)
**Archivo a crear**: `apps/mobile/lib/modules/properties/property_grid_card.dart`

```dart
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../models/property.dart';

class PropertyGridCard extends StatelessWidget {
  final Property property;

  const PropertyGridCard({super.key, required this.property});

  @override
  Widget build(BuildContext context) {
    final currencyFormat = NumberFormat.currency(symbol: '\$', decimalDigits: 0);

    return Card(
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () {
          Navigator.of(context).pushNamed(
            '/property-detail',
            arguments: property.id,
          );
        },
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Imagen
            Expanded(
              flex: 3,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  if (property.rooms.isNotEmpty &&
                      property.rooms.first.images.isNotEmpty)
                    CachedNetworkImage(
                      imageUrl: property.rooms.first.images.first,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: Colors.grey.shade200,
                        child: const Center(
                          child: CircularProgressIndicator(),
                        ),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: Colors.grey.shade200,
                        child: const Icon(Icons.hotel, size: 40),
                      ),
                    )
                  else
                    Container(
                      color: Colors.grey.shade200,
                      child: const Icon(Icons.hotel, size: 40),
                    ),

                  // Rating badge
                  if (property.ratingAverage >= 4.5)
                    Positioned(
                      top: 8,
                      right: 8,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              size: 12,
                              color: Colors.amber,
                            ),
                            const SizedBox(width: 2),
                            Text(
                              property.ratingAverage.toStringAsFixed(1),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Info
            Expanded(
              flex: 2,
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      property.displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on,
                          size: 12,
                          color: Colors.grey.shade600,
                        ),
                        const SizedBox(width: 2),
                        Expanded(
                          child: Text(
                            property.addressCity,
                            style: TextStyle(
                              fontSize: 11,
                              color: Colors.grey.shade600,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    Text(
                      '${currencyFormat.format(property.minPrice)}/noche',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 6. Flujo de Reserva en Pasos
**Archivos a crear**:
- `apps/mobile/lib/modules/bookings/booking_flow_screen.dart` - Pantalla principal
- `apps/mobile/lib/modules/bookings/guest_info_step.dart` - Paso 1: Info del huésped
- `apps/mobile/lib/modules/bookings/payment_step.dart` - Paso 2: Pago
- `apps/mobile/lib/modules/bookings/confirmation_step.dart` - Paso 3: Confirmación

**Estructura básica**:
```dart
class BookingFlowScreen extends StatefulWidget {
  final String propertyId;
  final DateTime checkIn;
  final DateTime checkOut;
  final int adults;
  final int children;

  @override
  State<BookingFlowScreen> createState() => _BookingFlowScreenState();
}

class _BookingFlowScreenState extends State<BookingFlowScreen> {
  int _currentStep = 0;

  // Datos del flujo
  Map<String, dynamic> _guestInfo = {};
  Map<String, dynamic> _paymentInfo = {};

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Reserva - Paso ${_currentStep + 1} de 3'),
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: _nextStep,
        onStepCancel: _prevStep,
        steps: [
          Step(
            title: const Text('Información del huésped'),
            content: GuestInfoStep(
              onDataChanged: (data) => _guestInfo = data,
            ),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: const Text('Pago'),
            content: PaymentStep(
              onDataChanged: (data) => _paymentInfo = data,
            ),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: const Text('Confirmación'),
            content: ConfirmationStep(
              property: _property,
              checkIn: widget.checkIn,
              checkOut: widget.checkOut,
              guestInfo: _guestInfo,
            ),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }
}
```

---

## 🔧 CONFIGURACIÓN NECESARIA

### Google Maps API Key

1. **Ir a Google Cloud Console**: https://console.cloud.google.com/
2. **Crear proyecto** o usar uno existente
3. **Habilitar APIs**:
   - Maps SDK for Android
   - Places API
4. **Crear credenciales** → API Key
5. **Restringir API key** (solo para producción):
   - Restricción de aplicación: Android apps
   - Agregar SHA-1 del certificado

### Agregar API Key a Android

**Archivo**: `apps/mobile/android/app/src/main/AndroidManifest.xml`

```xml
<manifest>
    <application>
        <!-- ... -->

        <!-- Google Maps API Key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="AIzaSy..." />  <!-- TU API KEY AQUÍ -->

    </application>
</manifest>
```

---

## 📦 DEPENDENCIAS A INSTALAR

```bash
cd apps/mobile
flutter pub get
```

Ya agregadas en `pubspec.yaml`:
- ✅ google_maps_flutter: ^2.5.3
- ✅ flutter_google_places_sdk: ^0.3.0
- ✅ table_calendar: ^3.0.9

---

## 🚀 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

1. ✅ Pantalla de búsqueda de lugares (COMPLETADO)
2. ⏳ Selector de fechas con 2 meses
3. ⏳ Selector de huéspedes
4. ⏳ Integrar todo en nuevo flujo de búsqueda
5. ⏳ Agregar mapa a pantalla de resultados
6. ⏳ Grid de propiedades (2 por fila)
7. ⏳ Marcadores clickeables en mapa
8. ⏳ Flujo de reserva en pasos
9. ⏳ Persistencia de datos entre pasos
10. ⏳ Pruebas y ajustes finales

---

## ⚠️ NOTAS IMPORTANTES

- Google Maps requiere API key (gratis hasta cierto límite)
- Para producción, restringir API key por SHA-1
- El flujo debe guardar estado para no perder datos al cambiar de pantalla
- Considerar usar Provider o Riverpod para compartir estado entre pasos

---

**Generado por Claude Code**
**Fecha**: 24 de Octubre, 2025
