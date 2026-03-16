import { Request, Response } from "express";
import { ratingService } from "./rating.service";

export const ratingController = {
  /**
   * Crear o actualizar una calificación
   * POST /api/ratings
   */
  async createOrUpdateRating(req: Request, res: Response) {
    try {
      const contractorUserId = req.user?.userId;
      const { providerId, rating, comment } = req.body;

      if (!providerId) {
        return res.status(400).json({
          success: false,
          message: "El ID del proveedor es requerido",
        });
      }

      if (!rating) {
        return res.status(400).json({
          success: false,
          message: "La calificación es requerida",
        });
      }

      const ratingRecord = await ratingService.createOrUpdateRating(
        contractorUserId,
        providerId,
        Number(rating),
        comment
      );

      res.status(200).json({
        success: true,
        data: ratingRecord,
        message: "Calificación guardada exitosamente",
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al crear/actualizar la calificación",
      });
    }
  },

  /**
   * Obtener todas las calificaciones de un proveedor
   * GET /api/ratings/:providerId
   */
  async getProviderRatings(req: Request, res: Response) {
    try {
      const { providerId } = req.params;

      const data = await ratingService.getProviderRatings(providerId);

      res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al obtener las calificaciones",
      });
    }
  },

  /**
   * Obtener mi calificación para un proveedor
   * GET /api/ratings/:providerId/my-rating
   */
  async getMyRatingForProvider(req: Request, res: Response) {
    try {
      const contractorUserId = req.user?.userId;
      const { providerId } = req.params;

      const rating = await ratingService.getMyRatingForProvider(
        contractorUserId,
        providerId
      );

      res.status(200).json({
        success: true,
        data: rating,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al obtener tu calificación",
      });
    }
  },

  /**
   * Eliminar una calificación
   * DELETE /api/ratings/:providerId
   */
  async deleteRating(req: Request, res: Response) {
    try {
      const contractorUserId = req.user?.userId;
      const { providerId } = req.params;

      const result = await ratingService.deleteRating(
        contractorUserId,
        providerId
      );

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al eliminar la calificación",
      });
    }
  },

  /**
   * Obtener resumen de calificaciones
   * GET /api/ratings/:providerId/summary
   */
  async getRatingSummary(req: Request, res: Response) {
    try {
      const { providerId } = req.params;

      const summary = await ratingService.getRatingSummary(providerId);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Error al obtener el resumen",
      });
    }
  },
};
