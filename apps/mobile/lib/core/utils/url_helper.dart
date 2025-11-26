import '../config/app_config.dart';

class UrlHelper {
  static String getFullImageUrl(String? url) {
    if (url == null || url.isEmpty) return '';

    // Si ya es una URL completa, devolverla tal cual
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Si es una URL relativa, construir la URL completa
    final baseUrl = AppConfig.baseUrl.replaceAll('/api', '');
    return '$baseUrl$url';
  }

  static List<String> getFullImageUrls(List<String>? urls) {
    if (urls == null || urls.isEmpty) return [];
    return urls.map((url) => getFullImageUrl(url)).toList();
  }
}
