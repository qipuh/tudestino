import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      // Login
      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Error al iniciar sesión');
          }

          const data = result.data || result;

          // Guardar token en localStorage para que api.js lo use
          localStorage.setItem('token', data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      // Register
      register: async (userData) => {
        set({ loading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.message || 'Error al crear la cuenta');
          }

          const data = result.data || result;

          // Guardar token en localStorage para que api.js lo use
          localStorage.setItem('token', data.token);

          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      // Logout
      logout: () => {
        // Limpiar token de localStorage
        localStorage.removeItem('token');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // Update user profile
      updateProfile: async (updates) => {
        const { token } = get();
        set({ loading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updates),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error al actualizar perfil');
          }

          set({
            user: data,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          set({ loading: false });
          return { success: false, error: error.message };
        }
      },

      // Get current user
      getCurrentUser: async () => {
        const { token } = get();
        if (!token) return;

        set({ loading: true });
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Error al obtener usuario');
          }

          set({
            user: data,
            loading: false,
          });
        } catch (error) {
          set({ loading: false });
          // Si el token es inválido, hacer logout
          get().logout();
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
