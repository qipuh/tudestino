import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Send, User, Search } from 'lucide-react';
import useMessagingStore from '../../../store/messagingStore';
import useAuthStore from '../../../store/authStore';
import useSocket from '../../../hooks/useSocket';

function MessagesPage() {
  const { user } = useAuthStore();
  const socket = useSocket();
  const {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    fetchConversations,
    getOrCreateConversation,
    fetchMessages,
    sendMessage,
    setCurrentConversation,
    addIncomingMessage,
  } = useMessagingStore();

  const [searchParams] = useSearchParams();
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Socket.IO: Escuchar mensajes nuevos
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (message) => {
      console.log('📨 Nuevo mensaje recibido:', message);
      addIncomingMessage(message);
    });

    return () => {
      socket.off('new_message');
    };
  }, [socket, addIncomingMessage]);

  // Socket.IO: Unirse a la conversación actual
  useEffect(() => {
    if (!socket || !currentConversation) return;

    socket.emit('join_conversation', currentConversation.id);

    return () => {
      socket.emit('leave_conversation', currentConversation.id);
    };
  }, [socket, currentConversation]);

  // Al cargar, obtener conversaciones
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Si viene con parámetros de URL (otherUserId, bookingId), crear/abrir conversación
  useEffect(() => {
    const otherUserId = searchParams.get('user');
    const bookingId = searchParams.get('booking');

    if (otherUserId) {
      getOrCreateConversation(otherUserId, bookingId || null)
        .then((conv) => {
          setCurrentConversation(conv);
          fetchMessages(conv.id);
        });
    }
  }, [searchParams]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectConversation = async (conversation) => {
    setCurrentConversation(conversation);
    await fetchMessages(conversation.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation.id, messageInput.trim());
      setMessageInput('');
    } catch (error) {
      alert('Error al enviar mensaje: ' + error.message);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-ES', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.otherUser?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Sidebar - Lista de conversaciones */}
      <div className="w-full md:w-96 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h1 className="text-2xl font-bold mb-4">Mensajes</h1>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar conversaciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando conversaciones...</p>
              </div>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {searchQuery ? 'No se encontraron conversaciones' : 'No tienes conversaciones'}
                </h3>
                <p className="text-gray-500 text-sm">
                  {searchQuery ? 'Intenta con otro término de búsqueda' : 'Comienza a chatear desde una reserva'}
                </p>
              </div>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 border-b transition ${
                  currentConversation?.id === conversation.id ? 'bg-blue-50' : ''
                }`}
              >
                {/* Avatar */}
                {conversation.otherUser?.avatar ? (
                  <img
                    src={conversation.otherUser.avatar}
                    alt={conversation.otherUser.name}
                    className="w-12 h-12 rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={24} className="text-gray-400" />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{conversation.otherUser?.name}</h3>
                    {conversation.lastMessageAt && (
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessageAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conversation.lastMessage || 'Sin mensajes'}</p>
                </div>

                {/* Unread Badge */}
                {conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-primary rounded-full">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b p-4 flex items-center gap-3">
              {currentConversation.otherUser?.avatar ? (
                <img
                  src={currentConversation.otherUser.avatar}
                  alt={currentConversation.otherUser.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <h2 className="font-bold text-gray-900">{currentConversation.otherUser?.name}</h2>
                <p className="text-sm text-gray-500">{currentConversation.otherUser?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user.id;
                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-gray-200 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm break-words">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.createdAt)}
                        {isOwn && message.isRead && ' · Leído'}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send size={18} />
                  Enviar
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">Selecciona una conversación</h3>
              <p className="text-gray-500">Elige una conversación de la lista para empezar a chatear</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default MessagesPage;
