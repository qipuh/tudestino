import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '@layouts/MainLayout';
import HomePage from '@modules/search/pages/HomePage';
import SearchResultsPage from '@modules/search/pages/SearchResultsPage';
import PropertyDetail from '@modules/properties/pages/PropertyDetail';
import LoginPage from '@modules/auth/pages/LoginPage';
import RegisterPage from '@modules/auth/pages/RegisterPage';
import AccountPage from '@modules/auth/pages/AccountPage';
import BookingsPage from '@modules/bookings/pages/BookingsPage';
import BookingDetailPage from '@modules/bookings/pages/BookingDetailPage';
import RoomSelectionPage from '@modules/bookings/pages/RoomSelectionPage';
import CheckoutPage from '@modules/bookings/pages/CheckoutPage';
import MyPropertiesPage from '@modules/properties/pages/MyPropertiesPage';
import PropertyFormPage from '@modules/properties/pages/PropertyFormPage';
import MessagesPage from '@modules/messaging/pages/MessagesPage';
import ProfilePage from '@modules/user/pages/ProfilePage';
import UsernameProfilePage from '@modules/user/pages/UsernameProfilePage';
import FeedPage from '@modules/social/pages/FeedPage';
import ReelsPage from '@modules/social/pages/ReelsPage';
import HostLandingPage from '@modules/properties/pages/HostLandingPage';
import PropertyRegistrationPage from '@modules/properties/pages/PropertyRegistrationPage';
import EditPropertyPage from '@modules/properties/pages/EditPropertyPage';
import RoomManagementPage from '@modules/properties/pages/RoomManagementPage';
import AddRoomPage from '@modules/properties/pages/AddRoomPage';
import EditRoomPage from '@modules/properties/pages/EditRoomPage';
import HelpPage from '@modules/help/pages/HelpPage';
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
        <Route path="account" element={<AccountPage />} />
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

        {/* Host Routes */}
        <Route path="host" element={<HostLandingPage />} />
        <Route path="host/properties" element={<MyPropertiesPage />} />
        <Route path="host/properties/new" element={<PropertyFormPage />} />
        <Route path="host/properties/register" element={<PropertyRegistrationPage />} />
        <Route path="host/properties/:id/edit" element={<EditPropertyPage />} />

        {/* Room Management Routes */}
        <Route path="host/properties/:propertyId/rooms" element={<RoomManagementPage />} />
        <Route path="host/properties/:propertyId/rooms/add" element={<AddRoomPage />} />
        <Route path="host/properties/:propertyId/rooms/:roomId/edit" element={<EditRoomPage />} />

        {/* Help Route */}
        <Route path="help" element={<HelpPage />} />

        {/* Username Route (must be last to avoid conflicts) */}
        <Route path=":username" element={<UsernameProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
