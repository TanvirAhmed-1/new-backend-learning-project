import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionValidation } from "./subscription.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/plans",
  auth(Role.SUPER_ADMIN),
  requestValidation(SubscriptionValidation.createPlanSchema),
  SubscriptionController.createPlan
);

router.get(
  "/plans",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  SubscriptionController.getAllPlans
);

router.post(
  "/buy",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(SubscriptionValidation.buySubscriptionSchema),
  SubscriptionController.buySubscription
);

router.get(
  "/status",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  SubscriptionController.getOrganizationSubscription
);

router.get(
  "/status/:orgId",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  SubscriptionController.getOrganizationSubscription
);

export const SubscriptionRoutes = router;
