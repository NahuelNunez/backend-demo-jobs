import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import logger from "../utils/logger";
import jwt from "jsonwebtoken";
import { registerSocketHandlers } from "../sockets";
import { env } from "./env";

/**
 * Inicializa y configura Socket.IO con el servidor HTTP
 *
 * @param httpServer - Servidor HTTP de Express
 * @returns Instancia configurada de Socket.IO Server
 */
export const initializeSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("No se proporcionó token"));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      socket.data.user = decoded;
      next();
    } catch (error) {
      next(new Error("Token inválido"));
    }
  });

  // Manejo de conexiones
  io.on("connection", (socket) => {
    const userId = socket.data.user.userId;
    logger.info(`Usuario conectado: ${userId}`);

    // Registrar todos los manejadores de eventos modulares
    registerSocketHandlers(socket);

    // Manejo de desconexión
    socket.on("disconnect", () => {
      logger.info(`Usuario desconectado: ${userId}`);
    });
  });

  return io;
};
