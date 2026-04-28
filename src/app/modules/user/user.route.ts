import { Router } from "express";
import { UserController } from "./user.controller";
import requestValidation from "../../middlewares/requestValidation";
import {
  applyUserPenaltySchema,
  checkoutUserSchema,
  createUserSchema,
} from "./user.validation";

const router = Router();

router.post(
  "/users",
  requestValidation(createUserSchema),
  UserController.createUser
);
router.get("/users", UserController.getAllUsers);
router.get("/users/:id", UserController.getSingleUser);
router.put("/users/:id", UserController.updateUser);
router.delete("/users/:id", UserController.deleteUser);

router.get("/new-card-issued-user", UserController.getNewCardIssuedUser);

router.post(
  "/checkout-user",
  requestValidation(checkoutUserSchema),
  UserController.checkoutUser
);

router.post(
  "/apply-penalty",
  requestValidation(applyUserPenaltySchema),
  UserController.applyUserPenalty
);

export const UserRoutes = router;
