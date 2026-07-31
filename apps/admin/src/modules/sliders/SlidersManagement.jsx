import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { slidersService } from '../../services/sliders.service';
import SliderForm from './SliderForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function SlidersManagement() {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlider, setEditingSlider] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await slidersService.getAll();
      setSliders(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sliders:', err);
      setError('Error al cargar los sliders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSlider(null);
    setShowForm(true);
  };

  const handleEdit = (slider) => {
    setEditingSlider(slider);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este slider?')) return;

    try {
      await slidersService.delete(id);
      fetchSliders();
    } catch (err) {
      console.error('Error deleting slider:', err);
      alert('Error al eliminar el slider');
    }
  };

  const handleToggleActive = async (slider) => {
    try {
      const formData = new FormData();
      formData.append('isActive', !slider.isActive);
      formData.append('title', slider.title);
      if (slider.linkUrl) formData.append('linkUrl', slider.linkUrl);
      formData.append('displayOrder', slider.displayOrder);

      await slidersService.update(slider.id, formData);
      fetchSliders();
    } catch (err) {
      console.error('Error updating slider:', err);
      alert('Error al actualizar el slider');
    }
  };

  const handleMoveUp = async (slider, index) => {
    if (index === 0) return;

    const prevSlider = sliders[index - 1];
    const newOrder = [
      { id: slider.id, displayOrder: prevSlider.displayOrder },
      { id: prevSlider.id, displayOrder: slider.displayOrder }
    ];

    try {
      await slidersService.updateOrder(newOrder);
      fetchSliders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el orden');
    }
  };

  const handleMoveDown = async (slider, index) => {
    if (index === sliders.length - 1) return;

    const nextSlider = sliders[index + 1];
    const newOrder = [
      { id: slider.id, displayOrder: nextSlider.displayOrder },
      { id: nextSlider.id, displayOrder: slider.displayOrder }
    ];

    try {
      await slidersService.updateOrder(newOrder);
      fetchSliders();
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Error al actualizar el orden');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingSlider(null);
    fetchSliders();
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL.replace(/\/api$/, '')}/uploads/sliders/${imageUrl}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showForm) {
    return (
      <SliderForm
        slider={editingSlider}
        onSuccess={handleFormSuccess}
        onCancel={() => {
          setShowForm(false);
          setEditingSlider(null);
        }}
      />
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Sliders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Administra los sliders de la página principal
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Nuevo Slider
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Sliders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Imagen
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Enlace
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orden
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sliders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No hay sliders creados. Crea tu primer slider.
                </td>
              </tr>
            ) : (
              sliders.map((slider, index) => (
                <tr key={slider.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img
                      src={getImageUrl(slider.imageUrl)}
                      alt={slider.title}
                      className="h-16 w-28 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {slider.title}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {slider.linkUrl || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(slider)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        slider.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {slider.isActive ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-900">
                        {slider.displayOrder}
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(slider, index)}
                          disabled={index === 0}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveDown(slider, index)}
                          disabled={index === sliders.length - 1}
                          className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(slider)}
                        className="text-gray-600 hover:text-gray-900"
                        title={slider.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {slider.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => handleEdit(slider)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SlidersManagement;
