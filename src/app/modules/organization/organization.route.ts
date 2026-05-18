import { Router } from "express";
import requestValidation from "../../middlewares/requestValidation";
import { createOrganization, registerTenantValidation } from "./organization.validation";
import { OrganizationController } from "./organization.controller";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/organizations/register",
  requestValidation(registerTenantValidation),
  OrganizationController.registerTenant
);

router.get(
  "/organizations",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  OrganizationController.getOrganization
);

router.post(
  "/organizations",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(createOrganization),
  OrganizationController.CreateOrganization
);

router.put(
  "/update-organization/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(createOrganization),
  OrganizationController.updateOrganization
);

router.delete(
  "/delete-organization/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  OrganizationController.deleteOrganization
);

export const OrganizationRouter = router;