import { Socket } from "socket.io";
import logger from "../utils/logger";

/**
 * Manejadores de eventos de Socket.IO para el módulo de chat
 */
export const chatSocketHandlers = (socket: Socket) => {
  const userId = socket.data.user.userId;

  // Unirse a una sala de chat
  socket.on("join_chat", (chatId: string) => {
    socket.join(`chat_${chatId}`);
    logger.info(`Usuario ${userId} se unió al chat ${chatId}`);

    // Notificar a otros usuarios en el chat
    socket.to(`chat_${chatId}`).emit("user_joined", {
      userId,
      chatId,
      timestamp: new Date(),
    });
  });

  // Salir de una sala de chat
  socket.on("leave_chat", (chatId: string) => {
    socket.leave(`chat_${chatId}`);
    logger.info(`Usuario ${userId} salió del chat ${chatId}`);

    // Notificar a otros usuarios en el chat
    socket.to(`chat_${chatId}`).emit("user_left", {
      userId,
      chatId,
      timestamp: new Date(),
    });
  });

  // Usuario está escribiendo
  socket.on("typing", (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit("user_typing", {
      userId,
      chatId: data.chatId,
    });
  });

  // Usuario dejó de escribir
  socket.on("stop_typing", (data: { chatId: string }) => {
    socket.to(`chat_${data.chatId}`).emit("user_stop_typing", {
      userId,
      chatId: data.chatId,
    });
  });

  // Marcar mensajes como leídos
  socket.on(
    "mark_as_read",
    (data: { chatId: string; messageIds: string[] }) => {
      socket.to(`chat_${data.chatId}`).emit("messages_read", {
        userId,
        chatId: data.chatId,
        messageIds: data.messageIds,
        timestamp: new Date(),
      });
    }
  );

  logger.info(`Manejadores de chat registrados para usuario ${userId}`);
};
