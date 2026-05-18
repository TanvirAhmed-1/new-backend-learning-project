"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRoutes = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const subscription_controller_1 = require("./subscription.controller");
const subscription_validation_1 = require("./subscription.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.post("/plans", (0, auth_1.default)(client_1.Role.SUPER_ADMIN), (0, requestValidation_1.default)(subscription_validation_1.SubscriptionValidation.createPlanSchema), subscription_controller_1.SubscriptionController.createPlan);
router.get("/plans", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), subscription_controller_1.SubscriptionController.getAllPlans);
router.post("/buy", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(subscription_validation_1.SubscriptionValidation.buySubscriptionSchema), subscription_controller_1.SubscriptionController.buySubscription);
router.get("/status", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), subscription_controller_1.SubscriptionController.getOrganizationSubscription);
router.get("/status/:orgId", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), subscription_controller_1.SubscriptionController.getOrganizationSubscription);
exports.SubscriptionRoutes = router;
