import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

export default function useEvents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crear un nuevo evento
   * @param {Object} eventData - Datos del evento
   * @param {string} organizedBy - 'user' o 'business'
   * @param {string|null} businessServiceId - ID del servicio de negocio (si es organizado por negocio)
   */
  const createEvent = async (eventData, organizedBy = 'user', businessServiceId = null) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...eventData,
          organizedBy,
          businessServiceId
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el evento');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al crear el evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener evento por ID
   */
  const getEvent = async (eventId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/events/${eventId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener el evento');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al obtener el evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener mis eventos (como organizador)
   */
  const getMyEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/events/organizer/my-events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener tus eventos');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al obtener tus eventos';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar evento
   */
  const updateEvent = async (eventId, updateData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar el evento');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al actualizar el evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar evento
   */
  const deleteEvent = async (eventId) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar el evento');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al eliminar el evento';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Subir imagen para el evento
   */
  const uploadEventImage = async (eventId, imageFile) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No estás autenticado');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_URL}/events/${eventId}/images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      return { success: true, data };
    } catch (err) {
      const errorMsg = err.message || 'Error al subir la imagen';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createEvent,
    getEvent,
    getMyEvents,
    updateEvent,
    deleteEvent,
    uploadEventImage
  };
}
