import { useState, useRef, useEffect } from 'react';
import { X, Image as ImageIcon, Video, MapPin, Users, Smile, Send, Upload, Play, Pause, Loader, Search, AtSign } from 'lucide-react';
import useAuthStore from '../../../store/authStore';
import { getImageUrl } from '../../../services/api';
import { createPost, createReel } from '../../../services/socialService';
import api from '../../../services/api';

/**
 * Sidebar para crear publicaciones y reels
 * Similar a Instagram/TikTok
 */
function CreateContentSidebar({ isOpen, onClose, type = 'post', onSuccess }) {
  const { user } = useAuthStore();
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const [contentType, setContentType] = useState(type); // 'post' | 'reel'

  // Sincronizar contentType cuando cambia el prop type
  useEffect(() => {
    setContentType(type);
    console.log('🔄 ContentType actualizado a:', type);
  }, [type]);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [businessSuggestions, setBusinessSuggestions] = useState([]);
  const [showBusinessSuggestions, setShowBusinessSuggestions] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const locationInputRef = useRef(null);
  const captionInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Lista de emojis comunes
  const commonEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩',
    '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐',
    '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒',
    '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '🥸', '😎', '🤓', '🧐', '😕',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
    '✨', '💫', '⭐', '🌟', '⚡', '🔥', '💥', '💯', '👍', '👎', '👏', '🙌', '👐', '🤝', '🙏', '✊',
    '🌈', '☀️', '⛅', '☁️', '🌙', '⭐', '✨', '🌍', '🌎', '🌏', '🗺️', '🏔️', '⛰️', '🏕️', '🏖️', '🏝️',
    '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍰', '🧁', '🍕', '🍔', '🍟', '🌭', '🍿', '🥤', '☕', '🍺'
  ];

  // Buscar ubicaciones usando Nominatim (OpenStreetMap)
  const searchLocations = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setLoadingLocations(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`
      );
      const data = await response.json();

      const suggestions = data.map(item => ({
        name: item.display_name,
        city: item.address?.city || item.address?.town || item.address?.village,
        country: item.address?.country,
      }));

      setLocationSuggestions(suggestions);
    } catch (error) {
      console.error('Error searching locations:', error);
      setLocationSuggestions([]);
    } finally {
      setLoadingLocations(false);
    }
  };

  // Buscar negocios para etiquetar
  const searchBusinesses = async (query) => {
    if (!query || query.length < 2) {
      setBusinessSuggestions([]);
      return;
    }

    setLoadingBusinesses(true);
    try {
      const response = await api.get(`/businesses/search?q=${encodeURIComponent(query)}&limit=5`);
      setBusinessSuggestions(response.businesses || []);
    } catch (error) {
      console.error('Error searching businesses:', error);
      setBusinessSuggestions([]);
    } finally {
      setLoadingBusinesses(false);
    }
  };

  // Detectar @ en caption para buscar negocios
  useEffect(() => {
    if (!caption) return;

    const cursorPos = captionInputRef.current?.selectionStart || 0;
    const textBeforeCursor = caption.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      const hasSpace = textAfterAt.includes(' ');

      if (!hasSpace && textAfterAt.length > 0) {
        setMentionSearch(textAfterAt);
        searchBusinesses(textAfterAt);
        setShowBusinessSuggestions(true);
      } else {
        setShowBusinessSuggestions(false);
      }
    } else {
      setShowBusinessSuggestions(false);
    }
  }, [caption, cursorPosition]);

  // Debounce para buscar ubicaciones
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchLocations(location);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [location]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validar tipo de archivo según el tipo de contenido
    const validFiles = files.filter(file => {
      if (contentType === 'reel') {
        return file.type.startsWith('video/');
      } else {
        return file.type.startsWith('image/') || file.type.startsWith('video/');
      }
    });

    if (validFiles.length === 0) {
      alert(contentType === 'reel'
        ? 'Por favor selecciona un video'
        : 'Por favor selecciona imágenes o videos');
      return;
    }

    // Para reels, solo un video
    if (contentType === 'reel' && validFiles.length > 1) {
      alert('Solo puedes subir un video para un reel');
      validFiles.splice(1);
    }

    // Para posts, máximo 10 archivos
    if (contentType === 'post' && validFiles.length > 10) {
      alert('Máximo 10 archivos por publicación');
      validFiles.splice(10);
    }

    setSelectedFiles(validFiles);

    // Crear previews
    const newPreviews = validFiles.map(file => ({
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' : 'image',
    }));
    setPreviews(newPreviews);
  };

  const handleRemoveFile = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];

    // Liberar URL del objeto
    URL.revokeObjectURL(newPreviews[index].url);

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedFiles.length === 0) {
      alert('Selecciona al menos un archivo');
      return;
    }

    if (!caption.trim()) {
      alert('Escribe una descripción');
      return;
    }

    console.log('🚀 Iniciando creación de contenido...');
    console.log('📝 ContentType:', contentType);
    console.log('📝 Caption:', caption);
    console.log('📁 Archivos seleccionados:', selectedFiles.length);

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('type', contentType);
      formData.append('caption', caption);
      formData.append('location', location);

      // Agregar archivos
      selectedFiles.forEach((file, index) => {
        if (contentType === 'reel') {
          console.log('🎬 Agregando video al FormData:', file.name);
          formData.append('video', file);
        } else {
          console.log('📸 Agregando media al FormData:', file.name);
          formData.append('media', file);
        }
      });

      // Simular progreso (en producción usarías onUploadProgress de axios)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Crear publicación
      console.log('📡 Llamando a:', contentType === 'reel' ? 'createReel()' : 'createPost()');
      const response = contentType === 'reel'
        ? await createReel(formData)
        : await createPost(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('✅ Content created:', response);
      console.log('📦 Response data:', response.data);

      // Limpiar formulario
      setTimeout(() => {
        resetForm();
        onClose();
        // Llamar al callback onSuccess si existe
        if (onSuccess) {
          // response contiene { success: true, data: postWithUser }
          onSuccess(response.data);
        }
      }, 500);

    } catch (error) {
      console.error('Error creating content:', error);
      alert('Error al crear la publicación. Por favor intenta nuevamente.');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSelectLocation = (suggestion) => {
    setLocation(suggestion.name);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
  };

  const handleSelectBusiness = (business) => {
    const cursorPos = captionInputRef.current?.selectionStart || 0;
    const textBeforeCursor = caption.substring(0, cursorPos);
    const textAfterCursor = caption.substring(cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    const beforeMention = caption.substring(0, lastAtIndex);
    const afterMention = textAfterCursor;

    const newCaption = `${beforeMention}@${business.username || business.name} ${afterMention}`;
    setCaption(newCaption);
    setShowBusinessSuggestions(false);
    setBusinessSuggestions([]);

    // Enfocar el textarea
    setTimeout(() => {
      captionInputRef.current?.focus();
      const newPos = (beforeMention + `@${business.username || business.name} `).length;
      captionInputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleEmojiSelect = (emoji) => {
    const cursorPos = captionInputRef.current?.selectionStart || caption.length;
    const textBefore = caption.substring(0, cursorPos);
    const textAfter = caption.substring(cursorPos);
    setCaption(textBefore + emoji + textAfter);
    setShowEmojiPicker(false);

    // Set cursor position after emoji
    setTimeout(() => {
      captionInputRef.current?.focus();
      const newPos = textBefore.length + emoji.length;
      captionInputRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const resetForm = () => {
    setCaption('');
    setLocation('');
    setSelectedFiles([]);
    previews.forEach(preview => URL.revokeObjectURL(preview.url));
    setPreviews([]);
    setUploading(false);
    setUploadProgress(0);
    setLocationSuggestions([]);
    setBusinessSuggestions([]);
    setShowLocationSuggestions(false);
    setShowBusinessSuggestions(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (uploading) {
      if (!confirm('¿Estás seguro de cancelar? Se perderá tu progreso.')) {
        return;
      }
    }
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/10 rounded-full transition"
              disabled={uploading}
            >
              <X size={24} className="text-white" />
            </button>
            <h2 className="text-xl font-bold text-white">
              {contentType === 'reel' ? 'Crear Reel' : 'Nueva Publicación'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContentType('post')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                contentType === 'post'
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={uploading}
            >
              <ImageIcon size={16} className="inline mr-1" />
              Post
            </button>
            <button
              onClick={() => setContentType('reel')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                contentType === 'reel'
                  ? 'bg-white text-primary'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              disabled={uploading}
            >
              <Video size={16} className="inline mr-1" />
              Reel
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl overflow-hidden">
                {user?.avatar ? (
                  <img src={getImageUrl(user.avatar, 'social')} alt={user.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-600">@{user?.username || user?.email?.split('@')[0]}</p>
              </div>
            </div>

            {/* Caption */}
            <div className="relative">
              <textarea
                ref={captionInputRef}
                value={caption}
                onChange={(e) => {
                  setCaption(e.target.value);
                  setCursorPosition(e.target.selectionStart);
                }}
                onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                onClick={(e) => setCursorPosition(e.target.selectionStart)}
                placeholder={contentType === 'reel' ? '¿Qué está pasando en tu reel? Usa @ para etiquetar negocios' : '¿Qué quieres compartir? Usa @ para etiquetar negocios'}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none resize-none"
                rows="4"
                disabled={uploading}
                maxLength="2200"
              />

              {/* Business Suggestions Dropdown */}
              {showBusinessSuggestions && businessSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {loadingBusinesses ? (
                    <div className="p-3 text-center text-gray-500">
                      <Loader size={16} className="animate-spin inline mr-2" />
                      Buscando negocios...
                    </div>
                  ) : (
                    businessSuggestions.map((business) => (
                      <button
                        key={business.id}
                        type="button"
                        onClick={() => handleSelectBusiness(business)}
                        className="w-full p-3 text-left hover:bg-gray-100 transition flex items-center gap-3"
                      >
                        {business.avatar ? (
                          <img
                            src={getImageUrl(business.avatar, 'social')}
                            alt={business.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <AtSign size={20} className="text-primary" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{business.name}</p>
                          <p className="text-xs text-gray-500">@{business.username || business.name}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-1 px-1">
                <span className="text-xs text-gray-500">
                  {caption.length}/2200 · Usa @ para etiquetar negocios
                </span>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  disabled={uploading}
                >
                  <Smile size={20} />
                </button>
              </div>

              {/* Emoji Picker Dropdown */}
              {showEmojiPicker && (
                <div className="absolute z-10 right-0 mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg p-3 w-80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Emojis</span>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
                    {commonEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleEmojiSelect(emoji)}
                        className="p-2 text-2xl hover:bg-gray-100 rounded transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="relative">
              <div className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl">
                <MapPin size={20} className="text-gray-400" />
                <input
                  ref={locationInputRef}
                  type="text"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setShowLocationSuggestions(true);
                  }}
                  onFocus={() => location.length >= 3 && setShowLocationSuggestions(true)}
                  placeholder="Agregar ubicación (ciudad, país...)"
                  className="flex-1 outline-none"
                  disabled={uploading}
                />
                {loadingLocations && (
                  <Loader size={16} className="animate-spin text-gray-400" />
                )}
              </div>

              {/* Location Suggestions Dropdown */}
              {showLocationSuggestions && locationSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {locationSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectLocation(suggestion)}
                      className="w-full p-3 text-left hover:bg-gray-100 transition"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{suggestion.city || suggestion.name.split(',')[0]}</p>
                          <p className="text-xs text-gray-500 truncate">{suggestion.name}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Media Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
              {previews.length === 0 ? (
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className="cursor-pointer text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-primary/10 to-primary-dark/10 rounded-full flex items-center justify-center">
                    {contentType === 'reel' ? (
                      <Video size={32} className="text-primary" />
                    ) : (
                      <ImageIcon size={32} className="text-primary" />
                    )}
                  </div>
                  <p className="text-gray-700 font-medium mb-1">
                    {contentType === 'reel' ? 'Subir video' : 'Subir fotos o videos'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {contentType === 'reel'
                      ? 'MP4, MOV hasta 100MB'
                      : 'JPG, PNG, MP4 hasta 10 archivos'}
                  </p>
                  <button
                    type="button"
                    className="mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition"
                  >
                    Seleccionar {contentType === 'reel' ? 'video' : 'archivos'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Previews */}
                  <div className={`grid gap-2 ${contentType === 'reel' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {previews.map((preview, index) => (
                      <div key={index} className="relative group">
                        {preview.type === 'video' ? (
                          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              ref={contentType === 'reel' ? videoRef : null}
                              src={preview.url}
                              className="w-full h-full object-cover"
                              loop
                              playsInline
                            />
                            {contentType === 'reel' && (
                              <button
                                type="button"
                                onClick={toggleVideoPlayback}
                                className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition"
                              >
                                {isVideoPlaying ? (
                                  <Pause size={48} className="text-white" />
                                ) : (
                                  <Play size={48} className="text-white" />
                                )}
                              </button>
                            )}
                          </div>
                        ) : (
                          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={preview.url}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        {!uploading && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add more button */}
                  {contentType === 'post' && previews.length < 10 && !uploading && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition flex items-center justify-center gap-2 text-gray-600 hover:text-primary"
                    >
                      <Upload size={20} />
                      Agregar más archivos
                    </button>
                  )}
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={contentType === 'reel' ? 'video/*' : 'image/*,video/*'}
                multiple={contentType === 'post'}
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Loader size={20} className="animate-spin text-primary" />
                  <p className="text-sm font-medium text-gray-900">
                    Subiendo {contentType === 'reel' ? 'reel' : 'publicación'}...
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">{uploadProgress}%</p>
              </div>
            )}

            {/* Tips */}
            {!uploading && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  {contentType === 'reel' ? '💡 Tips para reels' : '💡 Tips para publicaciones'}
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  {contentType === 'reel' ? (
                    <>
                      <li>• Videos verticales funcionan mejor (9:16)</li>
                      <li>• Duración ideal: 15-60 segundos</li>
                      <li>• Usa hashtags relevantes para más alcance</li>
                      <li>• Comparte momentos de tus viajes</li>
                    </>
                  ) : (
                    <>
                      <li>• Usa fotos de alta calidad</li>
                      <li>• Comparte tus experiencias de viaje</li>
                      <li>• Etiqueta ubicaciones para más visibilidad</li>
                      <li>• Sé auténtico y cuenta tu historia</li>
                    </>
                  )}
                </ul>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={uploading || selectedFiles.length === 0 || !caption.trim()}
            className={`
              w-full py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2
              ${uploading || selectedFiles.length === 0 || !caption.trim()
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-primary-dark hover:opacity-90 shadow-lg hover:shadow-xl'
              }
            `}
          >
            {uploading ? (
              <>
                <Loader size={20} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Send size={20} />
                Publicar {contentType === 'reel' ? 'Reel' : 'Post'}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default CreateContentSidebar;
