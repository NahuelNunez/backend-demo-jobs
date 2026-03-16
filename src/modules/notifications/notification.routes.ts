import { Router } from "express";
import notificationController from "./notification.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.use(authMiddleware);

router.get("/", notificationController.getNotifications);
router.get("/unread-count", notificationController.getUnreadCount);
// read-all must come before /:id/read to avoid route conflict
router.patch("/read-all", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);

export default router;
