import { Socket } from "socket.io";
import { chatSocketHandlers } from "./chat.socket";
import { notificationSocketHandlers } from "./notification.socket";

/**
 * Registro centralizado de todos los manejadores de eventos de Socket.IO
 *
 * Este archivo agrupa todos los módulos de eventos de socket para mantener
 * una arquitectura modular y escalable.
 */
export const registerSocketHandlers = (socket: Socket) => {
  // Registrar manejadores de chat
  chatSocketHandlers(socket);

  // Registrar manejadores de notificaciones
  notificationSocketHandlers(socket);

  // Aquí puedes agregar más módulos en el futuro:
  // postulacionSocketHandlers(socket);
  // videoCallSocketHandlers(socket);
  // etc.
};
