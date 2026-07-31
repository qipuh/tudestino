import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader, Check } from 'lucide-react';
import OfferCard from '../components/OfferCard';
import offersService from '../services/offersService';

export default function OffersPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, [businessId]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const data = await offersService.getOffersByBusiness(businessId);
      setOffers(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando ofertas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await offersService.deleteOffer(id);
      setOffers(offers.filter(o => o.id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/businesses/${businessId}/offers/${id}/edit`);
  };

  const handleCopyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold">Ofertas</h1>
          </div>
          <Link
            to={`/businesses/${businessId}/offers/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            Nueva Oferta
          </Link>
        </div>

        {copied && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
            <Check size={20} />
            Código copiado al portapapeles
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : offers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No hay ofertas para mostrar</p>
            <Link
              to={`/businesses/${businessId}/offers/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} />
              Crear la primera
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map(offer => (
              <OfferCard
                key={offer.id}
                offer={offer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyCode={handleCopyCode}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
