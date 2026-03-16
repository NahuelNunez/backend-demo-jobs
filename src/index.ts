import dotenv from "dotenv";
dotenv.config();
import { createServer } from "http";
import app from "./app";
import logger from "./utils/logger";
import { initializeSocket } from "./config/socket";
import { env } from "./config/env";

const PORT = env.PORT;

// Crear servidor HTTP
const httpServer = createServer(app);

// Inicializar Socket.IO
const io = initializeSocket(httpServer);

// Exportar io para usarlo en otros módulos
export const getIO = () => io;

const server = httpServer.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Socket.IO initialized`);

  // Conexión a la base de datos
  import("./config/prisma")
    .then(() => {
      logger.info("Connected to the database successfully.");
    })
    .catch((error) => {
      logger.error(`Database connection error: ${error.message}`);
    });
});

// Manejo de errores del servidor
server.on("error", (error: Error) => {
  logger.error(`Server error occurred: ${error.message}`);
});
