import { Router } from "express";
import { UserController } from "./user.controller";
import requestValidation from "../../middlewares/requestValidation";
import {
  applyUserPenaltySchema,
  checkoutUserSchema,
  createUserSchema,
} from "./user.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/users",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(createUserSchema),
  UserController.createUser
);
router.get(
  "/users",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  UserController.getAllUsers
);
router.get(
  "/users/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  UserController.getSingleUser
);
router.put(
  "/users/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  UserController.updateUser
);
router.delete(
  "/users/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  UserController.deleteUser
);

router.get(
  "/new-card-issued-user",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  UserController.getNewCardIssuedUser
);

router.post(
  "/checkout-user",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(checkoutUserSchema),
  UserController.checkoutUser
);

router.post(
  "/apply-penalty",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  requestValidation(applyUserPenaltySchema),
  UserController.applyUserPenalty
);

export const UserRoutes = router;
