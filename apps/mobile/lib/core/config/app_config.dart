class AppConfig {
  // Configuración del ambiente
  static const String _environment = String.fromEnvironment('ENVIRONMENT', defaultValue: 'production');

  // URLs base por ambiente
  static const Map<String, String> _apiUrls = {
    'development': 'http://localhost:3000/api',
    'development_android': 'http://192.168.0.16:3000/api',
    'production': 'https://tudestino.lat/api',
  };
  
  // Getter para obtener la URL base según el ambiente
  static String get baseUrl {
    switch (_environment) {
      case 'production':
        return _apiUrls['production']!;
      case 'development_android':
        return _apiUrls['development_android']!;
      case 'development':
      default:
        return _apiUrls['development']!;
    }
  }
  
  // Otros configs que puedan ser útiles
  static bool get isProduction => _environment == 'production';
  static bool get isDevelopment => _environment == 'development' || _environment == 'development_android';
  
  // URLs completas para diferentes servicios
  static String get webUrl {
    switch (_environment) {
      case 'production':
        return 'https://tudestino.lat';
      case 'development':
      case 'development_android':
      default:
        return 'http://localhost:5173';
    }
  }
}