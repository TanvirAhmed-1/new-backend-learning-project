"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualCardAccessRoutes = void 0;
const express_1 = require("express");
const virtualCardAccess_controller_1 = require("./virtualCardAccess.controller");
const router = (0, express_1.Router)();
// 📲 Send SMS manually (button click)
router.post("/virtual-card-access/:id/send-sms", virtualCardAccess_controller_1.VirtualCardAccessController.sendSMS);
// 📋 Get all virtual card access records
router.get("/virtual-card-access", virtualCardAccess_controller_1.VirtualCardAccessController.getVirtual);
exports.VirtualCardAccessRoutes = router;
