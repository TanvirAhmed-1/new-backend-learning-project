import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { ServiceController } from "./service.controller";
import { ServiceValidation } from "./service.validation";
import { FileUploader } from "../../middlewares/fileUploader";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.get(
  "/services",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  ServiceController.getServices
);

router.get(
  "/service/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  ServiceController.getSingleService
);

router.post(
  "/services",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  FileUploader.upload("images").single("image"),
  (req, res, next) => {
    if (req.body.data) {
      try {
        req.body = JSON.parse(req.body.data);
      } catch (error) {
        return next(new Error("Invalid JSON object in 'data' field"));
      }
    }
    next();
  },
  requestValidation(ServiceValidation.createService),
  ServiceController.createService
);

router.post(
  "/use-service",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(ServiceValidation.useServiceValidation),
  ServiceController.useService
);

router.put(
  "/update-service/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(ServiceValidation.updateService),
  ServiceController.updateService
);

router.delete(
  "/delete-service/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  ServiceController.deleteService
);

export const ServiceRoutes = router;