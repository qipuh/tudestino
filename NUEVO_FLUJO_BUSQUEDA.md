# Nuevo Flujo de Búsqueda y Reserva - Mobile

**Fecha**: 24 de Octubre, 2025
**Estado**: IMPLEMENTADO ✅

---

## 🎯 OBJETIVO CUMPLIDO

Implementar flujo de búsqueda similar a la versión web con:
- ✅ Búsqueda de lugares paso a paso
- ✅ Selector de calendario con 2 meses
- ✅ Selector de huéspedes (adultos/niños)
- ✅ Mapa con marcadores de propiedades (flutter_map/Leaflet)
- ✅ Grid de propiedades (2 por fila)
- ✅ Marcadores clickeables que llevan a detalle de propiedad

---

## 📁 ARCHIVOS CREADOS

### 1. Búsqueda de Lugares
**Archivo**: `apps/mobile/lib/modules/search/location_search_screen.dart`

**Funcionalidad**:
- Búsqueda con autocompletado usando geocoding
- Destinos populares predefinidos (Cajamarca, Lima, Cusco, Arequipa, Trujillo)
- Retorna: `{name, lat, lng, description}`

**Navegación**:
```dart
final result = await Navigator.of(context).pushNamed('/location-search');
// result = {'name': 'Cajamarca, Perú', 'lat': -7.163, 'lng': -78.5008}
```

---

### 2. Selector de Fechas (2 Meses)
**Archivo**: `apps/mobile/lib/modules/search/date_range_selector_screen.dart`

**Funcionalidad**:
- Muestra 2 calendarios (mes actual + siguiente)
- No permite seleccionar fechas pasadas
- Validación: checkout debe ser después de checkin
- Muestra número de noches seleccionadas
- Interfaz visual con tarjeta de resumen

**Navegación**:
```dart
final result = await Navigator.of(context).pushNamed(
  '/date-selector',
  arguments: {
    'checkIn': existingCheckIn,
    'checkOut': existingCheckOut,
  },
);
// result = {'checkIn': DateTime, 'checkOut': DateTime}
```

**Validaciones**:
- ✅ No permite checkout antes de checkin
- ✅ Muestra mensaje de error si se intenta
- ✅ Calcula automáticamente número de noches
- ✅ Resalta rango seleccionado en calendario

---

### 3. Selector de Huéspedes
**Archivo**: `apps/mobile/lib/modules/search/guests_selector_screen.dart`

**Funcionalidad**:
- Selector de adultos (1-16)
- Selector de niños (0-10)
- Botones +/- con validación de límites
- Tarjeta de resumen con total
- Mensaje informativo sobre capacidad

**Navegación**:
```dart
final result = await Navigator.of(context).pushNamed(
  '/guests-selector',
  arguments: {
    'adults': currentAdults,
    'children': currentChildren,
  },
);
// result = {'adults': 2, 'children': 1}
```

---

### 4. Grid de Propiedades (2 por fila)
**Archivo**: `apps/mobile/lib/modules/properties/property_grid_card.dart`

**Características**:
- Diseño compacto para 2 columnas
- Imagen con placeholder
- Badge de rating (solo si >= 4.0)
- Botón de favorito (top-left)
- Ubicación con icono
- Precio destacado
- Estrellas de hotel si aplica

**Proporción**: `childAspectRatio: 0.68` (altura mayor que ancho)

---

### 5. Pantalla de Resultados con Mapa
**Archivo**: `apps/mobile/lib/modules/search/search_results_screen.dart`

**Layout**:
```
┌─────────────────────────┐
│   AppBar con filtros    │
├─────────────────────────┤
│                         │
│   Mapa (40% altura)     │ ← flutter_map con OpenStreetMap
│   + Marcadores          │
│                         │
├─────────────────────────┤
│ Header con contador     │
│ "12 propiedades"        │
├─────────────────────────┤
│  ┌────┐  ┌────┐        │
│  │ P1 │  │ P2 │        │ ← Grid 2x
│  └────┘  └────┘        │
│  ┌────┐  ┌────┐        │
│  │ P3 │  │ P4 │        │
│  └────┘  └────┘        │
│     (scroll)            │
│                         │
└─────────────────────────┘
```

