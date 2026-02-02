import { useState, useEffect } from 'react';
import api from '../services/api';
import useAuthStore from '../store/authStore';

/**
 * Hook para verificar el estado de verificación de identidad del usuario
 * Cachea el resultado para evitar llamadas innecesarias
 */
export const useVerification = () => {
  const { user } = useAuthStore();
  const [verificationStatus, setVerificationStatus] = useState({
    isVerified: false,
    status: 'pending',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      // Si no hay usuario autenticado, no verificar
      if (!user) {
        setVerificationStatus({
          isVerified: false,
          status: 'pending',
          loading: false,
          error: null,
        });
        return;
      }

      try {
        const response = await api.get('/verification/identity/status');

        if (response.data.success) {
          const data = response.data.data;
          setVerificationStatus({
            isVerified: data.isVerified,
            status: data.status,
            verifiedAt: data.verifiedAt,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setVerificationStatus({
          isVerified: false,
          status: 'pending',
          loading: false,
          error: error.message,
        });
      }
    };

    fetchVerificationStatus();
  }, [user]);

  return verificationStatus;
};

export default useVerification;
