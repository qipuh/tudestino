import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@modules/search/pages/HomePage';
import SearchResultsPage from '@modules/search/pages/SearchResultsPage';
import PropertyDetail from '@modules/properties/pages/PropertyDetail';
import LoginPage from '@modules/auth/pages/LoginPage';
import RegisterPage from '@modules/auth/pages/RegisterPage';
import VerifyEmailPage from '@modules/auth/pages/VerifyEmailPage';
import AccountPage from '@modules/auth/pages/AccountPage';
import AccountDashboard from '@modules/account/pages/AccountDashboard';
import AccountBusinesses from '@modules/account/pages/AccountBusinesses';
import AccountProfile from '@modules/account/pages/AccountProfile';
import AccountSocial from '@modules/account/pages/AccountSocial';
import AccountFavorites from '@modules/account/pages/AccountFavorites';
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

        {/* Account Routes - New unified account system */}
        <Route path="account" element={<AccountDashboard />} />
        <Route path="account/businesses" element={<AccountBusinesses />} />
        <Route path="account/profile" element={<AccountProfile />} />
        <Route path="account/social" element={<AccountSocial />} />
        <Route path="account/events" element={<MyEventsPage />} />
        <Route path="account/favorites" element={<AccountFavorites />} />

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
        <Route path="business/create" element={<CreateBusiness />} />
        <Route path="business/:id/edit" element={<EditBusiness />} />
        <Route path="business/:id/manage" element={<BusinessManagementDashboard />} />
        <Route path="business/:id/services" element={<BusinessServices />} />
        <Route path="business/:id/reservations" element={<BusinessReservations />} />
        <Route path="business/:id/posts" element={<BusinessPosts />} />
        <Route path="business/:id/analytics" element={<BusinessAnalytics />} />
        <Route path="business/:id/settings" element={<BusinessSettings />} />
        <Route path="business/:id" element={<BusinessDetail />} />
        <Route path="business/:id/menu" element={<RestaurantMenu />} />
        <Route path="business/:businessId/property/create" element={<CreatePropertySimplified />} />
        <Route path="business/:businessId/property/create-rooms" element={<CreateRoomsSimplified />} />
        <Route path="business/:id/tours" element={<BusinessTours />} />
        <Route path="business/:id/tours/create" element={<CreateTourSteps />} />
        <Route path="business/:id/tours/:tourId/edit" element={<CreateTourSteps />} />

        {/* Tours Public Routes */}
        <Route path="tours/:id" element={<TourDetailPage />} />

        {/* Business Routes (plural for compatibility) */}
        <Route path="businesses/:id" element={<BusinessDetail />} />

        {/* Events Routes */}
        <Route path="events" element={<EventsListPage />} />
        <Route path="events/create" element={<CreateEvent />} />
        <Route path="events/my-events" element={<MyEventsPage />} />
        <Route path="events/checkout" element={<EventCheckoutPage />} />
        <Route path="events/:id" element={<EventDetailPage />} />
        <Route path="events/:id/edit" element={<EditEvent />} />

        {/* Username Route (must be last to avoid conflicts) */}
        <Route path=":username" element={<UsernameProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
