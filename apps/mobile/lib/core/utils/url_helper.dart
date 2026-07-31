import '../config/app_config.dart';

class UrlHelper {
  /// [folder] permite resolver nombres de archivo pelados (sin ruta) que
  /// algunos modelos guardan (ej. attractions: "attraction-123.jpg") hacia
  /// su subcarpeta real de /uploads.
  static String getFullImageUrl(String? url, {String? folder}) {
    if (url == null || url.isEmpty) return '';

    // Si ya es una URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es una URL relativa, construir la URL completa.
    // OJO: usar replaceFirst con RegExp anclado al final, no replaceAll -
    // con dominios como "https://api.tudestino.pe/api", un replaceAll('/api','')
    // también borra el "/api" del subdominio ("//api.") y deja la URL rota.
    //
    // Los archivos de /uploads (incluidos attractions) viven físicamente en
    // el servidor de la API - una verificación anterior con curl que decía
    // que attractions vivía en el dominio web (tudestino.pe) resultó ser un
    // falso positivo: ese dominio responde 200 pero con el HTML de fallback
    // del sitio estático, no el archivo real.
    final baseUrl = AppConfig.baseUrl.replaceFirst(RegExp(r'/api$'), '');

    var path = url;
    if (!path.startsWith('/')) {
      // Nombre de archivo pelado: ubicarlo bajo /uploads/<folder>
      path = folder != null ? '/uploads/$folder/$path' : '/$path';
    }
    return '$baseUrl$path';
  }

  static List<String> getFullImageUrls(List<String>? urls) {
    if (urls == null || urls.isEmpty) return [];
    return urls.map((url) => getFullImageUrl(url)).toList();
  }
}
