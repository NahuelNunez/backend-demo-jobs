import { Router } from "express";
import { ratingController } from "./rating.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear o actualizar una calificación (solo contratadores)
router.post("/", ratingController.createOrUpdateRating);

// Obtener todas las calificaciones de un proveedor (público para usuarios autenticados)
router.get("/:providerId", ratingController.getProviderRatings);

// Obtener mi calificación para un proveedor
router.get("/:providerId/my-rating", ratingController.getMyRatingForProvider);

// Obtener resumen de calificaciones de un proveedor
router.get("/:providerId/summary", ratingController.getRatingSummary);

// Eliminar una calificación
router.delete("/:providerId", ratingController.deleteRating);

export default router;
