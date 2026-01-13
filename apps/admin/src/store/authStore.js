import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS } from '../config/api.config';

const useAuthStore = create((set) => ({
  admin: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      // El interceptor ya devuelve response.data, no necesitamos .data nuevamente
      const { token, user } = response;

      // Verificar que el usuario sea admin
      if (user.role !== 'admin') {
        return {
          success: false,
          message: 'Acceso denegado. Solo administradores pueden ingresar.'
        };
      }

      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_user', JSON.stringify(user));
      set({ admin: user, isAuthenticated: true });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión'
      };
    }
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    set({ admin: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      // El interceptor ya devuelve response.data
      set({ admin: response, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
