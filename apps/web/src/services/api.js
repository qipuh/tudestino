import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SERVER_BASE_URL = import.meta.env.VITE_SERVER_URL || API_BASE_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejar errores
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const hadToken = localStorage.getItem('token');
      localStorage.removeItem('token');
      // Only redirect to login if user had a token (meaning it expired)
      // Don't redirect if user simply wasn't logged in
      if (hadToken) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Helper para construir URLs de imágenes correctamente
export const getImageUrl = (imagePath, context = 'auto') => {
  if (!imagePath) return null;

  // Si ya es una URL completa, devolverla tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Si ya incluye 'uploads/', devolverla con el servidor base
  if (imagePath.includes('uploads/')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${SERVER_BASE_URL}/${cleanPath}`;
  }

  // Si empieza con /, removerlo
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  let subfolder = 'rooms'; // Default

  // Detectar automáticamente la carpeta basándose en el patrón del nombre
  if (context === 'auto') {
    // Business images: "images-timestamp-random.jpeg" o "19-timestamp-random.jpg" (número >= 10)
    if (cleanPath.startsWith('images-') || /^[0-9]{2,}-/.test(cleanPath)) {
      subfolder = 'business';
    }
    // Room images: "1-timestamp-random.jpg" (número < 10)
    else if (/^[0-9]{1}-/.test(cleanPath)) {
      subfolder = 'rooms';
    }
  }
  // Override manual por contexto
  else if (context === 'business' || context === 'restaurant') {
    subfolder = 'business';
  } else if (context === 'property' || context === 'room') {
    subfolder = 'rooms';
  } else if (context === 'social' || context === 'post') {
    subfolder = 'social';
  } else if (context === 'menu') {
    subfolder = 'menu';
  } else if (context === 'tours' || context === 'tour') {
    subfolder = 'tours';
  } else if (context === 'events' || context === 'event') {
    subfolder = 'events';
  } else if (context === 'avatars' || context === 'avatar') {
    subfolder = 'avatars';
  } else if (context === 'attractions' || context === 'attraction') {
    subfolder = 'attractions';
  } else if (context === 'spa-services' || context === 'spa') {
    subfolder = 'spa-services';
  }

  return `${SERVER_BASE_URL}/uploads/${subfolder}/${cleanPath}`;
};

export default api;
