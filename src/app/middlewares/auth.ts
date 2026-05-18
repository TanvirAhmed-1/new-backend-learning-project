import { NextFunction, Request, Response } from "express";
import catchAsync from "../utils/catchAsync";
import verifyToken from "../utils/verifyToken";
import { Role } from "@prisma/client";
import prisma from "../utils/prisma";

const auth = (...roles: Role[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization;
    console.log("Incoming Authorization Header:", token);
    if (!token) {
      throw new Error("Unauthorized Access! Token is missing.");
    }

    const decoded = verifyToken(token);
    req.user = decoded as any;

    if (roles.length && !roles.includes(decoded.role as Role)) {
      throw new Error("Forbidden Access! You do not have permission.");
    }

    // ==========================================
    // SAAS SUBSCRIPTION CHECK
    // ==========================================
    // Bypass for SUPER_ADMIN or subscription endpoints (to allow renewal/purchasing)
    const isSubscriptionRoute = 
      req.originalUrl.includes("/plans") || 
      req.originalUrl.includes("/buy") || 
      req.originalUrl.includes("/status");

    if (decoded.role !== "SUPER_ADMIN" && !isSubscriptionRoute && decoded.organizationId) {
      const subscription = await prisma.subscription.findUnique({
        where: { organizationId: decoded.organizationId },
      });

      if (!subscription) {
        return res.status(402).json({
          success: false,
          message: "No subscription found. Please contact support or purchase a plan.",
        });
      }

      const now = new Date();

      // Auto expire subscription if endDate is in the past
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

      // Block access for non-active and non-trial subscriptions
      if (subscription.status !== "ACTIVE" && subscription.status !== "TRIAL") {
        return res.status(402).json({
          success: false,
          message: `Your subscription is currently ${subscription.status}. Please renew your plan to resume operations.`,
        });
      }
    }

    next();
  });
};

export default auth;
