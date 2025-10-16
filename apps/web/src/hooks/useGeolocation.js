import { useState, useEffect } from 'react';
import api from '@services/api';

/**
 * Hook para obtener la ubicación del usuario
 * Primero intenta con IP geolocation, luego con navegador si falla
 */
export const useGeolocation = (options = {}) => {
  const { autoFetch = true, useNavigator = false } = options;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener ubicación por IP
  const fetchLocationByIP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/search/location');

      if (response.success) {
        setLocation({
          city: response.data.city,
          region: response.data.region,
          country: response.data.country,
          countryCode: response.data.countryCode,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          timezone: response.data.timezone,
          method: 'ip'
        });
      }
    } catch (err) {
      // Silenciar el error en consola si es 404 (backend no disponible)
      if (err.response?.status !== 404) {
        console.error('Error fetching location by IP:', err);
      }

      // No mostrar error al usuario, simplemente no auto-rellenar
      // setError('No se pudo obtener la ubicación automáticamente');

      // Si falla IP y se permite, intentar con navegador
      if (useNavigator) {
        fetchLocationByNavigator();
      }
    } finally {
      setLoading(false);
    }
  };

  // Obtener ubicación por navegador (GPS/WiFi)
  const fetchLocationByNavigator = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está soportada en este navegador');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          method: 'navigator'
        });
        setLoading(false);
      },
      (err) => {
        console.error('Error getting navigator location:', err);
        setError('No se pudo acceder a tu ubicación. Verifica los permisos del navegador.');
        setLoading(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  // Auto-fetch al montar el componente
  useEffect(() => {
    if (autoFetch) {
      fetchLocationByIP();
    }
  }, [autoFetch]);

  return {
    location,
    loading,
    error,
    refetch: fetchLocationByIP,
    fetchByNavigator: fetchLocationByNavigator
  };
};

export default useGeolocation;
