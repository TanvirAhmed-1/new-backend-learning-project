import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { ServiceTypeController } from "./serviceType.controller";
import { ServiceTypeValidation } from "./serviceType.validation";

const router = Router();

router.get("/service-types", ServiceTypeController.getAllServiceTypes);

router.get("/service-type/:id", ServiceTypeController.getSingleServiceType);

router.post(
  "/service-types",
  requestValidation(ServiceTypeValidation.createServiceType),
  ServiceTypeController.createServiceType
);

router.put(
  "/update-service-type/:id",
  requestValidation(ServiceTypeValidation.updateServiceType),
  ServiceTypeController.updateServiceType
);

router.delete(
  "/delete-service-type/:id",
  ServiceTypeController.deleteServiceType
);

export const ServiceTypeRoutes = router;