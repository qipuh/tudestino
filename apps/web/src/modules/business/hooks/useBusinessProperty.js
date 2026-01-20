import { useState } from 'react';
import api from '../../../services/api';

export const useBusinessProperty = () => {
  const [property, setProperty] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener propiedad de un negocio con sus habitaciones
  const fetchBusinessProperty = async (businessId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/businesses/${businessId}/properties`);
      setProperty(response.data);
      setRooms(response.data?.rooms || []);
      return { success: true, data: response.data };
    } catch (err) {
      // 404 es esperado cuando el negocio no tiene propiedades configuradas
      if (err.response?.status !== 404) {
        console.error('[useBusinessProperty] Error fetching property:', err);
      }
      const errorMsg = err.response?.data?.message || 'Este negocio no tiene una propiedad configurada';
      setError(errorMsg);
      setProperty(null);
      setRooms([]);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Crear propiedad con habitaciones
  const createPropertyWithRooms = async (businessId, propertyData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(`/businesses/${businessId}/properties`, propertyData);
      setProperty(response.data);
      setRooms(response.data?.rooms || []);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear propiedad';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Actualizar habitación
  const updateRoom = async (roomId, roomData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/rooms/${roomId}`, roomData);
      // Actualizar la habitación en el estado local
      setRooms(prevRooms =>
        prevRooms.map(room => room.id === roomId ? response.data : room)
      );
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar habitación';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  // Eliminar habitación
  const deleteRoom = async (roomId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/rooms/${roomId}`);
      // Eliminar la habitación del estado local
      setRooms(prevRooms => prevRooms.filter(room => room.id !== roomId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar habitación';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    property,
    rooms,
    loading,
    error,
    fetchBusinessProperty,
    createPropertyWithRooms,
    updateRoom,
    deleteRoom
  };
};

export default useBusinessProperty;