**Mapa**:
- Tecnología: `flutter_map` (compatible con Leaflet)
- Tiles: OpenStreetMap (sin necesidad de API key)
- Marcadores: Burbujas con precio (estilo Airbnb)
- Hover effect: Marcador se agranda y cambia a negro
- Click: Navega a detalle de propiedad

**Marcadores**:
```dart
// Estilo normal: fondo blanco, texto negro, $precio
// Estilo hover: fondo negro, texto blanco, más grande
```

---

## 🚀 FLUJO COMPLETO DE BÚSQUEDA

### Paso 1: Usuario pulsa "Buscar" en Home

**Home Screen** → Muestra botón principal de búsqueda

```dart
ElevatedButton(
  onPressed: _startSearchFlow,
  child: const Text('Buscar'),
)
```

### Paso 2: Seleccionar Ubicación

```dart
Future<void> _startSearchFlow() async {
  // 1. Buscar lugar
  final location = await Navigator.pushNamed(context, '/location-search');
  if (location == null) return;

  setState(() {
    _selectedLocation = location;
  });

  // Continuar al siguiente paso...
}
```

### Paso 3: Seleccionar Fechas

```dart
// 2. Seleccionar fechas
final dates = await Navigator.pushNamed(
  context,
  '/date-selector',
  arguments: {
    'checkIn': _checkIn,
    'checkOut': _checkOut,
  },
);

if (dates == null) return;

setState(() {
  _checkIn = dates['checkIn'];
  _checkOut = dates['checkOut'];
});
```

### Paso 4: Seleccionar Huéspedes

```dart
// 3. Seleccionar huéspedes
final guests = await Navigator.pushNamed(
  context,
  '/guests-selector',
  arguments: {
    'adults': _adults,
    'children': _children,
  },
);

if (guests == null) return;

setState(() {
  _adults = guests['adults'];
  _children = guests['children'];
});
```

### Paso 5: Ver Resultados en Mapa

```dart
// 4. Navegar a resultados con mapa
Navigator.pushNamed(
  context,
  '/search-results',
  arguments: {
    'location': _selectedLocation['name'],
    'lat': _selectedLocation['lat'],
    'lng': _selectedLocation['lng'],
    'checkIn': _checkIn,
    'checkOut': _checkOut,
    'adults': _adults,
    'children': _children,
  },
);
```

---

## 🗺️ INTEGRACIÓN DE MAPA

### Tecnología Utilizada

**flutter_map** + **OpenStreetMap**
- ✅ Sin necesidad de API key
- ✅ Compatible con Leaflet (misma librería que web)
- ✅ Gratis e ilimitado
- ✅ Marcadores personalizables

### Dependencias Instaladas

```yaml
dependencies:
  flutter_map: ^6.1.0        # Mapa con OpenStreetMap
  latlong2: ^0.9.0           # Coordenadas geográficas
  table_calendar: ^3.0.9     # Calendario con rangos
  geolocator: ^10.1.0        # Geolocalización
  geocoding: ^2.1.1          # Geocoding (dirección ↔ coords)
```

### Configuración del Mapa

```dart
FlutterMap(
  options: MapOptions(
    initialCenter: LatLng(lat, lng),
    initialZoom: 12,
    minZoom: 5,
    maxZoom: 18,
  ),
  children: [
    // Capa de tiles (OpenStreetMap)
    TileLayer(
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      userAgentPackageName: 'com.tudestino.mobile',
    ),

    // Capa de marcadores
    MarkerLayer(
      markers: [/* lista de marcadores */],
    ),
  ],
)
```

### Marcadores Personalizados (Estilo Airbnb)

```dart
Marker(
  width: 75,
  height: 38,
  point: LatLng(lat, lng),
  child: Container(
    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
    decoration: BoxDecoration(
      color: isHovered ? Colors.black87 : Colors.white,
      borderRadius: BorderRadius.circular(24),
      border: Border.all(color: Colors.grey.shade300),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withAlpha(45),
          blurRadius: 4,
          offset: Offset(0, 2),
        ),
      ],
    ),
    child: Text(
      '\$${price}',
      style: TextStyle(
        color: isHovered ? Colors.white : Colors.black87,
        fontWeight: FontWeight.bold,
      ),
    ),
  ),
)
```

---

## 📱 RUTAS DE NAVEGACIÓN AGREGADAS

