import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../modules/auth/auth.model";
import { env } from "../config/env";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Token not provided",
        error: "NO_TOKEN",
      });
      return;
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar el token
    if (!env.JWT_SECRET) {
      throw new Error("JWT_SECRET no está configurado");
    }
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    // Agregar la información del usuario a la request
    req.user = decoded;

    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
        error: "TOKEN_EXPIRED",
      });
      return;
    }

    if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        success: false,
        message: "Invalid token",
        error: "INVALID_TOKEN",
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Error verifying token",
      error: error.message,
    });
  }
};

// Middleware para verificar roles específicos
export const roleMiddleware = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
          error: "UNAUTHORIZED",
        });
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "You don't have permission to access this resource",
          error: "FORBIDDEN",
        });
        return;
      }

      next();
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Error verifying permissions",
        error: error.message,
      });
    }
  };
};
