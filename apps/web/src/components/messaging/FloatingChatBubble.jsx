import { useState, useEffect, useRef } from 'react';
import { X, Send, Minimize2, Maximize2, MessageCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';

function FloatingChatBubble({ recipient, onClose }) {
  const { user } = useAuthStore();
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

    // Agregar mensaje localmente (temporal - luego conectar con API)
    const newMessage = {
      id: Date.now(),
      text: message,
      senderId: user.id,
      recipientId: recipient.id,
      createdAt: new Date().toISOString(),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // TODO: Enviar mensaje al backend
    // await sendMessage(recipient.id, message);
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
        <div className="flex items-center gap-3">
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
            <p className="text-xs text-white/80">En línea</p>
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
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <MessageCircle size={48} className="mb-2" />
            <p className="text-sm">Inicia la conversación</p>
            <p className="text-xs">Envía un mensaje a {recipient.name}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  msg.isOwn
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.isOwn ? 'text-white/70' : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Mensaje a ${recipient.name}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="bg-gradient-to-r from-primary to-primary-dark text-white p-2 rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default FloatingChatBubble;
