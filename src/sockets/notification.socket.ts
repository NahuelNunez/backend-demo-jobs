import { Socket } from "socket.io";
import logger from "../utils/logger";
import notificationService from "../modules/notifications/notification.service";

/**
 * Manejadores de eventos de Socket.IO para notificaciones generales
 */
export const notificationSocketHandlers = (socket: Socket) => {
  const userId = socket.data.user.userId;

  // Unirse a sala personal para notificaciones
  socket.join(`user_${userId}`);
  logger.info(`Usuario ${userId} unido a su sala de notificaciones`);

  // Marcar una notificación como leída vía socket
  socket.on("mark_notification_read", async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId, userId);
    } catch (error) {
      logger.error(`Error marcando notificación ${notificationId} como leída: ${error}`);
    }
  });

  // Marcar todas las notificaciones como leídas vía socket
  socket.on("mark_all_notifications_read", async () => {
    try {
      await notificationService.markAllAsRead(userId);
      logger.info(`Usuario ${userId} marcó todas las notificaciones como leídas`);
    } catch (error) {
      logger.error(`Error marcando todas las notificaciones como leídas: ${error}`);
    }
  });

  logger.info(`Manejadores de notificaciones registrados para usuario ${userId}`);
};
