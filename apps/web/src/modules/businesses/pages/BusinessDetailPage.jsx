import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Phone, Mail, Globe, Loader, Edit, Trash2 } from 'lucide-react';
import businessesService from '../services/businessesService';

export default function BusinessDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const data = await businessesService.getBusinessById(id);
      setBusiness(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando negocio');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('¿Eliminar este negocio permanentemente?')) {
      try {
        await businessesService.deleteBusiness(id);
        navigate('/businesses');
      } catch (err) {
        console.error('Error:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-500 mb-4 hover:text-blue-600"
          >
            <ArrowLeft size={20} />
            Atrás
          </button>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error || 'Negocio no encontrado'}
          </div>
        </div>
      </div>
    );
  }

  const address = typeof business.address === 'string'
    ? JSON.parse(business.address)
    : business.address;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-500 mb-6 hover:text-blue-600"
        >
          <ArrowLeft size={20} />
          Atrás
        </button>

        <div className="bg-white rounded-lg shadow">
          {/* Imagen de portada */}
          {business.coverImage && (
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-96 object-cover rounded-t-lg"
            />
          )}

          <div className="p-8">
            {/* Título y estado */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">{business.name}</h1>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {business.businessType}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    business.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {business.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/businesses/${business.id}/edit`}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Edit size={20} />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  <Trash2 size={20} />
                  Eliminar
                </button>
              </div>
            </div>

            {/* Descripción */}
            <p className="text-gray-700 mb-8 text-lg">{business.description}</p>

            {/* Grid de info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Ubicación */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Ubicación</h2>
                <div className="space-y-2 text-gray-600">
                  {address?.street && (
                    <div className="flex items-start gap-3">
                      <MapPin size={20} className="mt-1 flex-shrink-0" />
                      <span>{address.street}</span>
                    </div>
                  )}
                  {address?.city && <div className="ml-8">{address.city}, {address.country}</div>}
                  {address?.latitude && (
                    <div className="ml-8 text-sm">
                      {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Rating */}
              {business.ratingAverage > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Calificación</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          className={i < Math.round(business.ratingAverage)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{business.ratingAverage}</div>
                      <div className="text-sm text-gray-500">({business.reviewCount} reseñas)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Información del negocio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {business.contactPhone && (
                <a
                  href={`tel:${business.contactPhone}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Phone size={20} className="text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Teléfono</div>
                    <div className="font-medium">{business.contactPhone}</div>
                  </div>
                </a>
              )}
              {business.contactEmail && (
                <a
                  href={`mailto:${business.contactEmail}`}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Mail size={20} className="text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{business.contactEmail}</div>
                  </div>
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <Globe size={20} className="text-blue-500" />
                  <div>
                    <div className="text-sm text-gray-600">Sitio web</div>
                    <div className="font-medium truncate">{business.website}</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
