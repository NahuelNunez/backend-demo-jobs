import { Request, Response, NextFunction } from "express";
import notificationService from "./notification.service";

class NotificationController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const notifications = await notificationService.getUserNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const count = await notificationService.getUnreadCount(userId);
      res.json({ success: true, data: { count } });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId;
      await notificationService.markAsRead(id, userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      await notificationService.markAllAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
