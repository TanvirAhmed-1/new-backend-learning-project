import { Router } from "express";
import { EventQuotaController } from "./eventQuota.controller";
import requestValidation from "../../middlewares/requestValidation";
import {
  createEventQuotaSchema,
  updateEventQuotaSchema,
} from "./eventQuota.validation";

const router = Router();

router.post(
  "/event-quotas",
  requestValidation(createEventQuotaSchema),
  EventQuotaController.createEventQuota
);
router.get("/event-quotas", EventQuotaController.getAllEventQuota);
router.put(
  "/update-event-quota/:eventId",
  requestValidation(updateEventQuotaSchema),
  EventQuotaController.updateEventQuota
);
router.delete("/delete-event-quota/:id", EventQuotaController.deleteEventQuota);

export const eventQuotaRoutes = router;
