import cors from "cors";
import helmet from "helmet";
import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";
import { env } from "./config/env";

const app = express();

// Middlewares básicos
app.use(helmet());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true, // Importante para cookies
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rutas principales
app.use("/api/v1", routes);

// Manejo de rutas no encontradas
app.use((req, res, next) => {
  if (!res.headersSent) {
    res.status(404).json({
      success: false,
      message: "Ruta no encontrada",
      error: "NOT_FOUND",
      path: req.path,
    });
  }
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

export default app;
