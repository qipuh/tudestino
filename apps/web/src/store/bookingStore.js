import { create } from 'zustand';
import * as bookingService from '../modules/bookings/services/bookingService';

const useBookingStore = create((set, get) => ({
  bookings: [],
  currentBooking: null,
  loading: false,
  error: null,

  // Obtener todas mis reservas
  fetchMyBookings: async () => {
    set({ loading: true, error: null });
    try {
      const response = await bookingService.getMyBookings();
      // El backend devuelve { success: true, data: [...] }
      const bookings = response.data || response || [];
      set({ bookings, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Obtener una reserva específica
  fetchBookingById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingService.getBookingById(id);
      const booking = response.data || response;
      set({ currentBooking: booking, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  // Crear una nueva reserva
  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingService.createBooking(bookingData);
      const booking = response.data || response;
      set((state) => ({
        bookings: [booking, ...state.bookings],
        currentBooking: booking,
        loading: false,
      }));
      return booking;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Actualizar estado de una reserva
  updateBookingStatus: async (id, status, cancellationReason = null) => {
    set({ loading: true, error: null });
    try {
      const response = await bookingService.updateBookingStatus(id, status, cancellationReason);
      const updatedBooking = response.data || response;
      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === id ? updatedBooking : b
        ),
        currentBooking: state.currentBooking?.id === id ? updatedBooking : state.currentBooking,
        loading: false,
      }));
      return updatedBooking;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  // Verificar disponibilidad
  checkAvailability: async (propertyId, checkIn, checkOut) => {
    try {
      const available = await bookingService.checkAvailability(propertyId, checkIn, checkOut);
      return available;
    } catch (error) {
      console.error('Error checking availability:', error);
      return false;
    }
  },

  // Limpiar error
  clearError: () => set({ error: null }),

  // Limpiar reserva actual
  clearCurrentBooking: () => set({ currentBooking: null }),
}));

export default useBookingStore;