```dart
// navigation_service.dart

case '/location-search':
  return MaterialPageRoute(
    builder: (_) => LocationSearchScreen()
  );

case '/date-selector':
  return MaterialPageRoute(
    builder: (_) => DateRangeSelectorScreen(
      initialCheckIn: args['checkIn'],
      initialCheckOut: args['checkOut'],
    )
  );

case '/guests-selector':
  return MaterialPageRoute(
    builder: (_) => GuestsSelectorScreen(
      initialAdults: args['adults'] ?? 2,
      initialChildren: args['children'] ?? 0,
    )
  );

case '/search-results':
  return MaterialPageRoute(
    builder: (_) => SearchResultsScreen(
      location: args['location'],
      lat: args['lat'],
      lng: args['lng'],
      checkIn: args['checkIn'],
      checkOut: args['checkOut'],
      adults: args['adults'] ?? 2,
      children: args['children'] ?? 0,
    )
  );
```

---

## 🎨 DISEÑO UI/UX

### Paleta de Colores
- **Primary**: Color del theme (Turquesa `#16BED8`)
- **Cards**: Blanco con sombra sutil
- **Selección**: Primary con alpha 25-50
- **Hover/Focus**: Primary opaco
- **Bordes**: Grey 200-300

### Componentes Clave

#### 1. Tarjetas de Información
```dart
Container(
  padding: EdgeInsets.all(20),
  decoration: BoxDecoration(
    gradient: LinearGradient(
      colors: [
        theme.primaryColor.withAlpha(25),
        theme.primaryColor.withAlpha(10),
      ],
    ),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: theme.primaryColor.withAlpha(50),
    ),
  ),
  child: /* contenido */,
)
```

#### 2. Botones de Contador
```dart
Container(
  decoration: BoxDecoration(
    shape: BoxShape.circle,
    border: Border.all(
      color: theme.primaryColor.withAlpha(100),
    ),
  ),
  child: IconButton(
    icon: Icon(Icons.add),
    color: theme.primaryColor,
  ),
)
```

#### 3. Grid de Propiedades
```dart
GridView.builder(
  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    childAspectRatio: 0.68,
    crossAxisSpacing: 12,
    mainAxisSpacing: 12,
  ),
  itemBuilder: (context, index) {
    return PropertyGridCard(property: properties[index]);
  },
)
```

---

## ⚙️ MODIFICACIONES NECESARIAS EN HOME SCREEN

Para activar el nuevo flujo, actualizar `apps/mobile/lib/modules/home/home_screen.dart`:

### Opción 1: Botón Directo (Más Simple)

```dart
// En el botón de búsqueda del Home
ElevatedButton(
  onPressed: () async {
    // Ir directamente a selección de lugar
    final location = await Navigator.of(context).pushNamed('/location-search');

    if (location != null) {
      // Después de lugar, ir a fechas
      final dates = await Navigator.of(context).pushNamed('/date-selector');

      if (dates != null) {
        // Después de fechas, ir a huéspedes
        final guests = await Navigator.of(context).pushNamed('/guests-selector');

        if (guests != null) {
          // Ir a resultados
          Navigator.of(context).pushNamed(
            '/search-results',
            arguments: {
              'location': location['name'],
              'lat': location['lat'],
              'lng': location['lng'],
              'checkIn': dates['checkIn'],
              'checkOut': dates['checkOut'],
              'adults': guests['adults'],
              'children': guests['children'],
            },
          );
        }
      }
    }
  },
  child: const Text('Buscar alojamiento'),
)
```

### Opción 2: Con Estado (Más Flexible)

