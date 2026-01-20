import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useMessagingStore from '../../store/messagingStore';
import { useSocket } from '../../hooks/useSocket';
import { getImageUrl } from '../../services/api';

function FloatingChatBubble({ recipient, onClose }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const socket = useSocket();

  const {
    currentConversation,
    messages,
    loading,
    getOrCreateConversation,
    sendMessage: sendMessageToStore,
    markAsRead,
  } = useMessagingStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Crear/obtener conversación cuando se monta el componente
  useEffect(() => {
    if (recipient && user) {
      getOrCreateConversation(recipient.id);
    }
  }, [recipient?.id, user, getOrCreateConversation]);

  // Marcar mensajes como leídos cuando se abre el chat
  useEffect(() => {
    if (currentConversation && !isMinimized) {
      markAsRead(currentConversation.id);
    }
  }, [currentConversation, isMinimized, markAsRead]);

  // Escuchar nuevos mensajes por Socket.IO
  useEffect(() => {
    if (!socket || !currentConversation) return;

    const handleNewMessage = (newMessage) => {
      if (newMessage.conversationId === currentConversation.id) {
        // El store ya maneja agregar el mensaje
        if (!isMinimized) {
          markAsRead(currentConversation.id);
        }
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, currentConversation, isMinimized, markAsRead]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !currentConversation) return;

    try {
      await sendMessageToStore(currentConversation.id, message.trim());
      setMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleOpenFullChat = () => {
    navigate(`/messages?user=${recipient.id}`);
    onClose();
  };

  if (isMinimized) {
    const unreadCount = currentConversation?.unreadCount || 0;
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full p-4 shadow-lg hover:opacity-90 transition flex items-center gap-2 relative"
        >
          <MessageCircle size={24} />
          <span className="font-semibold">{recipient.name}</span>
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={handleOpenFullChat}>
          {recipient.avatar ? (
            <img
              src={getImageUrl(recipient.avatar, 'avatars')}
              alt={recipient.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold">
              {recipient.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-semibold">{recipient.name}</h3>
            <p className="text-xs text-white/80">Click para abrir chat completo</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="hover:bg-white/20 p-2 rounded transition"
            title="Minimizar"
          >
            <Minimize2 size={18} />
          </button>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded transition"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-primary/5 to-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
                <MessageCircle size={40} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Inicia la conversación
              </h3>
              <p className="text-sm text-gray-600">
                Envía un mensaje a {recipient.name}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn = msg.senderId === user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwn ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Mensaje a ${recipient.name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            disabled={!currentConversation || loading}
          />
          <button
            type="submit"
            disabled={!message.trim() || !currentConversation || loading}
            className="bg-gradient-to-r from-primary to-primary-dark text-white p-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default FloatingChatBubble;
