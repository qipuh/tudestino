import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, AlertCircle, Image } from 'lucide-react';
import api from '../../../services/api';
import useVerification from '../../../hooks/useVerification';

function VerifyIdentityPage() {
  const navigate = useNavigate();
  const { isVerified, status, loading: statusLoading } = useVerification();

  const [documentType, setDocumentType] = useState('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFront, setDocumentFront] = useState(null);
  const [documentFrontPreview, setDocumentFrontPreview] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Si el usuario ya está verificado, redirigir al perfil
    if (!statusLoading && isVerified) {
      navigate('/account/profile');
    }
  }, [isVerified, statusLoading, navigate]);

  const handleDocumentFrontChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      setDocumentFront(file);
      setDocumentFrontPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSelfieChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no puede superar los 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      setSelfie(file);
      setSelfiePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validaciones
    if (!documentType) {
      setError('Selecciona un tipo de documento');
      return;
    }

    if (!documentNumber || documentNumber.trim().length < 5) {
      setError('Ingresa un número de documento válido');
      return;
    }

    if (!documentFront) {
      setError('Sube una foto de tu documento de identidad');
      return;
    }

    if (!selfie) {
      setError('Sube una selfie sosteniendo tu documento');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('documentNumber', documentNumber.trim());
      formData.append('documentFront', documentFront);
      formData.append('selfie', selfie);

      const response = await api.post('/verification/identity/submit', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/account/profile');
        }, 3000);
      }
    } catch (err) {
      console.error('Error al enviar verificación:', err);
      setError(err.response?.data?.message || 'Error al enviar la verificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si está pendiente, mostrar mensaje
  if (status === 'pending' && !success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-0.5" />
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Verificación en proceso
                </h3>
                <p className="text-blue-800">
                  Tu solicitud de verificación está siendo revisada. Te notificaremos cuando sea aprobada.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si fue rechazado, permitir reenviar
  if (status === 'rejected') {
    // Permitir reenviar
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8 bg-primary">
            <h1 className="text-3xl font-bold text-white mb-2">Verificación de Identidad</h1>
            <p className="text-white/90">
              Verifica tu identidad para acceder a todas las funcionalidades de la plataforma
            </p>
          </div>

          <div className="px-6 py-8">
            {success && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <div className="flex items-start">
                  <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-900">Solicitud enviada exitosamente</h3>
                    <p className="mt-1 text-sm text-green-800">
                      Revisaremos tu documentación y te notificaremos pronto. Serás redirigido a tu perfil...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-6 h-6 text-red-600 mt-0.5" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Documento
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                >
                  <option value="DNI">DNI</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Carné de Extranjería">Carné de Extranjería</option>
                  <option value="Licencia de Conducir">Licencia de Conducir</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Documento
                </label>
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto del Documento (frontal)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {documentFrontPreview ? (
                      <div className="mb-4">
                        <img
                          src={documentFrontPreview}
                          alt="Preview documento"
                          className="mx-auto max-h-64 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocumentFront(null);
                            setDocumentFrontPreview(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <>
                        <Image className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                            <span>Sube una foto</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleDocumentFrontChange}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selfie sosteniendo tu documento
                </label>
                <p className="text-sm text-gray-600 mb-2">
                  Toma una foto de ti mismo sosteniendo tu documento de identidad junto a tu rostro
                </p>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary transition-colors">
                  <div className="space-y-1 text-center">
                    {selfiePreview ? (
                      <div className="mb-4">
                        <img
                          src={selfiePreview}
                          alt="Preview selfie"
                          className="mx-auto max-h-64 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelfie(null);
                            setSelfiePreview(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Eliminar
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark">
                            <span>Sube una selfie</span>
                            <input
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleSelfieChange}
                            />
                          </label>
                          <p className="pl-1">o arrastra y suelta</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG hasta 5MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Consejos para una verificación exitosa:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Asegúrate de que toda la información del documento sea legible</li>
                  <li>• Tu rostro y el documento deben estar claramente visibles en la selfie</li>
                  <li>• Usa buena iluminación y evita reflejos</li>
                  <li>• Las fotos no deben estar borrosas</li>
                </ul>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/account/profile')}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !documentFront || !selfie}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2" />
                      Enviar verificación
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyIdentityPage;
