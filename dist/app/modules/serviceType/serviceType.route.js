"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceTypeRoutes = void 0;
const express_1 = require("express");
const requestValidation_1 = __importDefault(require("../../middlewares/requestValidation"));
const serviceType_controller_1 = require("./serviceType.controller");
const serviceType_validation_1 = require("./serviceType.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.get("/service-types", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), serviceType_controller_1.ServiceTypeController.getAllServiceTypes);
router.get("/service-type/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER, client_1.Role.OPERATOR), serviceType_controller_1.ServiceTypeController.getSingleServiceType);
router.post("/service-types", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(serviceType_validation_1.ServiceTypeValidation.createServiceType), serviceType_controller_1.ServiceTypeController.createServiceType);
router.put("/update-service-type/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.MANAGER), (0, requestValidation_1.default)(serviceType_validation_1.ServiceTypeValidation.updateServiceType), serviceType_controller_1.ServiceTypeController.updateServiceType);
router.delete("/delete-service-type/:id", (0, auth_1.default)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), serviceType_controller_1.ServiceTypeController.deleteServiceType);
exports.ServiceTypeRoutes = router;
