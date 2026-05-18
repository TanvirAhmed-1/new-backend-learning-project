"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CounterRoutes = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const counter_controller_1 = require("./counter.controller");
const counter_validation_1 = require("./counter.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/counters", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), counter_controller_1.CounterController.getAllCounters);
router.get("/counter/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), counter_controller_1.CounterController.getSingleCounter);
router.post("/counters", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(counter_validation_1.CounterValidation.createCounter), counter_controller_1.CounterController.createCounter);
router.put("/update-counter/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(counter_validation_1.CounterValidation.updateCounter), counter_controller_1.CounterController.updateCounter);
router.delete("/delete-counter/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), counter_controller_1.CounterController.deleteCounter);
exports.CounterRoutes = router;
