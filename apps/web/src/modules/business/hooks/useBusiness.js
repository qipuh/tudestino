import { useState, useEffect } from 'react';
import api from '../../../services/api';

export const useBusiness = (businessId = null) => {
  const [business, setBusiness] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener mis negocios
  const fetchMyBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/businesses/my-businesses');
      // `api` response interceptor returns `response.data` already
      setBusinesses(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      // Log full API error body to help debugging (will appear in browser console)
      // eslint-disable-next-line no-console
      console.error('fetchMyBusinesses error:', err.response?.data || err);
      const errorMsg = err.response?.data?.message || 'Error al cargar negocios';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Obtener un negocio por ID
  const fetchBusiness = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/businesses/${id}`);
      setBusiness(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cargar negocio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Crear negocio
  const createBusiness = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/businesses', data);
      // `response` is the parsed server body (see api interceptor)
      return { success: true, data: response.data, raw: response };
    } catch (err) {
      // Prefer a specific message from the API; if available include validation details
      const apiData = err.response?.data;
      const errorMsg = apiData?.message || apiData?.error || 'Error al crear negocio';
      // If there are validation errors, append brief info
      if (apiData?.errors && typeof apiData.errors === 'object') {
        const firstKey = Object.keys(apiData.errors)[0];
        const firstMsg = apiData.errors[firstKey];
        if (firstMsg) {
          // firstMsg can be array or string
          const detail = Array.isArray(firstMsg) ? firstMsg.join(', ') : firstMsg;
          setError(`${errorMsg}: ${detail}`);
          return { success: false, error: `${errorMsg}: ${detail}`, raw: apiData };
        }
      }
      setError(errorMsg);
      return { success: false, error: errorMsg, raw: apiData };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar negocio
  const updateBusiness = async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/businesses/${id}`, data);
      setBusiness(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar negocio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar negocio
  const deleteBusiness = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/businesses/${id}`);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar negocio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Buscar negocios
  const searchBusinesses = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/businesses/search', { params });
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al buscar negocios';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Auto-cargar negocio si se pasa businessId
  useEffect(() => {
    if (businessId) {
      fetchBusiness(businessId);
    }
  }, [businessId]);

  return {
    business,
    businesses,
    loading,
    error,
    fetchMyBusinesses,
    fetchBusiness,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    searchBusinesses,
  };
};

export default useBusiness;
