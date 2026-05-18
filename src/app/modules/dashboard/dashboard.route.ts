import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/dashboard/analytics",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  DashboardController.getDashboardStats
);

export const DashboardRoutes = router;
