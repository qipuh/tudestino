import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@layouts/AdminLayout';
import Dashboard from '@modules/dashboard/Dashboard';
import UsersManagement from '@modules/users/UsersManagement';
import PropertiesManagement from '@modules/properties/PropertiesManagement';
import BookingsManagement from '@modules/bookings/BookingsManagement';
import VerificationManagement from '@modules/verification/VerificationManagement';
import AccommodationTypes from '@modules/accommodation-types/AccommodationTypes';
import PromotionsManagement from '@modules/promotions/PromotionsManagement';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="properties" element={<PropertiesManagement />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="verification" element={<VerificationManagement />} />
        <Route path="accommodation-types" element={<AccommodationTypes />} />
        <Route path="promotions" element={<PromotionsManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
