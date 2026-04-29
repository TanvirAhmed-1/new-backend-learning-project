import { Router } from "express";
import { VirtualCardAccessController } from "./virtualCardAccess.controller";

const router = Router();

// 📲 Send SMS manually (button click)
router.post(
  "/virtual-card-access/:id/send-sms",
  VirtualCardAccessController.sendSMS,
);

// 📋 Get all virtual card access records
router.get("/virtual-card-access", VirtualCardAccessController.getVirtual);

export const VirtualCardAccessRoutes = router;
