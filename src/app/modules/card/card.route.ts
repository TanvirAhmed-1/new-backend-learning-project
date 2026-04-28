import { Router } from "express";
import { CardController } from "./card.controller";
import requestValidation from "../../middlewares/requestValidation";
import { createCardSchema } from "./card.validation";

const router = Router();

router.post(
  "/cards",
  requestValidation(createCardSchema),
  CardController.createCard
);
router.get("/cards", CardController.getAllCards);
router.get("/card-details/:id", CardController.getSingleCardDetails);
router.get("/virtual-inactive-card", CardController.getVirtualInactiveCard);
router.delete("/delete-card/:id", CardController.deleteCard);

export const CardRoutes = router;
