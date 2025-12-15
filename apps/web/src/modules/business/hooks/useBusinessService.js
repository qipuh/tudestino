import { useState } from 'react';
import api from '../../../services/api';

export const useBusinessService = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener servicios de un negocio
  const fetchServices = async (businessId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/businesses/${businessId}/services`);
      // `api` returns the parsed response body: { success, data }
      // Store the inner data array (list of services)
      setServices(response.data.data || response.data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al cargar servicios';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Crear servicio
  const createService = async (businessId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/businesses/${businessId}/services`, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar servicio
  const updateService = async (serviceId, data) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/businesses/services/${serviceId}`, data);
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar servicio
  const deleteService = async (serviceId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/businesses/services/${serviceId}`);
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar servicio';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Reordenar servicios
  const reorderServices = async (businessId, servicesOrder) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/businesses/${businessId}/services/reorder`, {
        servicesOrder,
      });
      return { success: true, data: response.data.data || response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al reordenar servicios';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    reorderServices,
  };
};

export default useBusinessService;
