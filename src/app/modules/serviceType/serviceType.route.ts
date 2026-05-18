import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { ServiceTypeController } from "./serviceType.controller";
import { ServiceTypeValidation } from "./serviceType.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/service-types",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  ServiceTypeController.getAllServiceTypes
);

router.get(
  "/service-type/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  ServiceTypeController.getSingleServiceType
);

router.post(
  "/service-types",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(ServiceTypeValidation.createServiceType),
  ServiceTypeController.createServiceType
);

router.put(
  "/update-service-type/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(ServiceTypeValidation.updateServiceType),
  ServiceTypeController.updateServiceType
);

router.delete(
  "/delete-service-type/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  ServiceTypeController.deleteServiceType
);

export const ServiceTypeRoutes = router;