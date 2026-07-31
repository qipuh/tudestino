import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@modules/search/pages/HomePage';
import SearchResultsPage from '@modules/search/pages/SearchResultsPage';
import PropertyDetail from '@modules/properties/pages/PropertyDetail';
import LoginPage from '@modules/auth/pages/LoginPage';
import RegisterPage from '@modules/auth/pages/RegisterPage';
import VerifyEmailPage from '@modules/auth/pages/VerifyEmailPage';
import OAuthCallbackPage from '@modules/auth/pages/OAuthCallbackPage';
import ForgotPasswordPage from '@modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '@modules/auth/pages/ResetPasswordPage';
import AccountPage from '@modules/auth/pages/AccountPage';
import AccountDashboard from '@modules/account/pages/AccountDashboard';
import AccountBusinesses from '@modules/account/pages/AccountBusinesses';
import AccountProfile from '@modules/account/pages/AccountProfile';
import AccountFavorites from '@modules/account/pages/AccountFavorites';
import VerifyIdentityPage from '@modules/account/pages/VerifyIdentityPage';
import NotificationsPage from '@modules/notifications/pages/NotificationsPage';
import BookingsPage from '@modules/bookings/pages/BookingsPage';
import BookingDetailPage from '@modules/bookings/pages/BookingDetailPage';
import RoomSelectionPage from '@modules/bookings/pages/RoomSelectionPage';
import CheckoutPage from '@modules/bookings/pages/CheckoutPage';
import MyPropertiesPage from '@modules/properties/pages/MyPropertiesPage';
import MessagesPage from '@modules/messaging/pages/MessagesPage';
import ProfilePage from '@modules/user/pages/ProfilePage';
import UsernameProfilePage from '@modules/user/pages/UsernameProfilePage';
import FeedPage from '@modules/social/pages/FeedPage';
import ReelsPage from '@modules/social/pages/ReelsPage';
import HostLandingPage from '@modules/properties/pages/HostLandingPage';
import EditPropertyPage from '@modules/properties/pages/EditPropertyPage';
import RoomManagementPage from '@modules/properties/pages/RoomManagementPage';
import AddRoomPage from '@modules/properties/pages/AddRoomPage';
import EditRoomPage from '@modules/properties/pages/EditRoomPage';
import HelpPage from '@modules/help/pages/HelpPage';
import CreateBusiness from '@modules/business/pages/CreateBusiness';
import EditBusiness from '@modules/business/pages/EditBusiness';
import BusinessDetail from '@modules/business/pages/BusinessDetail';
import BusinessManagementDashboard from '@modules/business/pages/BusinessManagementDashboard';
import BusinessServices from '@modules/business/pages/BusinessServices';
import BusinessReservations from '@modules/business/pages/BusinessReservations';
import BusinessPosts from '@modules/business/pages/BusinessPosts';
import BusinessAnalytics from '@modules/business/pages/BusinessAnalytics';
import BusinessSettings from '@modules/business/pages/BusinessSettings';
import RestaurantMenu from '@modules/business/pages/RestaurantMenu';
import SpaServices from '@modules/business/pages/SpaServices';
import CreatePropertySimplified from '@modules/business/pages/CreatePropertySimplified';
import CreateRoomsSimplified from '@modules/business/pages/CreateRoomsSimplified';
import BusinessTours from '@modules/business/pages/BusinessTours';
import CreateTourSteps from '@modules/business/pages/CreateTourSteps';
import TourDetailPage from '@modules/tours/pages/TourDetailPage';
import EventsListPage from '@modules/events/pages/EventsListPage';
import CreateEvent from '@modules/events/pages/CreateEvent';
import EditEvent from '@modules/events/pages/EditEvent';
import EventDetailPage from '@modules/events/pages/EventDetailPage';
import MyEventsPage from '@modules/events/pages/MyEventsPage';
import EventCheckoutPage from '@modules/events/pages/EventCheckoutPage';
import AttractionDetail from '@modules/attractions/pages/AttractionDetail';
import RoutesFeedPage from '@modules/routes/pages/RoutesFeedPage';
import RouteDetailPage from '@modules/routes/pages/RouteDetailPage';
import AdminPage from '@modules/admin/pages/AdminPage';
import VerificationsPage from '@modules/admin/pages/VerificationsPage';
import AboutPage from '@modules/legal/pages/AboutPage';
import TermsPage from '@modules/legal/pages/TermsPage';
import PrivacyPage from '@modules/legal/pages/PrivacyPage';
import CancellationPage from '@modules/legal/pages/CancellationPage';
import ContactPage from '@modules/legal/pages/ContactPage';
import BlogPage from '@modules/legal/pages/BlogPage';
import BusinessResourcesPage from '@modules/legal/pages/BusinessResourcesPage';
import PricingPage from '@modules/legal/pages/PricingPage';
import BusinessesPage from '@modules/businesses/pages/BusinessesPage';
import BusinessFormPage from '@modules/businesses/pages/BusinessFormPage';
import BusinessDetailPage from '@modules/businesses/pages/BusinessDetailPage';
import ReservationsPage from '@modules/reservations/pages/ReservationsPage';
import ServicesPage from '@modules/services/pages/ServicesPage';
import ServiceFormPage from '@modules/services/pages/ServiceFormPage';
import OffersPage from '@modules/offers/pages/OffersPage';
import OfferFormPage from '@modules/offers/pages/OfferFormPage';
import AdminDashboard from '@modules/admin/pages/AdminDashboard';
import BusinessVerificationPage from '@modules/admin/pages/BusinessVerificationPage';
import PaymentsPage from '@modules/admin/pages/PaymentsPage';
import PayoutsPage from '@modules/admin/pages/PayoutsPage';
import useAuthStore from './store/authStore';

