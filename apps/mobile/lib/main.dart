import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'core/theme/app_theme.dart';
import 'core/services/navigation_service.dart';
import 'core/services/api_service.dart';
import 'providers/auth_provider.dart';
import 'providers/properties_provider.dart';
import 'providers/bookings_provider.dart';
import 'providers/social_provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Inicializar datos de locale
  await initializeDateFormatting('es_ES', null);
  Intl.defaultLocale = 'es_ES';
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final apiService = ApiService();

    return MultiProvider(
      providers: [
        ChangeNotifierProvider(
          create: (_) => AuthProvider(apiService)..initialize(),
        ),
        ChangeNotifierProvider(
          create: (_) => PropertiesProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => BookingsProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => SocialProvider(apiService),
        ),
      ],
      child: MaterialApp(
        title: 'TuDestino',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.darkTheme,
        themeMode: ThemeMode.light,
        // Configuración de localización
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        supportedLocales: const [
          Locale('es', 'ES'),
          Locale('en', 'US'),
        ],
        locale: const Locale('es', 'ES'),
        onGenerateRoute: NavigationService.generateRoute,
        initialRoute: '/',
      ),
    );
  }
}

