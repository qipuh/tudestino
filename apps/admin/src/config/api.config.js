// Configuración dinámica del API
const API_CONFIG = {
  // Base URL del API
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',

  // Timeout por defecto (30 segundos)
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,

  // Headers por defecto
  headers: {
    'Content-Type': 'application/json',
  },
};

// Endpoints principales
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    ME: '/users/me',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    USERS_RECENT: '/admin/users/recent',
    PROPERTIES: '/admin/properties',
    BOOKINGS: '/admin/bookings',
    STATS: '/admin/stats',
  },

  // Users
  USERS: {
    LIST: '/users',
    DETAIL: (id) => `/users/${id}`,
    UPDATE: (id) => `/users/${id}`,
    DELETE: (id) => `/users/${id}`,
  },

  // Properties
  PROPERTIES: {
    LIST: '/properties',
    DETAIL: (id) => `/properties/${id}`,
    CREATE: '/properties',
    UPDATE: (id) => `/properties/${id}`,
    DELETE: (id) => `/properties/${id}`,
  },

  // Bookings
  BOOKINGS: {
    LIST: '/bookings',
    DETAIL: (id) => `/bookings/${id}`,
    CREATE: '/bookings',
    UPDATE: (id) => `/bookings/${id}`,
    CANCEL: (id) => `/bookings/${id}/cancel`,
  },

  // Tours
  TOURS: {
    LIST: '/tours',
    DETAIL: (id) => `/tours/${id}`,
    CREATE: '/tours',
    UPDATE: (id) => `/tours/${id}`,
    DELETE: (id) => `/tours/${id}`,
  },

  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    FILE: '/upload/file',
  },
};

export default API_CONFIG;
