import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import prisma from "../utils/prisma";

const subscriptionGuard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  // 1. If not authenticated, let auth middleware handle it or proceed
  if (!user) {
    return next();
  }

  // 2. Bypass check for SUPER_ADMIN (they rule the global SaaS platform)
  if (user.role === "SUPER_ADMIN") {
    return next();
  }

  // 3. For tenant staff, check active organization subscription
  if (user.organizationId) {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: user.organizationId },
    });

    if (!subscription) {
      return res.status(402).json({
        success: false,
        message: "No subscription found. Please contact support or purchase a plan.",
      });
    }

    const now = new Date();

    // If subscription has expired by date, update status to EXPIRED
    if (subscription.endDate < now) {
      if (subscription.status !== "EXPIRED") {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: "EXPIRED" },
        });
      }

      return res.status(402).json({
        success: false,
        message: "Your subscription has expired. Please renew your plan to continue using the ERP.",
      });
    }

    // Check for general active/trial status
    if (subscription.status !== "ACTIVE" && subscription.status !== "TRIAL") {
      return res.status(402).json({
        success: false,
        message: `Your subscription is currently ${subscription.status}. Please renew your plan to resume operations.`,
      });
    }
  }

  next();
});

export default subscriptionGuard;
