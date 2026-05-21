import { Router } from "express";
import { NotificationController } from "./notification.controller";
import requestValidation from "../../middlewares/requestValidation";
import { createNotificationSchema } from "./notification.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

// Create a notification (Public / open for users to notify organizations)
router.post(
  "/notifications",
  requestValidation(createNotificationSchema),
  NotificationController.createNotification
);

// Get all notifications for an organization (Staff only)
router.get(
  "/notifications",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  NotificationController.getNotifications
);

// Mark notification as read (Staff only)
router.patch(
  "/notifications/:id/read",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  NotificationController.markAsRead
);

// Delete notification (Admin / Super Admin / Manager only)
router.delete(
  "/notifications/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  NotificationController.deleteNotification
);

export const NotificationRoutes = router;
