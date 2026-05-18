"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventQuotaRoutes = void 0;
const express_1 = require("express");
const eventQuota_controller_1 = require("./eventQuota.controller");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const eventQuota_validation_1 = require("./eventQuota.validation");
const router = (0, express_1.Router)();
router.post("/event-quotas", (0, requestValidation_1.default)(eventQuota_validation_1.createEventQuotaSchema), eventQuota_controller_1.EventQuotaController.createEventQuota);
router.get("/event-quotas", eventQuota_controller_1.EventQuotaController.getAllEventQuota);
router.put("/update-event-quota/:eventId", (0, requestValidation_1.default)(eventQuota_validation_1.updateEventQuotaSchema), eventQuota_controller_1.EventQuotaController.updateEventQuota);
router.delete("/delete-event-quota/:id", eventQuota_controller_1.EventQuotaController.deleteEventQuota);
exports.eventQuotaRoutes = router;
