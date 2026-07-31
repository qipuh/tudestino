import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:geolocator/geolocator.dart';
import 'core/theme/app_theme.dart';
import 'core/services/navigation_service.dart';
import 'core/services/api_service.dart';
import 'core/services/push_notification_service.dart';
import 'core/services/offline_map_service.dart';
import 'providers/auth_provider.dart';
import 'providers/properties_provider.dart';
import 'providers/bookings_provider.dart';
import 'providers/social_provider.dart';
import 'providers/route_provider.dart';
import 'providers/notification_provider.dart';
import 'providers/verification_provider.dart';
import 'providers/favorites_provider.dart';

/// Debe ser una función de nivel superior (no un método de clase) - así lo
/// exige firebase_messaging para poder invocarla desde el isolate en
/// background cuando llega un push con la app cerrada.
@pragma('vm:entry-point')
Future<void> _firebaseBackgroundMessageHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  // Inicializar datos de locale
  await initializeDateFormatting('es_ES', null);
  Intl.defaultLocale = 'es_ES';

  try {
    await Firebase.initializeApp();
    FirebaseMessaging.onBackgroundMessage(_firebaseBackgroundMessageHandler);
  } catch (e) {
    // Sin google-services.json válido o Firebase no configurado en este
    // build - la app sigue funcionando, solo sin push.
    debugPrint('Firebase no disponible: $e');
  }

  try {
    await OfflineMapService.initialise();
  } catch (e) {
    // Sin cache offline disponible - los mapas siguen funcionando con
    // conexión, solo sin poder verse sin señal.
    debugPrint('FMTC no disponible: $e');
  }

  try {
    // Pedir el permiso de ubicación una sola vez al abrir la app por primera
    // vez (no bloquea el arranque si lo rechaza). Si ya fue concedido o
    // denegado para siempre, esto es instantáneo - el propio SO decide si
    // muestra el diálogo o no.
    final permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      await Geolocator.requestPermission();
    }
  } catch (e) {
    debugPrint('No se pudo solicitar permiso de ubicación: $e');
  }

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
        ChangeNotifierProvider(
          create: (_) => RouteProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => NotificationProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => VerificationProvider(apiService),
        ),
        ChangeNotifierProvider(
          create: (_) => FavoritesProvider(apiService),
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
        builder: (context, child) => _PushMessageListener(child: child!),
      ),
    );
  }
}

/// Refresca el badge de notificaciones cuando llega un push con la app
/// abierta (foreground) - FCM no actualiza la UI solo, hay que escuchar.
class _PushMessageListener extends StatefulWidget {
  final Widget child;

  const _PushMessageListener({required this.child});

  @override
  State<_PushMessageListener> createState() => _PushMessageListenerState();
}

class _PushMessageListenerState extends State<_PushMessageListener> {
  @override
  void initState() {
    super.initState();
    FirebaseMessaging.onMessage.listen((_) {
      if (mounted) {
        context.read<NotificationProvider>().loadUnreadCount();
        context.read<NotificationProvider>().loadNotifications();
      }
    });
  }

  @override
  Widget build(BuildContext context) => widget.child;
}