```dart
class _HomeScreenState extends State<HomeScreen> {
  Map<String, dynamic>? _selectedLocation;
  DateTime? _checkIn;
  DateTime? _checkOut;
  int _adults = 2;
  int _children = 0;

  Future<void> _startSearchFlow() async {
    // 1. Ubicación
    final location = await Navigator.pushNamed(context, '/location-search');
    if (location == null) return;

    _selectedLocation = location as Map<String, dynamic>;

    // 2. Fechas
    final dates = await Navigator.pushNamed(
      context,
      '/date-selector',
      arguments: {'checkIn': _checkIn, 'checkOut': _checkOut},
    );
    if (dates == null) return;

    final datesMap = dates as Map<String, dynamic>;
    _checkIn = datesMap['checkIn'];
    _checkOut = datesMap['checkOut'];

    // 3. Huéspedes
    final guests = await Navigator.pushNamed(
      context,
      '/guests-selector',
      arguments: {'adults': _adults, 'children': _children},
    );
    if (guests == null) return;

    final guestsMap = guests as Map<String, dynamic>;
    _adults = guestsMap['adults'];
    _children = guestsMap['children'];

    // 4. Resultados
    Navigator.pushNamed(
      context,
      '/search-results',
      arguments: {
        'location': _selectedLocation!['name'],
        'lat': _selectedLocation!['lat'],
        'lng': _selectedLocation!['lng'],
        'checkIn': _checkIn,
        'checkOut': _checkOut,
        'adults': _adults,
        'children': _children,
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: /* ... */,
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _startSearchFlow,
        icon: const Icon(Icons.search),
        label: const Text('Buscar'),
      ),
    );
  }
}
```

---

## 🧪 TESTING

### Flujo a Probar

1. **Abrir app** → Pantalla Home
2. **Tocar "Buscar"** → Va a selección de lugar
3. **Seleccionar "Cajamarca"** → Va a calendario
4. **Seleccionar entrada 25 Nov, salida 28 Nov** → Muestra "3 noches"
5. **Confirmar fechas** → Va a selector de huéspedes
6. **Seleccionar 2 adultos, 1 niño** → Muestra total 3
7. **Confirmar huéspedes** → Va a pantalla de resultados
8. **Ver mapa** → Debe mostrar marcadores con precios
9. **Click en marcador** → Debe ir a detalle de propiedad
10. **Scroll en grid** → Debe mostrar propiedades 2 por fila

### Validaciones a Verificar

- ✅ No permite checkout antes de checkin
- ✅ No permite seleccionar fechas pasadas
- ✅ Mínimo 1 adulto siempre
- ✅ Máximo 16 adultos, 10 niños
- ✅ Marcadores aparecen en ubicaciones correctas
- ✅ Grid responsive con 2 columnas

---

## 📦 COMPILAR APK

```bash
cd apps/mobile
flutter pub get
flutter build apk --release
```

**APK resultante**: `build/app/outputs/flutter-apk/app-release.apk`

---

## 🔄 COMPARACIÓN WEB vs MOBILE

| Característica | Web | Mobile | Estado |
|----------------|-----|--------|--------|
| **Búsqueda de lugar** | Input con dropdown | Pantalla dedicada | ✅ Mejorado |
| **Calendario** | Inline 2 meses | Pantalla dedicada 2 meses | ✅ Igual |
| **Huéspedes** | Dropdown con +/- | Pantalla dedicada con +/- | ✅ Mejorado |
| **Mapa** | Leaflet | flutter_map (Leaflet) | ✅ Igual |
| **Grid propiedades** | Variable | 2 fijas | ✅ Optimizado |
| **Marcadores** | Burbujas con $ | Burbujas con $ | ✅ Igual |
| **Marcador click** | Abre detalle | Abre detalle | ✅ Igual |

---

## 🚧 PENDIENTES (Opcionales)

### Funcionalidades No Críticas

1. **Filtros avanzados** en pantalla de resultados
   - Por precio
   - Por rating
   - Por tipo de propiedad
   - Por amenidades

2. **Ordenamiento** de resultados
   - Por precio (menor/mayor)
   - Por rating
   - Por distancia

3. **Guardar búsquedas** recientes
   - SharedPreferences
   - Lista en Home

4. **Autocompletar mejorado**
   - Integrar Google Places API
   - Búsqueda predictiva

5. **Clustering de marcadores**
   - Cuando hay muchos marcadores cercanos
   - Agregar en clusters con contador

---

## ✅ CHECKLIST FINAL

- [x] Pantalla de búsqueda de lugares
- [x] Selector de calendario (2 meses)
- [x] Selector de huéspedes
- [x] Grid de propiedades (2 por fila)
- [x] Pantalla de resultados con mapa
- [x] Marcadores con estilo Airbnb
- [x] Marcadores clickeables
- [x] Rutas de navegación configuradas
- [x] Dependencias instaladas
- [x] Sin necesidad de API keys
- [ ] Modificar HomeScreen para activar flujo
- [ ] Compilar y probar APK

---

**Generado por Claude Code**
**Fecha**: 24 de Octubre, 2025
