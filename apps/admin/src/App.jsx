import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import AdminLayout from '@layouts/AdminLayout';
import Dashboard from '@modules/dashboard/Dashboard';
import UsersManagement from '@modules/users/UsersManagement';
import PropertiesManagement from '@modules/properties/PropertiesManagement';
import BookingsManagement from '@modules/bookings/BookingsManagement';
import VerificationManagement from '@modules/verification/VerificationManagement';
import AccommodationTypes from '@modules/accommodation-types/AccommodationTypes';
import PromotionsManagement from '@modules/promotions/PromotionsManagement';
import SlidersManagement from '@modules/sliders/SlidersManagement';
import AttractionsManagement from '@modules/attractions/AttractionsManagement';
import LoginPage from './pages/LoginPage';
import useAuthStore from './store/authStore';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="properties" element={<PropertiesManagement />} />
        <Route path="bookings" element={<BookingsManagement />} />
        <Route path="verification" element={<VerificationManagement />} />
        <Route path="accommodation-types" element={<AccommodationTypes />} />
        <Route path="promotions" element={<PromotionsManagement />} />
        <Route path="sliders" element={<SlidersManagement />} />
        <Route path="attractions" element={<AttractionsManagement />} />
      </Route>
    </Routes>
  );
}

export default App;
