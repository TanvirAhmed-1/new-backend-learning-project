import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { ServiceController } from "./service.controller";
import { ServiceValidation } from "./service.validation";
import { FileUploader } from "../../middlewares/fileUploader";

const router = Router();

router.get("/services", ServiceController.getServices);
router.get("/service/:id", ServiceController.getSingleService);

router.post(
  "/services",
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
  requestValidation(ServiceValidation.useServiceValidation),
  ServiceController.useService
);

router.put(
  "/update-service/:id",
  requestValidation(ServiceValidation.updateService),
  ServiceController.updateService
);

router.delete("/delete-service/:id", ServiceController.deleteService);

export const ServiceRoutes = router;