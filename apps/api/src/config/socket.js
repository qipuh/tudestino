import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io = null;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Middleware de autenticación para Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Usuario conectado: ${socket.userId}`);

    // Unir al usuario a su sala personal (para recibir mensajes)
    socket.join(`user_${socket.userId}`);

    // Evento: usuario se une a una conversación
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
      console.log(`Usuario ${socket.userId} se unió a conversación ${conversationId}`);
    });

    // Evento: usuario sale de una conversación
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
      console.log(`Usuario ${socket.userId} salió de conversación ${conversationId}`);
    });

    // Evento: usuario está escribiendo
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Evento: marcar mensaje como leído
    socket.on('mark_read', ({ conversationId, messageId }) => {
      socket.to(`conversation_${conversationId}`).emit('message_read', {
        messageId,
        readBy: socket.userId,
      });
    });

    // Desconexión
    socket.on('disconnect', () => {
      console.log(`❌ Usuario desconectado: ${socket.userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default { initializeSocket, getIO };
