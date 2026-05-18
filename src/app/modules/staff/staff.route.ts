import { Router } from "express";
import { StaffController } from "./staff.controller";
import { StaffValidation } from "./staff.validation";
import requestValidation from "../../middlewares/requestValidation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();
router.get(
  "/staffs",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  StaffController.getStaff
);

router.post(
  "/staffs",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(StaffValidation.createStaff),
  StaffController.createStaff
);

router.post("/login", StaffController.login);

router.get(
  "/staff/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  StaffController.getSingleStaff
);

router.put(
  "/update-staff/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(StaffValidation.updateStaff),
  StaffController.updateStaff
);

router.delete(
  "/delete-staff/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  StaffController.deleteStaff
);

export const StaffRoutes = router;
