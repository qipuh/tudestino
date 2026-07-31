import 'package:flutter/material.dart';
import '../../modules/home/home_screen.dart';
import '../../modules/auth/login_screen.dart';
import '../../modules/auth/register_screen.dart';
import '../../modules/search/search_screen.dart';
import '../../modules/search/location_search_screen.dart';
import '../../modules/search/date_range_selector_screen.dart';
import '../../modules/search/guests_selector_screen.dart';
import '../../modules/search/search_results_screen.dart';
import '../../modules/profile/profile_screen.dart';
import '../../modules/profile/user_profile_screen.dart';
import '../../modules/bookings/bookings_screen.dart';
import '../../modules/bookings/checkout_screen.dart';
import '../../modules/properties/property_detail_screen.dart';
import '../../modules/social/feed_screen.dart';
import '../../modules/social/reels_screen.dart';
import '../../modules/notifications/notifications_screen.dart';
import '../../modules/favorites/favorites_screen.dart';
import '../../modules/messaging/messages_screen.dart';
import '../../modules/routes/record_route_screen.dart';
import '../../modules/routes/save_route_screen.dart';
import '../../modules/routes/routes_feed_screen.dart';
import '../../modules/routes/route_detail_screen.dart';
import '../../modules/verification/verify_identity_screen.dart';
import '../../modules/properties/tour_detail_screen.dart';
import '../../modules/social/create_post_screen.dart';
import '../../modules/properties/attraction_detail_screen.dart';
import '../../modules/businesses/screens/business_detail_screen.dart';
import '../../modules/profile/account_settings_screen.dart';
import '../../modules/profile/help_support_screen.dart';
import '../../modules/bookings/payment_method_screen.dart';
import '../../models/gps_route.dart';
import '../../modules/routes/plan_route_screen.dart';
import '../../modules/routes/edit_route_screen.dart';
import '../../core/services/route_tracking_service.dart' show RouteMilestoneDraft;

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
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => SearchScreen(
            initialLocation: args,
            category: args?['category'] as String? ?? 'hotel',
          ),
        );

      case '/location-search':
        return MaterialPageRoute(builder: (_) => const LocationSearchScreen());

      case '/date-selector':
        final args = settings.arguments as Map<String, dynamic>? ?? {};
        return MaterialPageRoute(
          builder: (_) => DateRangeSelectorScreen(
            initialCheckIn: args['checkIn'] as DateTime?,
            initialCheckOut: args['checkOut'] as DateTime?,
          ),
        );

      case '/guests-selector':
        final args = settings.arguments as Map<String, dynamic>? ?? {};
        return MaterialPageRoute(
          builder: (_) => GuestsSelectorScreen(
            initialAdults: args['adults'] as int? ?? 2,
            initialChildren: args['children'] as int? ?? 0,
          ),
        );

      case '/search-results':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => SearchResultsScreen(
            location: args['location'] as String?,
            lat: args['lat'] as double?,
            lng: args['lng'] as double?,
            checkIn: args['checkIn'] as DateTime?,
            checkOut: args['checkOut'] as DateTime?,
            adults: args['adults'] as int? ?? 2,
            children: args['children'] as int? ?? 0,
            category: args['category'] as String?,
          ),
        );

      case '/profile':
        return MaterialPageRoute(builder: (_) => const ProfileScreen());

      case '/bookings':
        return MaterialPageRoute(builder: (_) => const BookingsScreen());

      case '/property-detail':
        final args = settings.arguments;
        if (args is Map<String, dynamic>) {
          return MaterialPageRoute(
            builder: (_) => PropertyDetailScreen(
              propertyId: args['propertyId'] as String,
              checkIn: args['checkIn'] as DateTime?,
              checkOut: args['checkOut'] as DateTime?,
              adults: args['adults'] as int?,
              children: args['children'] as int?,
            ),
          );
        } else {
          // Backward compatibility - solo propertyId
          return MaterialPageRoute(
            builder: (_) => PropertyDetailScreen(propertyId: args as String),
          );
        }

      case '/feed':
        return MaterialPageRoute(builder: (_) => const FeedScreen());

      case '/reels':
        return MaterialPageRoute(builder: (_) => const ReelsScreen());

      case '/notifications':
        return MaterialPageRoute(builder: (_) => const NotificationsScreen());

      case '/favorites':
        return MaterialPageRoute(builder: (_) => const FavoritesScreen());

      case '/messages':
        final args = settings.arguments as Map<String, dynamic>?;
        return MaterialPageRoute(
          builder: (_) => MessagesScreen(
            otherUserId: args?['otherUserId'] as String?,
          ),
        );

      case '/user-profile':
        final userId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => UserProfileScreen(userId: userId),
        );

      case '/host-profile':
        final userId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => UserProfileScreen(userId: userId),
        );

      case '/checkout':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => CheckoutScreen(
            propertyId: args['propertyId'] as String,
            roomId: args['roomId'] as String,
            checkIn: args['checkIn'] as DateTime,
            checkOut: args['checkOut'] as DateTime,
            adults: args['adults'] as int,
            children: args['children'] as int,
          ),
        );

      case '/routes-feed':
        return MaterialPageRoute(builder: (_) => const RoutesFeedScreen());

      case '/record-route':
        final args = settings.arguments as Map<String, dynamic>? ?? {};
        return MaterialPageRoute(
          builder: (_) => RecordRouteScreen(
            activityType: args['activityType'] as String?,
            referenceTrackPoints: args['referenceTrackPoints'] as List<TrackPoint>?,
          ),
        );

      case '/plan-route':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => PlanRouteScreen(
            mode: args['mode'] as PlanRouteMode? ?? PlanRouteMode.search,
            activityType: args['activityType'] as String?,
            fixedDestination: args['fixedDestination'] as GeoPoint?,
            fixedDestinationLabel: args['fixedDestinationLabel'] as String?,
            referenceTrackPoints: args['referenceTrackPoints'] as List<TrackPoint>?,
          ),
        );

      case '/save-route':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => SaveRouteScreen(
            trackPoints: args['trackPoints'] as List<TrackPoint>,
            distanceKm: args['distanceKm'] as double,
            durationSeconds: args['durationSeconds'] as int,
            elevationGainM: args['elevationGainM'] as double,
            avgSpeedKmh: args['avgSpeedKmh'] as double,
            startedAt: args['startedAt'] as DateTime?,
            activityType: args['activityType'] as String,
            milestones: args['milestones'] as List<RouteMilestoneDraft>? ?? const [],
          ),
        );

      case '/route-detail':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => RouteDetailScreen(routeId: args['routeId'] as String),
        );

      case '/edit-route':
        final route = settings.arguments as GpsRoute;
        return MaterialPageRoute(builder: (_) => EditRouteScreen(route: route));

      case '/verify-identity':
        return MaterialPageRoute(builder: (_) => const VerifyIdentityScreen());

      case '/tour-detail':
        final tourId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => TourDetailScreen(tourId: tourId),
        );

      case '/attraction-detail':
        final attractionId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => AttractionDetailScreen(attractionId: attractionId),
        );

      case '/business-detail':
        final businessId = settings.arguments as String;
        return MaterialPageRoute(
          builder: (_) => BusinessDetailScreen(businessId: businessId),
        );

      case '/account-settings':
        return MaterialPageRoute(builder: (_) => const AccountSettingsScreen());

      case '/help-support':
        return MaterialPageRoute(builder: (_) => const HelpSupportScreen());

      case '/card-payment':
        final args = settings.arguments as Map<String, dynamic>;
        return MaterialPageRoute(
          builder: (_) => PaymentMethodScreen(
            bookingId: args['bookingId'] as String,
            amount: args['amount'] as double,
            propertyName: args['propertyName'] as String,
          ),
        );

      case '/create-post':
        return MaterialPageRoute(builder: (_) => const CreatePostScreen());

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


