import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_map_tile_caching/flutter_map_tile_caching.dart';
import 'package:latlong2/latlong.dart';

/// Envoltorio delgado sobre flutter_map_tile_caching (FMTC): un único store
/// compartido para todos los mapas de la app (grabación, detalle, feed,
/// planeador). `getTileProvider()` sirve tiles cacheados si no hay señal y
/// tiles frescos si hay, sin que cada pantalla tenga que saber de FMTC.
class OfflineMapService {
  static const _storeName = 'tudestino_tiles';
  static const _tileUrlTemplate = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  static const _userAgentPackageName = 'com.tudestino.mobile';

  static bool _initialised = false;
  static TileProvider? _tileProvider;
  static TileLayer? _tileLayer;

  /// Debe llamarse una vez al arrancar la app, antes de mostrar cualquier
  /// mapa (ver main.dart). Si falla (ej. ObjectBox no pudo inicializar en
  /// ese dispositivo), queda `_initialised == false` y las pantallas de
  /// rutas caen a un TileLayer normal por red en vez de quedar con el mapa
  /// en blanco para siempre - antes `getTileProvider()`/`buildTileLayer()`
  /// armaban igual el FMTCTileProvider aunque el backend nunca se hubiera
  /// inicializado, y cada tile fallaba en silencio.
  static Future<void> initialise() async {
    if (_initialised) return;
    await FMTCObjectBoxBackend().initialise();
    final store = FMTCStore(_storeName);
    if (!await store.manage.ready) {
      await store.manage.create();
    }
    _initialised = true;
  }

  /// Tile provider offline-first para usar en cualquier `TileLayer`. Se
  /// cachea un único singleton - crear uno nuevo en cada rebuild (ej. cada
  /// vez que llega una posición GPS nueva y el widget se redibuja) es caro
  /// y fue la causa de la lentitud reportada en dispositivo real.
  ///
  /// Devuelve `null` si FMTC nunca se inicializó - el caller debe usar un
  /// `TileProvider` normal en ese caso (ver `buildTileLayer`).
  static TileProvider? getTileProvider() {
    if (!_initialised) return null;
    return _tileProvider ??=
        FMTCTileProvider(stores: const {_storeName: BrowseStoreStrategy.readUpdateCreate});
  }

  /// Igual que `getTileProvider`: un solo `TileLayer` cacheado y reusado en
  /// las 4 pantallas con mapa, en vez de reconstruirlo en cada build().
  static TileLayer buildTileLayer() {
    final provider = getTileProvider();
    return _tileLayer ??= TileLayer(
      urlTemplate: _tileUrlTemplate,
      userAgentPackageName: _userAgentPackageName,
      tileProvider: provider, // null -> flutter_map usa NetworkTileProvider
    );
  }

  /// Descarga los tiles de un corredor a lo largo de [routeLine] (radio en
  /// metros) para poder verlos sin conexión más tarde. Devuelve los streams
  /// de progreso de FMTC (tileEvents/downloadProgress) para que el caller
  /// muestre una barra de progreso.
  static ({Stream<TileEvent> tileEvents, Stream<DownloadProgress> downloadProgress}) downloadCorridor({
    required List<LatLng> routeLine,
    double radiusMeters = 400,
    int minZoom = 12,
    int maxZoom = 16,
  }) {
    final region = LineRegion(routeLine, radiusMeters).toDownloadable(
      minZoom: minZoom,
      maxZoom: maxZoom,
      options: TileLayer(urlTemplate: _tileUrlTemplate, userAgentPackageName: _userAgentPackageName),
    );

    return FMTCStore(_storeName).download.startForeground(region: region);
  }
}
