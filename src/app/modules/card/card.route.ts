import { Router } from "express";
import { CardController } from "./card.controller";
import requestValidation from "../../middlewares/requestValidation";
import { createCardSchema } from "./card.validation";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/cards",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER),
  requestValidation(createCardSchema),
  CardController.createCard
);
router.get(
  "/cards",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  CardController.getAllCards
);
router.get(
  "/card-details/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  CardController.getSingleCardDetails
);
router.get(
  "/virtual-inactive-card",
  auth(Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.OPERATOR),
  CardController.getVirtualInactiveCard
);
router.delete(
  "/delete-card/:id",
  auth(Role.SUPER_ADMIN, Role.ADMIN),
  CardController.deleteCard
);

export const CardRoutes = router;
