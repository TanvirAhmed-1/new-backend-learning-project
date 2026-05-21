import prisma from "../../utils/prisma";
import { ICreateNotification } from "./notification.interface";

const createNotificationInDB = async (payload: ICreateNotification) => {
  const { userId, organizationId, title, message } = payload;

  // Verify User exists
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!userExists) {
    throw new Error("User not found");
  }

  // Verify Organization exists
  const orgExists = await prisma.organization.findUnique({
    where: { id: organizationId },
  });
  if (!orgExists) {
    throw new Error("Organization not found");
  }

  const result = await prisma.notification.create({
    data: {
      userId,
      organizationId,
      title,
      message,
      isRead: false,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  return result;
};

const getNotificationsFromDB = async (
  queryParams: Record<string, any>,
  organizationId: string
) => {
  const {
    isRead,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = queryParams;

  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const whereCondition: any = {
    organizationId,
  };

  if (isRead !== undefined) {
    whereCondition.isRead = isRead === "true" || isRead === true;
  }

  const data = await prisma.notification.findMany({
    where: whereCondition,
    skip,
    take,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  const total = await prisma.notification.count({
    where: whereCondition,
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPage: Math.ceil(total / Number(limit)),
    },
    data,
  };
};

const markAsReadInDB = async (notificationId: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.organizationId !== organizationId) {
    throw new Error("Notification not found or access denied");
  }

  const result = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return result;
};

const deleteNotificationFromDB = async (notificationId: string, organizationId: string) => {
  if (!organizationId) {
    throw new Error("Organization ID is required");
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.organizationId !== organizationId) {
    throw new Error("Notification not found or access denied");
  }

  const result = await prisma.notification.delete({
    where: { id: notificationId },
  });

  return result;
};

export const NotificationServices = {
  createNotificationInDB,
  getNotificationsFromDB,
  markAsReadInDB,
  deleteNotificationFromDB,
};
