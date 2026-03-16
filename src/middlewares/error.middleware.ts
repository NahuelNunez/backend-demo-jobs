import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";
import logger from "../utils/logger";

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log del error
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Si es un CustomError, usamos su statusCode
  if (error instanceof CustomError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.name,
    });
    return;
  }

  // Error genérico
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: "INTERNAL_SERVER_ERROR",
  });
}
