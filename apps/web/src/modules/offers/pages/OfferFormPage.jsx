import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader } from 'lucide-react';
import OfferForm from '../components/OfferForm';
import offersService from '../services/offersService';

export default function OfferFormPage() {
  const { businessId, offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(!!offerId);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (offerId) {
      fetchOffer();
    }
  }, [offerId]);

  const fetchOffer = async () => {
    try {
      setLoading(true);
      const data = await offersService.getOfferById(offerId);
      setOffer(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando oferta');
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

  return <OfferForm businessId={businessId} initialData={offer} />;
}
