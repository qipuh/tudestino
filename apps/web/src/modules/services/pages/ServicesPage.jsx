import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Loader } from 'lucide-react';
import ServiceCard from '../components/ServiceCard';
import servicesService from '../services/servicesService';

export default function ServicesPage() {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchServices();
  }, [businessId, typeFilter]);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await servicesService.getServicesByBusiness(businessId, {
        type: typeFilter || undefined
      });
      setServices(Array.isArray(data) ? data : (data.data || []));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error cargando servicios');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await servicesService.deleteService(id);
      setServices(services.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/businesses/${businessId}/services/${id}/edit`);
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
            <h1 className="text-3xl font-bold">Servicios</h1>
          </div>
          <Link
            to={`/businesses/${businessId}/services/new`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus size={20} />
            Nuevo Servicio
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Todos los tipos</option>
            <option value="amenity">Amenidad</option>
            <option value="food_item">Plato</option>
            <option value="addon">Complemento</option>
            <option value="activity">Actividad</option>
            <option value="ticket_type">Entrada</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin text-blue-500" size={40} />
          </div>
        ) : services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No hay servicios para mostrar</p>
            <Link
              to={`/businesses/${businessId}/services/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={20} />
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
