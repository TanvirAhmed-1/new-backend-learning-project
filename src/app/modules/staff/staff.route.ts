import { Router } from "express";
import { StaffController } from "./staff.controller";
import { StaffValidation } from "./staff.validation";
import requestValidation from "../../middlewares/requestValidation";

const router = Router();
router.get("/staffs", StaffController.getStaff);

router.post(
  "/staffs",
  requestValidation(StaffValidation.createStaff),
  StaffController.createStaff
);

router.post("/login", StaffController.login);

router.get("/staff/:id", StaffController.getSingleStaff);

router.put("/update-staff/:id", StaffController.updateStaff);

router.delete("/delete-staff/:id", StaffController.deleteStaff);

export const StaffRoutes = router;