function App() {
  const { token } = useAuthStore();

  // Sincronizar token con localStorage al iniciar la app
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    }
  }, [token]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="properties/:id" element={<PropertyDetail />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="forgot-password" element={<ForgotPasswordPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />
        <Route path="auth/callback" element={<OAuthCallbackPage />} />

        {/* Account Routes - New unified account system */}
        <Route path="account" element={<AccountDashboard />} />
        <Route path="account/businesses" element={<AccountBusinesses />} />
        <Route path="account/profile" element={<AccountProfile />} />
        <Route path="account/events" element={<MyEventsPage />} />
        <Route path="account/favorites" element={<AccountFavorites />} />
        <Route path="verify-identity" element={<VerifyIdentityPage />} />

        {/* Notifications */}
        <Route path="notifications" element={<NotificationsPage />} />

        <Route path="bookings" element={<BookingsPage />} />
        <Route path="bookings/:id" element={<BookingDetailPage />} />
        <Route path="room-selection" element={<RoomSelectionPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="feed" element={<FeedPage />} />
        <Route path="reels" element={<ReelsPage />} />

        {/* Profile Routes */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:userId" element={<ProfilePage />} />

        {/* Host Routes - DEPRECATED: Use /business/create instead */}
        <Route path="host" element={<HostLandingPage />} />
        <Route path="host/properties" element={<MyPropertiesPage />} />
        <Route path="host/properties/:id/edit" element={<EditPropertyPage />} />

        {/* Room Management Routes */}
        <Route path="host/properties/:propertyId/rooms" element={<RoomManagementPage />} />
        <Route path="host/properties/:propertyId/rooms/add" element={<AddRoomPage />} />
        <Route path="host/properties/:propertyId/rooms/:roomId/edit" element={<EditRoomPage />} />

        {/* Help Route */}
        <Route path="help" element={<HelpPage />} />

        {/* Business Routes */}
        {/* Redirect old business dashboard to new account businesses */}
        <Route path="business/dashboard" element={<AccountBusinesses />} />
        <Route path="business/:id/manage" element={<BusinessManagementDashboard />} />
        <Route path="business/:id/services" element={<BusinessServices />} />
        <Route path="business/:id/reservations" element={<BusinessReservations />} />
        <Route path="business/:id/posts" element={<BusinessPosts />} />
        <Route path="business/:id/analytics" element={<BusinessAnalytics />} />
        <Route path="business/:id/settings" element={<BusinessSettings />} />
        <Route path="business/:id" element={<BusinessDetail />} />
        <Route path="business/:id/menu" element={<RestaurantMenu />} />
        <Route path="business/:id/spa-services" element={<SpaServices />} />
        <Route path="business/:id/property/create" element={<CreatePropertySimplified />} />
        <Route path="business/:id/property/create-rooms" element={<CreateRoomsSimplified />} />
        <Route path="business/:id/tours" element={<BusinessTours />} />
        <Route path="business/:id/tours/create" element={<CreateTourSteps />} />
        <Route path="business/:id/tours/:tourId/edit" element={<CreateTourSteps />} />

        {/* Tours Public Routes */}
        <Route path="tours/:id" element={<TourDetailPage />} />

        {/* Business Polymorph Routes */}
        <Route path="businesses" element={<BusinessesPage />} />
        <Route path="businesses/new" element={<BusinessFormPage />} />
        <Route path="businesses/:id" element={<BusinessDetailPage />} />
        <Route path="businesses/:id/edit" element={<BusinessFormPage />} />
        <Route path="businesses/:businessId/reservations" element={<ReservationsPage />} />
        <Route path="businesses/:businessId/services" element={<ServicesPage />} />
        <Route path="businesses/:businessId/services/new" element={<ServiceFormPage />} />
        <Route path="businesses/:businessId/services/:serviceId/edit" element={<ServiceFormPage />} />
        <Route path="businesses/:businessId/offers" element={<OffersPage />} />
        <Route path="businesses/:businessId/offers/new" element={<OfferFormPage />} />
        <Route path="businesses/:businessId/offers/:offerId/edit" element={<OfferFormPage />} />

        {/* Events Routes */}
        <Route path="events" element={<EventsListPage />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/my-events" element={<MyEventsPage />} />
        <Route path="events/checkout" element={<EventCheckoutPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="events/:id/edit" element={<EditEvent />} />

        {/* Attractions Routes */}
        <Route path="attractions/:id" element={<AttractionDetail />} />

        {/* Routes (rutas GPS compartidas) */}
        <Route path="rutas" element={<RoutesFeedPage />} />
        <Route path="rutas/:id" element={<RouteDetailPage />} />

        {/* Admin Routes */}
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="admin/verifications" element={<BusinessVerificationPage />} />
        <Route path="admin/payments" element={<PaymentsPage />} />
        <Route path="admin/payouts" element={<PayoutsPage />} />
        <Route path="admin/legacy" element={<AdminPage />} />
        <Route path="admin/legacy/verifications" element={<VerificationsPage />} />

        {/* Legal & Static Pages */}
        <Route path="about" element={<AboutPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="cancellation" element={<CancellationPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="business-resources" element={<BusinessResourcesPage />} />
        <Route path="pricing" element={<PricingPage />} />

        {/* Username Route (must be last to avoid conflicts) */}
        <Route path=":username" element={<UsernameProfilePage />} />
      </Route>

      {/* Business Management Routes - Outside MainLayout (no header) */}
      <Route path="business/create" element={<CreateBusiness />} />
      <Route path="business/:id/edit" element={<EditBusiness />} />
    </Routes>
  );
}

export default App;
