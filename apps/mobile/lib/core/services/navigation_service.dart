import 'package:flutter/material.dart';
import '../../modules/home/home_screen.dart';
import '../../modules/auth/login_screen.dart';
import '../../modules/auth/register_screen.dart';
import '../../modules/search/search_screen.dart';
import '../../modules/profile/profile_screen.dart';
import '../../modules/bookings/bookings_screen.dart';
import '../../modules/properties/property_detail_screen.dart';
import '../../modules/social/feed_screen.dart';
import '../../modules/notifications/notifications_screen.dart';
import '../../modules/favorites/favorites_screen.dart';

class NavigationService {
  static Route<dynamic> generateRoute(RouteSettings settings) {
    switch (settings.name) {
      case '/':
        return MaterialPageRoute(builder: (_) => const HomeScreen());

      case '/login':
        return MaterialPageRoute(builder: (_) => const LoginScreen());

      case '/register':
        return MaterialPageRoute(builder: (_) => const RegisterScreen());

      case '/search':
        return MaterialPageRoute(
          builder: (_) => SearchScreen(
            initialLocation: settings.arguments as Map<String, dynamic>?,
          ),
        );

      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      case '/bookings':
        return MaterialPageRoute(builder: (_) => const BookingsScreen());

      case '/property-detail':
        final propertyId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => PropertyDetailScreen(propertyId: propertyId),
        );

      case '/feed':
        return MaterialPageRoute(builder: (_) => const FeedScreen());

      case '/notifications':
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());

      case '/favorites':
        return MaterialPageRoute(builder: (_) => const FavoritesScreen());

      case '/create-post':
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(title: const Text('Crear Publicación')),
            body: const Center(
              child: Text('Próximamente: Crear publicación con cámara y galería'),
            ),
          ),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            appBar: AppBar(title: const Text('Error')),
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 60, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text('Ruta no encontrada: ${settings.name}'),
                ],
              ),
            ),
          ),
        );
    }
  }
}


