import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import ServiceForm from '../components/ServiceForm';
import servicesService from '../services/servicesService';

export default function ServiceFormPage() {
  const { businessId, serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(!!serviceId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchService();
    }
  }, [serviceId]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getServiceById(serviceId);
      setService(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando servicio');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return <ServiceForm businessId={businessId} initialData={service} />;
}
