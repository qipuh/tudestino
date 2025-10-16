import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      // Si no hay token, desconectar socket si existe
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Conectar socket con autenticación
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
    });

    // Eventos de conexión
    socketRef.current.on('connect', () => {
      console.log('✅ Socket conectado:', socketRef.current.id);
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket desconectado');
    });

    socketRef.current.on('connect_error', (error) => {
      console.warn('⚠️ Socket.IO no disponible (el chat en tiempo real no funcionará):', error.message);
      // No afecta la funcionalidad principal de la app
    });

    // Cleanup al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  return socketRef.current;
};

export default useSocket;
