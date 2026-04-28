import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { createOrganization } from "./organization.validation";
import { OrganizationController } from "./organization.controller";

const router = Router();

router.get(
  "/organizations",
  OrganizationController.getOrganization
);

router.post(
  "/organizations",
  requestValidation(createOrganization),
  OrganizationController.CreateOrganization
);

router.put(
  "/update-organization/:id",
  requestValidation(createOrganization),
  OrganizationController.updateOrganization
);

router.delete("/delete-organization/:id", OrganizationController.deleteOrganization);

export const OrganizationRouter = router;