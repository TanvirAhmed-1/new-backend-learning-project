import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { NotificationServices } from "./notification.services";

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const result = await NotificationServices.createNotificationInDB(req.body);

  res.status(httpStatus.CREATED).json({
    success: true,
    message: "Notification sent successfully",
    data: result,
  });
});

const getNotifications = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const organizationId = req.user?.organizationId;
  const result = await NotificationServices.getNotificationsFromDB(
    query,
    organizationId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Notifications fetched successfully",
    data: result,
  });
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  const result = await NotificationServices.markAsReadInDB(
    id as string,
    organizationId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Notification marked as read successfully",
    data: result,
  });
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const organizationId = req.user?.organizationId;
  const result = await NotificationServices.deleteNotificationFromDB(
    id as string,
    organizationId as string
  );

  res.status(httpStatus.OK).json({
    success: true,
    message: "Notification deleted successfully",
    data: result,
  });
});

export const NotificationController = {
  createNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
};
