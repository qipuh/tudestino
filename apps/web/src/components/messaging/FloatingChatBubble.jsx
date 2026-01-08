import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

function FloatingChatBubble({ recipient, onClose }) {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Redirigir a la página de mensajes completa con el usuario
    navigate(`/messages?user=${recipient.id}`);
    onClose();
  };

  const handleOpenFullChat = () => {
    navigate(`/messages?user=${recipient.id}`);
    onClose();
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-full p-4 shadow-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <MessageCircle size={24} />
          <span className="font-semibold">{recipient.name}</span>
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
              src={recipient.avatar}
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
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-primary/5 to-white flex items-center justify-center">
        <div className="text-center max-w-xs">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <MessageCircle size={40} className="text-primary" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Chatea con {recipient.name}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Abre el chat completo para enviar y recibir mensajes en tiempo real
          </p>
          <button
            onClick={handleOpenFullChat}
            className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-semibold py-3 px-6 rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
          >
            Abrir Chat Completo
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-white border-t">
        <p className="text-xs text-center text-gray-500">
          Usa el chat completo para una mejor experiencia de mensajería
        </p>
      </div>
    </div>
  );
}

export default FloatingChatBubble;
